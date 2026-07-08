import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const UPDATES = [
  {
    tweet_id: '2073793434758807856',
    text: '🇮🇱🇺🇸Netanyahu responded in an interview on Fox news today:',
  },
  {
    tweet_id: '2073583953122922616',
    text: 'נדמה שבכל התבטאות על נתניהו טראמפ טורח להשחיל מסר משפיל. נקווה שלא יעשה לו בפגישה בחדר הסגלגל ״זובור בסגנון זלנסקי״ למרות שנתניהו יבוא מעונב עם החליפה הטובה ביותר שלו אחרי שהחלופה שלו מול איראן התבררה כעורבא פרח.',
  },
]

export async function GET() {
  const supabase = getSupabaseAdmin()
  const results = []
  for (const u of UPDATES) {
    const { error } = await supabase
      .from('matched_tweets')
      .update({ text: u.text })
      .eq('tweet_id', u.tweet_id)
    results.push({ tweet_id: u.tweet_id, ok: !error, err: error?.message })
  }
  return NextResponse.json({ results })
}
