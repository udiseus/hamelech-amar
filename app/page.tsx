import { Suspense } from 'react'
import { getSupabase } from '@/lib/supabase'
import Counter from '@/components/Counter'
import DaysSince from '@/components/DaysSince'
import LastTweet from '@/components/LastTweet'
import SubscribeBox from '@/components/SubscribeBox'
import Timeline from '@/components/Timeline'
import type { MatchedTweet } from '@/lib/supabase'
import LiveRefresh from '@/components/LiveRefresh'

export const dynamic = 'force-dynamic'

async function getData() {
  const supabase = getSupabase()
  const [countResult, archiveResult] = await Promise.all([
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

  const latestTweet: MatchedTweet | null = countResult.data ?? null
  const totalCount = latestTweet?.count_number ?? 0
  const archive: MatchedTweet[] = archiveResult.data ?? []

  return { totalCount, latestTweet, archive }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; unsubscribed?: string }>
}) {
  const { totalCount, latestTweet, archive } = await getData()
  const params = await searchParams
  const updatedAt = new Date().toISOString()

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <header className="text-center pt-4 fade-in-up">
          <div className="text-5xl mb-2">👑</div>
          <h1
            className="font-black mb-2"
            style={{
              fontSize: 'clamp(36px, 8vw, 56px)',
              color: 'var(--gold)',
              textShadow: '0 0 30px rgba(226,201,126,0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            המלך אמר
          </h1>
          <p className="text-base md:text-lg" style={{ color: 'var(--purple-pale)' }}>
            מונה ההופעות הרשמי של המשפט:{' '}
            <strong style={{ color: 'var(--text-main)' }}>&ldquo;טראמפ אמר לי&rdquo;</strong>
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            כי אם טראמפ אמר לברק — מגיע גם לנו לדעת.
          </p>
        </header>

        {/* Confirmation / unsubscribe banners */}
        {params.confirmed === 'true' && (
          <div className="text-center py-3 px-4 rounded-xl font-medium text-sm"
            style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--purple-pale)', border: '1px solid var(--purple-bright)' }}>
            ✓ ההרשמה אושרה! נעדכן אתכם כשהמלך ידבר שוב.
          </div>
        )}
        {params.confirmed === 'error' && (
          <div className="text-center py-3 px-4 rounded-xl font-medium text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
            לינק האישור לא תקין או פג תוקפו.
          </div>
        )}
        {params.unsubscribed === 'true' && (
          <div className="text-center py-3 px-4 rounded-xl font-medium text-sm"
            style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--text-muted)', border: '1px solid rgba(124,58,237,0.3)' }}>
            הסרתם מהרשימה. להתראות.
          </div>
        )}

        {/* Counter */}
        <Counter count={totalCount} updatedAt={updatedAt} />

        {/* Days since last mention */}
        <DaysSince
          latestTweetDate={latestTweet?.created_at ?? null}
          totalCount={totalCount}
        />

        {/* Last tweet */}
        <LastTweet tweet={latestTweet} />

        {/* Subscribe */}
        <SubscribeBox />

        {/* Timeline */}
        <Suspense fallback={null}>
          <Timeline tweets={archive} />
        </Suspense>

        {/* Footer */}
        <footer className="text-center text-xs pb-6" style={{ color: 'var(--text-muted)' }}>
          <p>
            פרויקט סאטירי. אין קשר רשמי לברק רביד.{' '}
            <a
              href="https://x.com/BarakRavid"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--purple-light)' }}
            >
              @BarakRavid
            </a>
          </p>
        </footer>
      </div>

      {/* Client-side live refresh every 5 minutes */}
      <LiveRefresh />
    </div>
  )
}
