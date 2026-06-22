'use client'

import type { MatchedTweet } from '@/lib/supabase'

interface Props {
  tweets: MatchedTweet[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('he-IL', {
    day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Jerusalem',
  })
}

function isHebrew(text: string): boolean {
  const hebrewCount = (text.match(/[א-ת]/g) || []).length
  const latinCount  = (text.match(/[a-zA-Z]/g) || []).length
  return hebrewCount >= latinCount
}

function truncate(text: string, max = 200): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

export default function Timeline({ tweets }: Props) {
  if (tweets.length === 0) return null

  return (
    <section id="all-quotes" className="fade-in-up" style={{ animationDelay: '0.4s' }}>
      <h2 className="font-title" style={{
        fontSize: 'clamp(20px, 4vw, 26px)',
        fontWeight: 700,
        color: 'var(--text-main)',
        marginBottom: '1.25rem',
        letterSpacing: '-0.02em',
        borderBottom: '2px solid var(--gold)',
        paddingBottom: '0.6rem',
      }}>
        כל הפעמים שהמלך אמר
      </h2>

      <div className="flex flex-col gap-3">
        {tweets.map((tweet) => {
          const hebrew = isHebrew(tweet.text)
          return (
            <article
              key={tweet.tweet_id}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.boxShadow = '0 4px 20px rgba(14,30,54,0.11)'
                el.style.borderColor = 'rgba(14,30,54,0.2)'
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.boxShadow = '0 1px 6px rgba(14,30,54,0.07)'
                el.style.borderColor = 'rgba(14,30,54,0.12)'
                el.style.transform = 'translateY(0)'
              }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(14,30,54,0.12)',
                borderRadius: 16,
                padding: '0.9rem 1.15rem',
                boxShadow: '0 1px 6px rgba(14,30,54,0.07)',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
              }}
            >
              {/* Header row */}
              <div dir="rtl" style={{ marginBottom: '0.5rem' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 400,
                  fontFamily: 'Heebo, sans-serif',
                  background: 'rgba(176,128,16,0.10)',
                  color: 'var(--gold)',
                  padding: '2px 10px',
                  borderRadius: 999,
                  letterSpacing: '0.06em',
                  border: '1px solid rgba(176,128,16,0.22)',
                }}>
                  #{tweet.count_number}
                </span>
              </div>

              {/* Tweet text */}
              <p
                dir={hebrew ? 'rtl' : 'ltr'}
                style={{
                  fontFamily: 'Heebo, sans-serif',
                  fontSize: 'clamp(14px, 2.8vw, 16px)',
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: 'var(--text-main)',
                  textAlign: hebrew ? 'right' : 'left',
                  margin: '0 0 0.45rem 0',
                  borderRight: hebrew ? '3px solid var(--gold)' : 'none',
                  borderLeft:  hebrew ? 'none' : '3px solid var(--gold)',
                  paddingRight: hebrew ? 12 : 0,
                  paddingLeft:  hebrew ? 0  : 12,
                }}
              >
                {truncate(tweet.text)}
              </p>

              {/* Date + link */}
              <p dir="rtl" style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                fontFamily: 'Heebo, sans-serif',
                fontWeight: 300,
                margin: 0,
              }}>
                {formatDate(tweet.created_at)}{' '}·{' '}
                <a
                  href={tweet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                >
                  לציוץ ↗
                </a>
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
