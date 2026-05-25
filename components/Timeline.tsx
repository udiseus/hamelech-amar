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

/** Count Hebrew alef-bet letters vs Latin letters to determine majority script */
function isHebrew(text: string): boolean {
  const hebrewCount = (text.match(/[א-ת]/g) || []).length
  const latinCount  = (text.match(/[a-zA-Z]/g)        || []).length
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
        color: 'var(--accent)',
        marginBottom: '1.5rem',
        letterSpacing: '-0.02em',
        borderBottom: '2px solid var(--accent)',
        paddingBottom: '0.6rem',
      }}>
        כל הפעמים שהמלך אמר
      </h2>

      <div className="flex flex-col gap-4">
        {tweets.map((tweet) => {
          const hebrew = isHebrew(tweet.text)
          return (
            <article
              key={tweet.tweet_id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '0.85rem 1.1rem',
                boxShadow: '0 1px 10px rgba(30,106,168,0.06)',
              }}
            >
              {/* Header row — always RTL, badge on right only */}
              <div dir="rtl" style={{ marginBottom: '0.55rem' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'Heebo, sans-serif',
                  background: 'rgba(30,106,168,0.1)',
                  color: 'var(--accent)',
                  padding: '2px 10px',
                  borderRadius: 999,
                  letterSpacing: '0.04em',
                }}>
                  #{tweet.count_number}
                </span>
              </div>

              {/* Tweet text — direction by content language */}
              <p
                className="font-title"
                dir={hebrew ? 'rtl' : 'ltr'}
                style={{
                  fontSize: 'clamp(14px, 2.8vw, 17px)',
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: 'var(--text-main)',
                  textAlign: hebrew ? 'right' : 'left',
                  margin: '0 0 0.45rem 0',
                  borderRight: hebrew ? '3px solid var(--accent-light)' : 'none',
                  borderLeft:  hebrew ? 'none' : '3px solid var(--accent-light)',
                  paddingRight: hebrew ? 12 : 0,
                  paddingLeft:  hebrew ? 0  : 12,
                }}
              >
                {truncate(tweet.text)}
              </p>

              {/* Date + link — always RTL, inline */}
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
                  style={{ color: 'var(--accent-light)', textDecoration: 'none' }}
                >
                  לציוץ
                </a>
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
