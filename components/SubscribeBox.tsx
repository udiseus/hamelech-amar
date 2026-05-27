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
          padding: '1.2rem',
          borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(226,201,126,0.12), rgba(124,58,237,0.1))',
          border: '1px solid rgba(226,201,126,0.25)',
          fontFamily: 'Heebo, sans-serif',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👑</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)', marginBottom: 4 }}>
            הוסרת בהצלחה!
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
            המלך ימשיך לדבר — אבל לא נטריד אותך יותר. שלום מהממלכה 👋
          </div>
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
                כבר נרשמת? להסרה מעדכוני המלך
              </button>
            ) : (
              /* טופס הסרה */
              <form
                onSubmit={handleUnsubscribe}
                style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}
              >
                <label style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  fontFamily: 'Heebo, sans-serif',
                  marginBottom: 2,
                }}>
                  הכנס.י את כתובת המייל שלך להסרה:
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={unsubEmail}
                    onChange={(e) => setUnsubEmail(e.target.value)}
                    required
                    autoFocus
                    style={{
                      flex: '1 1 210px',
                      borderRadius: 10,
                      padding: '10px 14px',
                      fontSize: 14,
                      outline: 'none',
                      background: 'rgba(255,255,255,0.92)',
                      border: '2px solid rgba(226,201,126,0.5)',
                      color: '#1a0533',
                      fontFamily: 'Heebo, sans-serif',
                      fontWeight: 500,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(226,201,126,0.35)',
                      borderRadius: 10,
                      padding: '10px 18px',
                      fontSize: 13,
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      fontFamily: 'Heebo, sans-serif',
                      fontWeight: 600,
                    }}
                  >
                    הסירו אותי
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </section>
  )
}