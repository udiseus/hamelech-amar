import type { MatchedTweet } from '@/lib/supabase'

interface Props {
  tweets: MatchedTweet[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Jerusalem',
  })
}

function truncate(text: string, max = 140): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}

export default function Timeline({ tweets }: Props) {
  if (tweets.length === 0) return null

  return (
    <section className="fade-in-up" style={{ animationDelay: '0.4s' }}>
      <h2 className="text-xl font-bold gold-text mb-4 px-1">
        📜 כל הפעמים שהמלך אמר
      </h2>

      <div className="flex flex-col gap-3">
        {tweets.map((tweet) => (
          <article key={tweet.tweet_id} className="card2 group hover:border-purple-500/60 transition-colors">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2"
                  style={{ background: 'rgba(124,58,237,0.3)', color: 'var(--purple-pale)' }}
                >
                  #{tweet.count_number}
                </span>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>
                  {truncate(tweet.text)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(tweet.created_at)}
                </p>
              </div>
              <a
                href={tweet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--purple-pale)' }}
              >
                לציוץ ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
