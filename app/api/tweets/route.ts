import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabase()

  const [countResult, latestResult, archiveResult] = await Promise.all([
    supabase
      .from('matched_tweets')
      .select('count_number')
      .order('count_number', { ascending: false })
      .limit(1)
      .single(),

    supabase
      .from('matched_tweets')
      .select('*')
      .order('count_number', { ascending: false })
      .limit(1)
      .single(),

    supabase
      .from('matched_tweets')
      .select('*')
      .order('count_number', { ascending: false })
      .limit(50),
  ])

  const totalCount = countResult.data?.count_number ?? 0
  const latestTweet = latestResult.data ?? null
  const archive = archiveResult.data ?? []

  return NextResponse.json({
    totalCount,
    latestTweet,
    archive,
    updatedAt: new Date().toISOString(),
  })
}
