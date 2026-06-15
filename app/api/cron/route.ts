import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { fetchNewTweets } from '@/lib/rss'
import { sendNewTweetNotification } from '@/lib/email'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabaseAdmin = getSupabaseAdmin()

  try {
    const candidates = await fetchNewTweets()

    if (candidates.length === 0) {
      return NextResponse.json({ message: 'No matched tweets in feed', checked_at: new Date().toISOString() })
    }

    // Sort chronologically before inserting
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

      // Insert with placeholder count_number=0 — will be fixed by reassignment below
      const { error } = await supabaseAdmin.from('matched_tweets').insert({
        tweet_id: tweet.tweet_id,
        text: tweet.text,
        created_at: tweet.created_at,
        url: tweet.url,
        matched_phrase: tweet.matched_phrase,
        count_number: 0,
        detected_at: new Date().toISOString(),
      })

      if (!error) inserted.push(tweet)
    }

    if (inserted.length === 0) {
      return NextResponse.json({ message: 'All tweets already in DB' })
    }

    // Reassign ALL count_numbers chronologically
    const { data: allTweets } = await supabaseAdmin
      .from('matched_tweets')
      .select('id, created_at')
      .order('created_at', { ascending: true })

    if (allTweets) {
      await Promise.all(
        allTweets.map((t, i) =>
          supabaseAdmin
            .from('matched_tweets')
            .update({ count_number: i + 1 })
            .eq('id', t.id)
        )
      )
    }

    const newTotal = allTweets?.length ?? 0

    // Notify subscribers
    const { data: confirmedSubscribers } = await supabaseAdmin
      .from('subscribers')
      .select('email')
      .eq('confirmed', true)
      .is('unsubscribed_at', null)

    const emails = confirmedSubscribers?.map((s) => s.email) ?? []

    if (emails.length > 0) {
      // Send notification for the most recent tweet by actual date
      const { data: latestByDate } = await supabaseAdmin
        .from('matched_tweets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (latestByDate) {
        await sendNewTweetNotification(emails, latestByDate, latestByDate.count_number)
      }
    }

    return NextResponse.json({
      inserted: inserted.length,
      new_total: newTotal,
      notified: emails.length,
    })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
