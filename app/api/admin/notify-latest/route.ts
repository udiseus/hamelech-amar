import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendNewTweetNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { data: latestTweet } = await supabaseAdmin
    .from('matched_tweets')
    .select('*')
    .order('count_number', { ascending: false })
    .limit(1)
    .single()

  if (!latestTweet) {
    return NextResponse.json({ error: 'No tweets found' }, { status: 404 })
  }

  const { data: confirmedSubscribers } = await supabaseAdmin
    .from('subscribers')
    .select('email')
    .eq('confirmed', true)
    .is('unsubscribed_at', null)

  const emails = confirmedSubscribers?.map((s) => s.email) ?? []

  if (emails.length === 0) {
    return NextResponse.json({ message: 'No confirmed subscribers' })
  }

  await sendNewTweetNotification(emails, latestTweet, latestTweet.count_number)

  return NextResponse.json({ notified: emails.length, tweet_id: latestTweet.tweet_id })
}
