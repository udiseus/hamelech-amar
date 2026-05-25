import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendConfirmationEmail } from '@/lib/email'
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
    try {
      await sendConfirmationEmail(normalizedEmail, token)
    } catch (e) {
      console.error('[subscribe] email send failed:', e)
      return NextResponse.json({ error: 'שגיאה בשליחת מייל. נסו שוב.' }, { status: 500 })
    }
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
  } catch (e) {
    console.error('[subscribe] email send failed:', e)
    return NextResponse.json({ error: 'שגיאה בשליחת מייל. נסו שוב.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'שלחנו מייל אישור. בדקו את תיבת הדואר.' })
}
