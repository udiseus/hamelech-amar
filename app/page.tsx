import { Suspense } from 'react'
import { getSupabase } from '@/lib/supabase'
import Counter from '@/components/Counter'
import DaysSince from '@/components/DaysSince'
import LastTweet from '@/components/LastTweet'
import SubscribeBox from '@/components/SubscribeBox'
import Timeline from '@/components/Timeline'
import type { MatchedTweet } from '@/lib/supabase'
import LiveRefresh from '@/components/LiveRefresh'
import ShareButtons from '@/components/ShareButtons'

export const dynamic = 'force-dynamic'

function getMoodColor(latestTweetDate: string | null): string {
  if (!latestTweetDate) return '#b08010'
  const days = Math.floor((Date.now() - new Date(latestTweetDate).getTime()) / 86400000)
  if (days === 0)  return '#ef4444'
  if (days <= 2)   return '#f97316'
  if (days <= 7)   return '#d97706'
  if (days <= 14)  return '#6366f1'
  if (days <= 30)  return '#8b5cf6'
  return '#b08010'
}

async function getData() {
  const supabase = getSupabase()
  const [countResult, archiveResult] = await Promise.all([
    supabase.from('matched_tweets').select('*').order('count_number', { ascending: false }).limit(1).single(),
    supabase.from('matched_tweets').select('*').order('count_number', { ascending: false }).limit(50),
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
const moodColor = getMoodColor(latestTweet?.created_at ?? null)

  return (
    <div id="top" className="min-h-screen">

      {/* ══════════════════════════════════════
          HERO — sky video + illustration
      ══════════════════════════════════════ */}
      <div
        className="fade-in-up hero-section"
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          minHeight: 'min(94vh, 820px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #0a1628 0%, #0d2a55 25%, #1a5fa8 55%, #1e7ec0 75%, #2496e0 100%)',
        }}
      >
        {/* Sky video background (loads when available) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src="/sky.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay — doubles as CSS sky fallback when video is absent */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, rgba(8,20,45,0.60) 0%, rgba(14,50,100,0.35) 35%, rgba(26,95,168,0.12) 65%, transparent 100%)',
        }} />
        {/* Sun glow */}
        <div style={{ position:'absolute', top:'12%', right:'18%', width:'160px', height:'160px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,220,100,0.22) 0%, transparent 70%)', zIndex:2, filter:'blur(8px)' }} />

        {/* Cloud blobs */}
        <div className="cloud-a" style={{ position:'absolute', top:'50%', left:'-6%',  width:'46%', height:'15%', background:'white', borderRadius:'50%', opacity:0.13, filter:'blur(22px)', zIndex:3 }} />
        <div className="cloud-b" style={{ position:'absolute', top:'54%', right:'-4%', width:'42%', height:'13%', background:'white', borderRadius:'50%', opacity:0.11, filter:'blur(20px)', zIndex:3 }} />
        <div className="cloud-c" style={{ position:'absolute', top:'63%', left:'6%',   width:'36%', height:'11%', background:'white', borderRadius:'50%', opacity:0.16, filter:'blur(16px)', zIndex:3 }} />
        <div className="cloud-a" style={{ position:'absolute', top:'67%', right:'5%',  width:'32%', height:'10%', background:'white', borderRadius:'50%', opacity:0.13, filter:'blur(14px)', zIndex:3 }} />

        {/* Illustration — PNG with transparent background, no blend mode needed */}
        <div style={{ position: 'relative', width: '100%', zIndex: 4 }}>
          <img
            src="/hero.png"
            alt="טראמפ אמר לו — איור סאטירי"
            className="hero-img"
          />
        </div>

        {/* Title block — flush against the illustration's bottom edge */}
        <header className="text-center" style={{
          position: 'relative', zIndex: 6,
          marginTop: 0,
          padding: '0 1.5rem 0',
          width: '100%',
        }}>
          <h1
            className="font-title"
            style={{
              fontSize: 'clamp(36px, 9vw, 68px)',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              textShadow: '0 2px 24px rgba(0,0,0,0.5)',
              marginBottom: '0.5rem',
            }}
          >
            טראמפ אמר לו. שוב.
          </h1>
          {/* Subtitle badge + arrow below */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            padding: '0.5rem 0 1rem',
          }}>
            <p
              className="font-title"
              style={{
                fontSize: 'clamp(16px, 3.2vw, 26px)',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.88)',
                lineHeight: 1.5,
                letterSpacing: '0.01em',
                margin: 0,
                background: '#0e1e36',
                borderRadius: 10,
                padding: '0.35rem 1.3rem',
                backdropFilter: 'blur(4px)',
              }}
            >
              והיד עוד נטויה...
            </p>
            <a
              href="#content"
              aria-label="גלול למטה"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.35)',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                animation: 'bounce-down 1.8s ease-in-out infinite',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 8 10 14 16 8" />
              </svg>
            </a>
          </div>
        </header>
      </div>

      {/* ══════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════ */}
      <div style={{ padding: '2.5rem 1rem 0' }}>
      <div id="content" className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Banners */}
        {params.confirmed === 'true' && (
          <div className="text-center py-3 px-4 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(30,106,168,0.1)', color: 'var(--accent)', border: '1px solid rgba(30,106,168,0.3)' }}>
            ✓ ההרשמה אושרה! נעדכן אתכם כשיהיה ״אמר לי״ חדש.
          </div>
        )}
        {params.confirmed === 'error' && (
          <div className="text-center py-3 px-4 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#c0392b', border: '1px solid rgba(239,68,68,0.25)' }}>
            לינק האישור לא תקין או פג תוקפו.
          </div>
        )}
        {params.unsubscribed === 'true' && (
     0    <div className="text-center py-3 px-4 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(30,106,168,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(30,106,168,0.18)' }}>
            הסרתם מהרשימה. להתראות.
          </div>
        )}

        {/* Counter */}
        <Counter count={totalCount} updatedAt="עכשיו" color={moodColor} />

        {/* Share */}
        <ShareButtons count={totalCount} />

        {/* Days since */}
        <DaysSince latestTweetDate={latestTweet?.created_at ?? null} totalCount={totalCount} />

        {/* Last tweet — pull quote */}
        <LastTweet tweet={latestTweet} />

        {/* ── Subscribe CTA ── */}
        <SubscribeBox />

        {/* Timeline */}
        <Suspense fallback={null}>
          <Timeline tweets={archive} />
        </Suspense>

        {/* Back to top */}
        <div className="text-center pb-2">
          <a
            href="#top"
            aria-label="חזור לראש הדף"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontFamily: 'Heebo, sans-serif',
              fontWeight: 500,
              color: 'var(--accent)',
              textDecoration: 'none',
              padding: '8px 18px',
              borderRa$ius: 999,
              border: '1.5px solid rgba(30,106,168,0.3)',
              background: 'rgba(30,106,168,0.06)',
              transition: 'background 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 12 10 6 16 12" />
            </svg>
            חזרה לראש העמוד
          </a>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs pb-8" style={{ color: 'var(--text-muted)', fontFamily: 'Heebo, sans-serif', fontWeight: 300, lineHeight: 1.8 }}>
          <p>
            נספר, נאסף ונבנה ע&quot;י{' '}
            <a href="https://www.instagram.com/udi_jonas/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>אודי יונש</a>
            {' '}& קלוד.ק © 2026
          </p>
          <p>
            מצאתם ציוץ שחמק מהראדר?{' '}
            <a href="mailto:udi.jonas@gmail.com" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>שלחו לנו</a>
            {' '}לפני שטראמפ יגיד לברק.
          </p>
        </footer>

      </div>
      </div>

      <LiveRefresh />
    </div>
  )
}
