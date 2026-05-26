import type { MatchedTweet } from '@/lib/supabase'

interface Props {
  tweet: MatchedTweet | null
}

function timeAgo(iso: string): string {
  const tz = 'Asia/Jerusalem'
  const now = new Date()
  const diffMs = now.getTime() - new Date(iso).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMins / 60)
  if (diffMins < 1)  return 'לפני פחות מדקה'
  if (diffMins < 60) return `לפני ${diffMins} דקות`
  if (diffHrs < 24)  return `לפני ${diffHrs} שעות`
  const toMidnight = (s: string) => { const [d,m,y] = s.split('.').map(Number); return new Date(y,m-1,d).getTime() }
  const diffDays = Math.round((toMidnight(now.toLocaleDateString('he-IL',{timeZone:tz})) - toMidnight(new Date(iso).toLocaleDateString('he-IL',{timeZone:tz}))) / 86400000)
  if (diffDays === 1) return 'אתמול'
  if (diffDays < 30)  return `לפני ${diffDays} ימים`
  return `לפני ${Math.floor(diffDays / 30)} חודשים`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('he-IL', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  })
}

function isHebrew(text: string): boolean {
  const hebrewCount = (text.match(/[א-ת]/g) || []).length
  const latinCount  = (text.match(/[a-zA-Z]/g) || []).length
  return hebrewCount >= latinCount
}

export default function LastTweet({ tweet }: Props) {
  if (!tweet) return null

  const hebrew = isHebrew(tweet.text)

  return (
    <section className="card fade-in-up" style={{ animationDelay: '0.2s' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.5rem' }}>
        <div>
          <h2 className="font-title" style={{
            fontSize: 'clamp(18px, 4vw, 22px)',
            fontWeight: 700,
            color: 'var(--accent)',
            letterSpacing: '-0.01em',
          }}>
            הפעם האחרונה שהמלך אמר
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Heebo, sans-serif', fontWeight: 300, marginTop: 2 }}>
           {timeAgo(tweet.created_at)} · {formatDate(tweet.created_at)}
          </p>
        </div>
        <a
          href={tweet.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12,
            padding: '6px 14px',
            borderRadius: 8,
            background: '#000',
            color: '#fff',
            textDecoration: 'none',
            fontFamily: 'Heebo, sans-serif',
            fontWeight: 600,
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          לציוץ
        </a>
      </div>

      {/* Pull-quote */}
      <figure
        dir={hebrew ? 'rtl' : 'ltr'}
        style={{
          margin: 0,
          borderTop: '2px solid var(--accent)',
          borderBottom: '1px solid rgba(30,106,168,0.18)',
          paddingBottom: '1.2rem',
        }}
      >
        {/* Blockquote wrapper — watermark centered precisely within it */}
        <div style={{ position: 'relative', overflow: 'hidden', marginBottom: '1rem' }}>
          {/* Watermark — centered h+v, transform adjusted for glyph ascender so clipping is equal top/bottom */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -38%)',
              fontFamily: 'Georgia, "Frank Ruhl Libre", serif',
              fontSize: 'clamp(180px, 48vz, 300px)',
              lineHeight: 1,
              color: 'var(--accent)',
              opacity: 0.16,
              userSelect: 'none',
              pointerEvents: 'none',
              zIndex: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {'“'}
          </span>

          <blockquote
            className="font-title"
            style={{
              position: 'relative',
              zIndex: 1,
              margin: 0,
              padding: hebrew ? '0.8rem 1.5rem 0.8rem 0' : '0.8rem 0 0.8rem 1.5rem',
              fontSize: 'clamp(17px, 3.5vw, 22px)',
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'var(--text-main)',
              textAlign: hebrew ? 'right' : 'left',
            }}
          >
            {tweet.text}
          </blockquote>
        </div>

        {/* Figcaption — always centered */}
        <figcaption
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            fontFamily: 'Heebo, sans-serif',
            fontWeight: 600,
            fontSize: 12,
            color: 'var(--accent)',
            letterSpacing: '0.04em',
          }}
        >
          ברק רביד · @BarakRavid
          <span style={{ fontWeight: 300, color: 'var(--text-muted)', margin: '0 8px' }}>
            · ציוץ #{tweet.count_number}
          </span>
        </figcaption>
      </figure>

    </section>
  )
}
