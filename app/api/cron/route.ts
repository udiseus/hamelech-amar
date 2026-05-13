import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { fetchNewTweets } from '@/lib/rss'
import { sendNewTweetNotification } from '@/lib/email'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  try {
    const { data: latestSaved } = await supabaseAdmin
      .from('matched_tweets')
      .select('tweet_id, count_number')
      .order('count_number', { ascending: false })
      .limit(1)
      .single()

    let currentCount = latestSaved?.count_number ?? 0

    const candidates = await fetchNewTweets()

    if (candidates.length === 0) {
      return NextResponse.json({ message: 'No matched tweets in feed', checked_at: new Date().toISOString() })
    }

    candidates.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const inserted: typeof candidates = []

    for (const tweet of candidates) {
      const { data: existing } = await supabaseAdmin
        .from('matched_tweets')
        .select('id')
        .eq('tweet_id', tweet.tweet_id)
        .single()

      if (existing) continue

      currentCount += 1
      const { error } = await supabaseAdmin.from('matched_tweets').insert({
        tweet_id: tweet.tweet_id,
        text: tweet.text,
        created_at: tweet.created_at,
        url: tweet.url,
        matched_phrase: tweet.matched_phrase,
        count_number: currentCount,
        detected_at: new Date().toISOString(),
      })

      if (!error) inserted.push(tweet)
    }

    if (inserted.length === 0) {
      return NextResponse.json({ message: 'All tweets already in DB' })
    }

    const { data: confirmedSubscribers } = await supabaseAdmin
      .from('subscribers')
      .select('email')
      .eq('confirmed', true)
      .is('unsubscribed_at', null)

    const emails = confirmedSubscribers?.map((s) => s.email) ?? []

    if (emails.length > 0) {
      const { data: latestInserted } = await supabaseAdmin
        .from('matched_tweets')
        .select('*')
        .order('count_number', { ascending: false })
        .limit(1)
        .single()

      if (latestInserted) {
        await sendNewTweetNotification(emails, latestInserted, latestInserted.count_number)
      }
    }

    return NextResponse.json({
      inserted: inserted.length,
      new_count: currentCount,
      notified: emails.length,
    })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
