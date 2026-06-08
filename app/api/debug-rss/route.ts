import { NextResponse } from 'next/server'
import { debugAllSources } from '@/lib/rss'

// GET /api/debug-rss — בדיקת כל מקורות ה-RSS מהשרת
// אין auth — לשימוש ידני לאבחון בלבד
export async function GET() {
  const results = await debugAllSources()
  return NextResponse.json({ checked_at: new Date().toISOString(), results })
}
