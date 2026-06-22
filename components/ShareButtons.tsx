'use client'

import { track } from '@vercel/analytics'

const SITE_URL = 'https://hamelech-amar.vercel.app'

interface Props {
  count: number
}

export default function ShareButtons({ count }: Props) {
  const text = `טראמפ כבר אמר לו ${count} פעמים...`

  const shares = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(text + '\n' + SITE_URL)}`,
      brandColor: 'rgba(37,211,102,0.10)',
      brandBorder: 'rgba(37,211,102,0.35)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      ),
      iconColor: '#25D366',
    },
    {
      label: 'X',
      displayLabel: '',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SITE_URL)}`,
      brandColor: 'rgba(0,0,0,0.06)',
      brandBorder: 'rgba(0,0,0,0.22)',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      iconColor: '#0e1e36',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`,
      brandColor: 'rgba(24,119,242,0.08)',
      brandBorder: 'rgba(24,119,242,0.3)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      iconColor: '#1877F2',
    },
  ]

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontFamily: 'Heebo, sans-serif',
        fontWeight: 500,
        fontSize: 13,
        color: 'var(--text-muted)',
        marginBottom: '0.65rem',
        letterSpacing: '0.01em',
      }}>
        שתפו את מי שממש חייב.ת לדעת את המספרים
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {shares.map(({ label, displayLabel, href, brandColor, brandBorder, icon, iconColor }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`שתף ב-${label}`}
            onMouseEnter={e => {
              e.currentTarget.style.background = brandColor
              e.currentTarget.style.borderColor = brandBorder
              e.currentTarget.style.boxShadow = '0 3px 14px rgba(30,106,168,0.14)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-card)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = '0 1px 8px rgba(30,106,168,0.07)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 16px',
              borderRadius: 999,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              textDecoration: 'none',
              fontSize: 13,
              fontFamily: 'Heebo, sans-serif',
              fontWeight: 500,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 1px 8px rgba(30,106,168,0.07)',
              transition: 'box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease, transform 0.18s ease',
            }}
            onClick={() => track('share', { platform: label, count })}
          >
            <span style={{ color: iconColor }}>{icon}</span>
            {displayLabel !== undefined ? displayLabel : label}
          </a>
        ))}
      </div>
    </div>
  )
}
