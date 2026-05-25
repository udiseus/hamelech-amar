import { NextResponse } from 'next/server'
import { sendConfirmationEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

// Temporary test endpoint - DELETE after testing
export async function GET() {
  const token = randomBytes(32).toString('hex')
  try {
    await sendConfirmationEmail('udi.jonas@gmail.com', token)
    return NextResponse.json({ ok: true, message: 'Test email sent to udi.jonas@gmail.com' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
