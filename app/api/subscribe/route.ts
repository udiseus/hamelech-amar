import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendConfirmationEmail, sendOwnerNotification } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'כתובת מייל לא תקינה' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  const normalizedEmail = email.toLowerCase().trim()

  const { data: existing } = await supabaseAdmin
    .from('subscribers')
    .select('id, confirmed, unsubscribed_at')
    .eq('email', normalizedEmail)
    .single()

  if (existing) {
    if (existing.confirmed && !existing.unsubscribed_at) {
      return NextResponse.json({ message: 'כבר רשומים! נעדכן אתכם כשהמלך ידבר.' }, { status: 200 })
    }
    const token = randomBytes(32).toString('hex')
    await supabaseAdmin
      .from('subscribers')
      .update({ unsubscribed_at: null, confirmed: false, confirmation_token: token })
      .eq('email', normalizedEmail)
    await sendConfirmationEmail(normalizedEmail, token)
    try { await sendOwnerNotification(normalizedEmail) } catch (e) { console.error('[Owner notify] failed:', e) }
    return NextResponse.json({ message: 'שלחנו מייל אישור. בדקו את תיבת הדואר.' })
  }

  const token = randomBytes(32).toString('hex')
  const { error } = await supabaseAdmin.from('subscribers').insert({
    email: normalizedEmail,
    confirmed: false,
    confirmation_token: token,
  })

  if (error) {
    console.error('Subscribe insert error:', error)
    return NextResponse.json({ error: 'שגיאה בשמירת הנרשם. נסו שוב.' }, { status: 500 })
  }

  try {
    await sendConfirmationEmail(normalizedEmail, token)
  } catch (emailErr) {
    console.error('[subscribe] Failed to send confirmation email:', emailErr)
    // מחיקת הרשמה כדי שהמשתמש יוכל לנסות שוב
    await supabaseAdmin.from('subscribers').delete().eq('email', normalizedEmail)
    return NextResponse.json({ error: 'שגיאה בשליחת מייל אישור. נסו שוב בעוד כמה דקות.' }, { status: 500 })
  }

  // שלח התראה לבעל האתר — אם נכשל, לא שוברים את ההרשמה
  try { await sendOwnerNotification(normalizedEmail) } catch (e) { console.error('[Owner notify] failed:', e) }

  return NextResponse.json({ message: 'שלחנו מייל אישור. בדקו את תיבת הדואר.' })
}
