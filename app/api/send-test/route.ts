import { NextResponse } from 'next/server'
import { sendConfirmationEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Temporary test endpoint - DELETE after testing
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  const token = randomBytes(32).toString('hex')
  try {
    await sendConfirmationEmail('udi.jonas@gmail.com', token)
    return NextResponse.json({ ok: true, message: 'Test email sent!' }, { headers: CORS })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500, headers: CORS })
  }
}
