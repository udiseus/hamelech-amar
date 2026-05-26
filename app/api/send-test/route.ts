import { NextResponse } from 'next/server'
import { sendOwnerNotification } from '@/lib/email'

// בדיקת שליחת מייל התראה לבעל האתר
export async function GET() {
  try {
    await sendOwnerNotification('test-subscriber@example.com')
    return NextResponse.json({ ok: true, message: 'Owner notification test sent to owner email' })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
