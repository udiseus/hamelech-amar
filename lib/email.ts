import { Resend } from 'resend'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodemailer = require('nodemailer') as typeof import('nodemailer')
import type { MatchedTweet } from './supabase'

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://hamelech-amar.vercel.app'
}

function useGmail() {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
}

function getGmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
  })
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

function getResendFrom() {
  return process.env.RESEND_FROM_EMAIL || 'HaMelech Amar <hamelech@udijonas.com>'
}

function getGmailFrom() {
  return `"ÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂ¨" <${process.env.GMAIL_USER}>`
}

async function sendEmail(to: string, subject: string, html: string) {
  if (useGmail()) {
    const transporter = getGmailTransporter()
    const info = await transporter.sendMail({
      from: getGmailFrom(),
      to,
      subject,
      html,
    })
    console.log('[Gmail] Sent OK, messageId:', info.messageId)
  } else {
    const { data, error } = await getResend().emails.send({
      from: getResendFrom(),
      to,
      subject,
      html,
    })
    if (error) {
      console.error('[Resend] Error:', JSON.stringify(error))
      throw new Error(`Resend failed: ${error.message}`)
    }
    console.log('[Resend] Sent OK, id:', data?.id)
  }
}

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmUrl = `${getAppUrl()}/api/confirm?token=${token}`

  await sendEmail(
    email,
    'ÃÂÃÂ©ÃÂ¨ÃÂ ÃÂÃÂª ÃÂÃÂÃÂ¨ÃÂ©ÃÂÃÂ Ã¢ÂÂ ÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂ¨',
    `<meta charset="utf-8">
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0533; color: #e2c97e; padding: 40px; border-radius: 12px;">
        <h1 style="color: #e2c97e; text-align: center; font-size: 28px;">Ã°ÂÂÂ ÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂ¨</h1>
        <p style="font-size: 18px; text-align: center;">ÃÂÃÂÃÂ¢ÃÂ ÃÂ¡ÃÂÃÂÃÂÃÂªÃÂ!</p>
        <p style="font-size: 16px;">ÃÂÃÂÃÂ¦ÃÂ ÃÂ¢ÃÂ ÃÂÃÂÃÂ¤ÃÂªÃÂÃÂ¨ ÃÂÃÂÃÂ ÃÂÃÂÃÂ©ÃÂ¨ ÃÂÃÂª ÃÂÃÂÃÂ¨ÃÂ©ÃÂÃÂ ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ ÃÂÃÂ ÃÂÃÂÃÂÃÂÃÂÃÂÃÂ:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" style="background: #e2c97e; color: #1a0533; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: bold;">
            ÃÂÃÂ©ÃÂ¨ ÃÂÃÂ¨ÃÂ©ÃÂÃÂ
          </a>
        </div>
        <p style="font-size: 13px; color: #9b7fd4; text-align: center;">
          ÃÂªÃÂ§ÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂ ÃÂ¨ÃÂ§ ÃÂÃÂ©ÃÂ ÃÂ¡ÃÂ¤ÃÂ¨ ÃÂ¦ÃÂÃÂÃÂ¥ ÃÂÃÂÃÂ©. ÃÂÃÂ ÃÂ ÃÂ¦ÃÂÃÂ§ Ã¢ÂÂ ÃÂÃÂÃÂÃÂ ÃÂ¢ÃÂÃÂ©ÃÂ ÃÂÃÂª ÃÂÃÂ ÃÂÃÂ©ÃÂÃÂÃÂÃÂ ÃÂ.
        </p>
      </div>
    `
  )
}

export async function sendNewTweetNotification(
  emails: string[],
  tweet: MatchedTweet,
  totalCount: number
) {
  if (emails.length === 0) return

  const appUrl = getAppUrl()
  const tweetPreview = tweet.text.length > 200 ? tweet.text.slice(0, 200) + '...' : tweet.text

  const makeHtml = (email: string) => `<meta charset="utf-8">
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0533; color: #e2c97e; padding: 40px; border-radius: 12px;">
      <h1 style="color: #e2c97e; text-align: center; font-size: 28px;">Ã°ÂÂÂ ÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂ¨ ÃÂ©ÃÂÃÂ</h1>
      <p style="font-size: 20px; text-align: center;">ÃÂÃÂÃÂÃÂ¢ÃÂ ÃÂÃÂÃÂÃÂ¤ÃÂ ÃÂÃÂÃÂÃÂÃÂÃÂÃÂ:</p>
      <p style="font-size: 18px; text-align: center; color: #c4b5fd;">ÃÂÃÂ¨ÃÂ§ ÃÂ¨ÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂÃÂ.</p>
      <div style="background: #2d1054; border: 1px solid #7c3aed; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="font-size: 16px; margin: 0; line-height: 1.7;">"${tweetPreview}"</p>
      </div>
      <p style="font-size: 22px; text-align: center; color: #e2c97e;">
        ÃÂÃÂ§ÃÂÃÂÃÂ ÃÂÃÂ¨ ÃÂ¢ÃÂÃÂ ÃÂÃÂ¾<strong style="font-size: 36px;">${totalCount}</strong>
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${tweet.url}" style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 16px; margin: 0 8px; display: inline-block;">
          ÃÂÃÂ¦ÃÂÃÂÃÂ¥ ÃÂÃÂ¾X
        </a>
        <a href="${appUrl}" style="background: #e2c97e; color: #1a0533; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; margin: 0 8px; display: inline-block;">
          ÃÂÃÂ¢ÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂ¨
        </a>
      </div>
      <p style="font-size: 12px; color: #6b21a8; text-align: center; margin-top: 40px;">
        ÃÂÃÂ ÃÂ¨ÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂÃÂªÃÂ¨ ÃÂ¢ÃÂÃÂÃÂÃÂ ÃÂÃÂ? <a href="${appUrl}/api/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9b7fd4;">ÃÂÃÂ¡ÃÂ¨ ÃÂÃÂ¨ÃÂ©ÃÂÃÂ</a>
      </p>
    </div>
  `

  const subject = `ÃÂÃÂÃÂÃÂ ÃÂÃÂÃÂ¨ ÃÂ©ÃÂÃÂ Ã¢ÂÂ ÃÂ§ÃÂÃÂÃÂ ÃÂÃÂ¨: ${totalCount}`

  if (useGmail()) {
    const transporter = getGmailTransporter()
    const from = getGmailFrom()
    const BATCH_SIZE = 20
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)
      await Promise.all(
        batch.map(async (email) => {
          try {
            const info = await transporter.sendMail({ from, to: email, subject, html: makeHtml(email) })
            console.log(`[Gmail] Sent to ${email}, messageId: ${info.messageId}`)
          } catch (err) {
            console.error(`[Gmail] Error sending to ${email}:`, err)
          }
        })
      )
    }
  } else {
    const resend = getResend()
    const from = getResendFrom()
    const BATCH_SIZE = 100
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)
      await Promise.all(
        batch.map(async (email) => {
          const { data, error } = await resend.emails.send({ from, to: email, subject, html: makeHtml(email) })
          if (error) {
            console.error(`[Resend] Error sending to ${email}:`, JSON.stringify(error))
          } else {
            console.log(`[Resend] Sent to ${email}, id: ${data?.id}`)
          }
        })
      )
    }
  }
}
