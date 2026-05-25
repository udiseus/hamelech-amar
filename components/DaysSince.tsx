interface Props {
  latestTweetDate: string | null
  totalCount: number
}

function calcDaysSince(iso: string): { days: number; label: string } {
  const tz = 'Asia/Jerusalem'
  const now = new Date()
  const diffMs = now.getTime() - new Date(iso).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMins / 60)

  const todayStr = now.toLocaleDateString('he-IL', { timeZone: tz })
  const tweetStr = new Date(iso).toLocaleDateString('he-IL', { timeZone: tz })
  const toMidnight = (s: string) => {
    const [day, month, year] = s.split('.').map(Number)
    return new Date(year, month - 1, day).getTime()
  }
  const diffDays = Math.round((toMidnight(todayStr) - toMidnight(tweetStr)) / 86400000)

  let label: string
  if (diffMins < 60) label = `לפני ${diffMins} דקות`
  else if (diffHrs < 24) label = `לפני ${diffHrs} שעות`
  else if (diffDays === 1) label = 'אתמול'
  else label = `לפני ${diffDays} ימים`

  return { days: diffDays, label }
}

function getMood(days: number): { color: string; mood: string } {
  if (days === 0)  return { color: '#ef4444', mood: 'המלך דיבר היום' }
  if (days <= 2)   return { color: '#f97316', mood: 'המלך דיבר לאחרונה' }
  if (days <= 7)   return { color: '#d97706', mood: 'שקט חשוד' }
  if (days <= 14)  return { color: '#6366f1', mood: 'המלך ישן' }
  if (days <= 30)  return { color: '#8b5cf6', mood: 'כבר מאובק קצת' }
  return           { color: '#b08010',        mood: 'המלך בחופשה' }
}

export default function DaysSince({ latestTweetDate, totalCount }: Props) {
  if (!latestTweetDate) return null

  const { days, label } = calcDaysSince(latestTweetDate)
  const { color, mood } = getMood(days)

  const latestDate = new Date(latestTweetDate).toLocaleDateString('he-IL', {
    day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Jerusalem',
  })

  return (
    <section className="card fade-in-up text-center" style={{ animationDelay: '0.15s' }}>
      <p style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 400, fontSize: 'clamp(15px, 3vw, 18px)', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>
        כמה זמן עבר מאז שהמלך דיבר עם ברק?
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginBottom: 0 }}>
        <span
          className="font-title"
          style={{
            fontSize: 'clamp(64px, 14vw, 96px)',
            fontWeight: 900,
            color,
            lineHeight: 1,
            textShadow: `0 0 30px ${color}44`,
          }}
        >
          {days}
        </span>
        <div style={{ lineHeight: 1.15, textAlign: 'right' }}>
          <p style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--text-main)', margin: 0 }}>
            {days === 1 ? 'יום' : 'ימים'}
          </p>
          <p style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 300, fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
            {days === 0 ? 'כבר דיבר היום' : 'ללא ציוץ חדש'}
          </p>
        </div>
      </div>

      <p className="text-base font-semibold mb-1" style={{ color, fontFamily: 'Heebo, sans-serif' }}>
        {mood}
      </p>

      {days >= 7 && (
        <p className="text-xs mt-2 italic" style={{ color: 'var(--text-muted)', fontFamily: 'Heebo, sans-serif' }}>
          {days >= 30 ? 'האם טראמפ חדל לדבר איתו? האם ברק נרדם?' : 'ברק, אנחנו מחכים...'}
        </p>
      )}
    </section>
  )
}
