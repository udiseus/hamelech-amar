import { Resend } from 'resend'
import type { MatchedTweet } from './supabase'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

function getFrom() {
  return process.env.RESEND_FROM_EMAIL!
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL!
}

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmUrl = `${getAppUrl()}/api/confirm?token=${token}`

  await getResend().emails.send({
    from: getFrom(),
    to: email,
    subject: 'אשרו את ההרשמה — המלך אמר',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0533; color: #e2c97e; padding: 40px; border-radius: 12px;">
        <h1 style="color: #e2c97e; text-align: center; font-size: 28px;">👑 המלך אמר</h1>
        <p style="font-size: 18px; text-align: center;">כמעט סיימתם!</p>
        <p style="font-size: 16px;">לחצו על הכפתור כדי לאשר את ההרשמה לעדכונים מהממלכה:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" style="background: #e2c97e; color: #1a0533; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: bold;">
            אשר הרשמה
          </a>
        </div>
        <p style="font-size: 13px; color: #9b7fd4; text-align: center;">
          תקבלו מייל רק כשנספר ציוץ חדש. לא נציק — המלך עושה את זה בשבילנו.
        </p>
      </div>
    `,
  })
}

export async function sendNewTweetNotification(
  emails: string[],
  tweet: MatchedTweet,
  totalCount: number
) {
  if (emails.length === 0) return

  const appUrl = getAppUrl()
  const tweetPreview = tweet.text.length > 200 ? tweet.text.slice(0, 200) + '...' : tweet.text

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0533; color: #e2c97e; padding: 40px; border-radius: 12px;">
      <h1 style="color: #e2c97e; text-align: center; font-size: 28px;">👑 המלך אמר שוב</h1>
      <p style="font-size: 20px; text-align: center;">הודעה דחופה מהממלכה:</p>
      <p style="font-size: 18px; text-align: center; color: #c4b5fd;">ברק רביד דיווח.</p>
      <div style="background: #2d1054; border: 1px solid #7c3aed; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="font-size: 16px; margin: 0; line-height: 1.7;">"${tweetPreview}"</p>
      </div>
      <p style="font-size: 22px; text-align: center; color: #e2c97e;">
        הקאונטר עלה ל־<strong style="font-size: 36px;">${totalCount}</strong>
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${tweet.url}" style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 16px; margin: 0 8px; display: inline-block;">
          לציוץ ב־X
        </a>
        <a href="${appUrl}" style="background: #e2c97e; color: #1a0533; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; margin: 0 8px; display: inline-block;">
          לעמוד המלך אמר
        </a>
      </div>
      <p style="font-size: 12px; color: #6b21a8; text-align: center; margin-top: 40px;">
        לא רוצים יותר עדכונים? <a href="${appUrl}/api/unsubscribe?email=${encodeURIComponent('')}" style="color: #9b7fd4;">הסר הרשמה</a>
      </p>
    </div>
  `

  const resend = getResend()
  const from = getFrom()
  const BATCH_SIZE = 100

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map((email) =>
        resend.emails.send({
          from,
          to: email,
          subject: `המלך אמר שוב — קאונטר: ${totalCount}`,
          html,
        })
      )
    )
  }
}
