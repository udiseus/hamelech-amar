import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabaseAdmin()
  const ids = ['2073793434758807856', '2073583953122922616']
  const results = []
  for (const tweet_id of ids) {
    const { error } = await supabase
      .from('matched_tweets')
      .delete()
      .eq('tweet_id', tweet_id)
    results.push({ tweet_id, ok: !error, err: error?.message })
  }
  return NextResponse.json({ results })
}
