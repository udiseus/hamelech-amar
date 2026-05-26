'use client'

import { useState, useEffect } from 'react'

export default function SubscribeBox() {
  // --- סטייט להרשמה ---
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  // --- סטייט להסרת הרשמה ---
  const [showUnsub, setShowUnsub] = useState(false)
  const [unsubEmail, setUnsubEmail] = useState('')
  const [wasUnsubscribed, setWasUnsubscribed] = useState(false)

  // --- בדיקה אם הגיעו חזרה אחרי הסרת הרשמה (?unsubscribed=true) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('unsubscribed') === 'true') setWasUnsubscribed(true)
  }, [])

  // --- שליחת טופס הרשמה ---
  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'שגיאה. נסו שוב.')
      }
    } catch {
      setStatus('error')
      setMessage('שגיאת רשת. נסו שוב.')
    }
  }

  // --- שליחת טופס הסרת הרשמה --- מעביר לנתיב API שמטפל ב-redirect
  function handleUnsubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!unsubEmail.trim()) return
    window.location.href = `/api/unsubscribe?email=${encodeURIComponent(unsubEmail.trim())}`
  }

  return (
    <section className="card" style={{ textAlign: 'center' }}>

      <h2 className="font-title" style={{
        fontSize: 'clamp(22px, 5vw, 32px)',
        fontWeight: 900,
        color: 'var(--accent)',
        letterSpacing: '-0.02em',
        marginBottom: '0.5rem',
      }}>
        רוצה לדעת כשהמלך אומר לו שוב?
      </h2>

      {/* הצגת הודעה לאחר הסרת הרשמה */}
      {wasUnsubscribed ? (
        <div style={{
          padding: '1rem',
          borderRadius: 12,
          background: 'rgba(100,100,100,0.1)',
          color: 'var(--text-muted)',
          border: '1px solid rgba(100,100,100,0.2)',
          fontFamily: 'Heebo, sans-serif',
          fontWeight: 500,
        }}>
          ✓ הוסרת מרשימת התפוצה. נתראה בממלכה 👋
        </div>

      ) : status === 'success' ? (
        /* הצגת הודעת הצלחה לאחר הרשמה */
        <div style={{
          padding: '1rem',
          borderRadius: 12,
          background: 'rgba(30,106,168,0.1)',
          color: 'var(--accent)',
          border: '1px solid rgba(30,106,168,0.3)',
          fontFamily: 'Heebo, sans-serif',
          fontWeight: 500,
        }}>
          ✓ {message}
        </div>

      ) : (
        <>
          {/* טופס הרשמה */}
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email"
              placeholder="האימייל שלך"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
              style={{
                flex: '1 1 220px',
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 15,
                outline: 'none',
                background: 'rgba(255,255,255,0.9)',
                border: '1.5px solid rgba(30,106,168,0.35)',
                color: 'var(--text-main)',
                fontFamily: 'Heebo, sans-serif',
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary"
              style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 600 }}
            >
              {status === 'loading' ? '...' : 'אני חייב.ת לדעת'}
            </button>
          </form>

          {/* הודעת שגיאה */}
          {status === 'error' && (
            <p style={{ marginTop: 8, fontSize: 13, color: '#c0392b', fontFamily: 'Heebo, sans-serif' }}>{message}</p>
          )}

          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Heebo, sans-serif', fontWeight: 300, background: 'none' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: 4 }}>⁕</span>
            נשלח מייל רק כשטראמפ יגיד לו שוב. לא נציק, נודרים.
          </p>

          {/* טופס הסרת הרשמה — מוסתר כברירת מחדל */}
          <div style={{ marginTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem' }}>
            {!showUnsub ? (
              /* לינק קטן לפתיחת טופס הסרה */
              <button
                onClick={() => setShowUnsub(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  fontFamily: 'Heebo, sans-serif',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                כבר רשום? הסר הרשמה
              </button>
            ) : (
              /* טופס הסרה */
              <form
                onSubmit={handleUnsubscribe}
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}
              >
                <input
                  type="email"
                  placeholder="האימייל שלך"
                  value={unsubEmail}
                  onChange={(e) => setUnsubEmail(e.target.value)}
                  required
                  style={{
                    flex: '1 1 200px',
                    borderRadius: 10,
                    padding: '9px 14px',
                    fontSize: 13,
                    outline: 'none',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--text-main)',
                    fontFamily: 'Heebo, sans-serif',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 10,
                    padding: '9px 16px',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'Heebo, sans-serif',
                  }}
                >
                  הסר הרשמה
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </section>
  )
}
