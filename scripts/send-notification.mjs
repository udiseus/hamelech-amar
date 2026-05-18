import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hamelech-amar.vercel.app'

if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_KEY || !FROM_EMAIL) {
  console.error('Missing env vars. Run with:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... RESEND_API_KEY=... RESEND_FROM_EMAIL=... node scripts/send-notification.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const resend = new Resend(RESEND_KEY)

const { data: tweet } = await supabase
  .from('matched_tweets')
  .select('*')
  .order('count_number', { ascending: false })
  .limit(1)
  .single()

if (!tweet) { console.error('No tweets found'); process.exit(1) }

const { data: subs } = await supabase
  .from('subscribers')
  .select('email')
  .eq('confirmed', true)
  .is('unsubscribed_at', null)

const emails = subs?.map(s => s.email) ?? []
if (emails.length === 0) { console.log('No confirmed subscribers'); process.exit(0) }

const preview = tweet.text.length > 200 ? tweet.text.slice(0, 200) + '...' : tweet.text
const html = `
<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a0533;color:#e2c97e;padding:40px;border-radius:12px;">
  <h1 style="color:#e2c97e;text-align:center;font-size:28px;">👑 המלך אמר שוב</h1>
  <div style="background:#2d1054;border:1px solid #7c3aed;border-radius:8px;padding:20px;margin:24px 0;">
    <p style="font-size:16px;margin:0;line-height:1.7;">"${preview}"</p>
  </div>
  <p style="font-size:22px;text-align:center;">הקאונטר עלה ל־<strong style="font-size:36px;">${tweet.count_number}</strong></p>
  <div style="text-align:center;margin:30px 0;">
    <a href="${tweet.url}" style="background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:16px;margin:0 8px;display:inline-block;">לציוץ ב־X</a>
    <a href="${APP_URL}" style="background:#e2c97e;color:#1a0533;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;margin:0 8px;display:inline-block;">לעמוד המלך אמר</a>
  </div>
</div>`

console.log(`Sending to ${emails.length} subscribers...`)

for (let i = 0; i < emails.length; i += 100) {
  const batch = emails.slice(i, i + 100)
  await Promise.all(batch.map(email =>
    resend.emails.send({ from: FROM_EMAIL, to: email, subject: `המלך אמר שוב — קאונטר: ${tweet.count_number}`, html })
  ))
}

console.log(`Done! Sent to ${emails.length} subscribers.`)
