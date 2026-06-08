import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendNewTweetNotification } from '@/lib/email'

// GET /api/send-notification?count=24
// Sends email notification for a tweet by count_number.
// Use this to manually notify subscribers when a tweet was added directly to DB.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const count = parseInt(searchParams.get('count') ?? '0')

  if (!count) {
    return NextResponse.json({ error: 'Missing ?count= param (e.g. ?count=24)' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: tweet } = await supabase
    .from('matched_tweets')
    .select('*')
    .eq('count_number', count)
    .single()

  if (!tweet) {
    return NextResponse.json({ error: `Tweet #${count} not found in DB` }, { status: 404 })
  }

  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('email')
    .eq('confirmed', true)
    .is('unsubscribed_at', null)

  const emails = (subscribers ?? []).map((s: { email: string }) => s.email)

  if (emails.length === 0) {
    return NextResponse.json({ message: 'No confirmed subscribers to notify' })
  }

  await sendNewTweetNotification(emails, tweet, tweet.count_number)

  return NextResponse.json({
    sent: emails.length,
    tweet_id: tweet.tweet_id,
    count_number: tweet.count_number,
    text: tweet.text,
  })
}
