import { NextResponse } from 'next/server'

const CORS = { 'Access-Control-Allow-Origin': '*' };

export async function GET() {
  return NextResponse.json({
    from: process.env.RESEND_FROM_EMAIL || 'NOT SET',
    apiKey: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.slice(0,8) + '...' : 'NOT SET',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
  }, { headers: CORS })
}
