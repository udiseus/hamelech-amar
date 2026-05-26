import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// endpoint זמני להכנסת ציוצים חסרים ל-DB — ניתן למחוק לאחר שימוש
export async function POST(req: NextRequest) {
  // אמות בעזרת סוד פשוט
  const secret = req.headers.get('x-backfill-secret')
  if (secret !== 'hamelech2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  // מצא את מספר הציוץ הגבוה ביותר שיש כבר ב-DB
  const { data: latest } = await supabaseAdmin
    .from('matched_tweets')
    .select('count_number')
    .order('count_number', { ascending: false })
    .limit(1)
    .single()

  let currentCount = latest?.count_number ?? 0

  // קבל רשימת ציוצים מהגוף של הבקשה
  const body = await req.json()
  const tweets: Array<{
    tweet_id: string
    text: string
    created_at: string
    url: string
    matched_phrase: string
  }> = body.tweets ?? []

  if (!tweets.length) {
    return NextResponse.json({ error: 'No tweets provided' }, { status: 400 })
  }

  // מיין לפי תאריך כדי שמספרי הסדר יהיו נכונים
  tweets.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const inserted: string[] = []
  const skipped: string[] = []

  for (const tweet of tweets) {
    // בדוק אם הציוץ כבר קיים
    const { data: existing } = await supabaseAdmin
      .from('matched_tweets')
      .select('id')
      .eq('tweet_id', tweet.tweet_id)
      .single()

    if (existing) {
      skipped.push(tweet.tweet_id)
      continue
    }

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

    if (error) {
      return NextResponse.json({ error: error.message, tweet_id: tweet.tweet_id }, { status: 500 })
    }

    inserted.push(tweet.tweet_id)
  }

  return NextResponse.json({
    inserted: inserted.length,
    skipped: skipped.length,
    new_count: currentCount,
    inserted_ids: inserted,
  })
}
