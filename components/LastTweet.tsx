import type { MatchedTweet } from '@/lib/supabase'

interface Props {
  tweet: MatchedTweet | null
}

function timeAgo(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'לפני פחות מדקה'
  if (diffMins < 60) return `לפני ${diffMins} דקות`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `לפני ${diffHrs} שעות`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 30) return `לפני ${diffDays} ימים`
  const diffMonths = Math.floor(diffDays / 30)
  return `לפני ${diffMonths} חודשים`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('he-IL', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  })
}

export default function LastTweet({ tweet }: Props) {
  if (!tweet) {
    return (
      <section className="card fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-bold gold-text mb-2">הפעם האחרונה שהמלך אמר</h2>
        <p style={{ color: 'var(--text-muted)' }}>עוד לא נספרו ציוצים. בקרוב.</p>
      </section>
    )
  }

  return (
    <section className="card fade-in-up" style={{ animationDelay: '0.2s' }}>
      {/* Last mention header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold gold-text">הפעם האחרונה שהמלך אמר</h2>
          <p className="text-base mt-1" style={{ color: 'var(--purple-pale)' }}>
            {timeAgo(tweet.created_at)}
          </p>
        </div>
        <a
          href={tweet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          לציוץ ב־X ↗
        </a>
      </div>

      {/* Tweet card */}
      <div className="card2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: 'var(--purple-bright)', color: 'white' }}>
            ב
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>ברק רביד</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@BarakRavid</p>
          </div>
        </div>

        <blockquote
          className="text-base leading-relaxed mb-3"
          style={{ color: 'var(--text-main)', borderRight: '3px solid var(--purple-bright)', paddingRight: '12px' }}
        >
          {tweet.text}
        </blockquote>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatDate(tweet.created_at)}
        </p>

        <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--gold-dim)' }}>
          ציוץ מספר {tweet.count_number} בספירה
        </p>
      </div>
    </section>
  )
}
