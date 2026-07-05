import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const TWEETS = [
  { tweet_id: '2073449092483584177', text: 'Exclusive: President Trump tells me Netanyahu "knows who the boss is" ahead of possible White House visit next week.', url: 'https://x.com/BarakRavid/status/2073449092483584177', created_at: '2026-07-04T16:49:00+00:00', count_number: 45, matched_phrase: 'trump tells me' },
  { tweet_id: '2073449563889803525', text: '"הוא יודע מי הבוס": טראמפ אמר לי בראיון כי נתניהו עשוי לבקר בבית הלבן כבר בשבוע הבא', url: 'https://x.com/BarakRavid/status/2073449563889803525', created_at: '2026-07-04T16:51:00+00:00', count_number: 46, matched_phrase: 'טראמפ אמר לי' },
  { tweet_id: '2073453761842839783', text: 'טראמפ אמר לי: "אנחנו מסתדרים מצוין. נתניהו יודע מי הבוס"', url: 'https://x.com/BarakRavid/status/2073453761842839783', created_at: '2026-07-04T17:07:00+00:00', count_number: 47, matched_phrase: 'טראמפ אמר לי' },
  { tweet_id: '2073482871134683223', text: '"We get along very good. Netanyahu knows who the boss is," Trump said in a brief phone interview', url: 'https://x.com/BarakRavid/status/2073482871134683223', created_at: '2026-07-04T19:03:00+00:00', count_number: 48, matched_phrase: 'trump said' },
]

export async function GET() {
  const supabase = getSupabaseAdmin()
  const results = []
  for (const t of TWEETS) {
    const { error } = await supabase.from('matched_tweets').insert(t)
    results.push({ tweet_id: t.tweet_id, count: t.count_number, ok: !error, err: error?.message })
  }
  return NextResponse.json({ results })
}
