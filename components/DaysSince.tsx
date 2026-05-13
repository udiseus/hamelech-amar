interface Props {
  latestTweetDate: string | null
  totalCount: number
}

function calcDaysSince(iso: string): { days: number; hours: number; label: string } {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHrs / 24)

  let label: string
  if (diffMins < 60) label = `לפני ${diffMins} דקות`
  else if (diffHrs < 24) label = `לפני ${diffHrs} שעות`
  else if (diffDays === 1) label = 'אתמול'
  else label = `לפני ${diffDays} ימים`

  return { days: diffDays, hours: diffHrs, label }
}

function getMoodEmoji(days: number): { emoji: string; color: string; mood: string } {
  if (days === 0) return { emoji: '🔥', color: '#ef4444', mood: 'המלך דיבר היום' }
  if (days <= 2) return { emoji: '⚡', color: '#f97316', mood: 'המלך דיבר לאחרונה' }
  if (days <= 7) return { emoji: '👀', color: '#eab308', mood: 'שקט חשוד' }
  if (days <= 14) return { emoji: '😴', color: '#6366f1', mood: 'המלך ישן' }
  if (days <= 30) return { emoji: '🕸️', color: '#8b5cf6', mood: 'כבר מאובק קצת' }
  return { emoji: '👑', color: '#e2c97e', mood: 'המלך בחופשה' }
}

export default function DaysSince({ latestTweetDate, totalCount }: Props) {
  if (!latestTweetDate) return null

  const { days, label } = calcDaysSince(latestTweetDate)
  const { emoji, color, mood } = getMoodEmoji(days)

  const latestDate = new Date(latestTweetDate).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jerusalem',
  })

  return (
    <section
      className="card fade-in-up text-center"
      style={{ animationDelay: '0.15s' }}
    >
      <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
        כמה זמן עבר מאז שהמלך דיבר עם ברק?
      </p>

      <div className="flex items-center justify-center gap-3 mb-2">
        <span style={{ fontSize: '2.5rem' }}>{emoji}</span>
        <span
          className="font-black"
          style={{
            fontSize: 'clamp(48px, 10vw, 80px)',
            color,
            lineHeight: 1,
            textShadow: `0 0 30px ${color}55`,
          }}
        >
          {days}
        </span>
        <div className="text-right">
          <p className="font-bold text-xl" style={{ color: 'var(--text-main)' }}>
            {days === 1 ? 'יום' : 'ימים'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {days === 0 ? 'כבר דיבר היום' : 'ללא ציוץ חדש'}
          </p>
        </div>
      </div>

      <p
        className="text-base font-semibold mb-1"
        style={{ color }}
      >
        {mood}
      </p>

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        ציוץ מספר {totalCount} — {latestDate}
      </p>

      {days >= 7 && (
        <p
          className="text-xs mt-2 italic"
          style={{ color: 'var(--purple-pale)' }}
        >
          {days >= 30
            ? 'האם טראמפ חדל לדבר איתו? האם ברק נרדם?'
            : 'ברק, אנחנו מחכים...'}
        </p>
      )}
    </section>
  )
}
