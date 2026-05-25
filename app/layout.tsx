import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'טראמפ אמר לו. שוב. — הߞונה הרשמי',
  description: 'אנחנו כאן כדי לוודא שאף "אמר לי" לא ילך לאיבוד בדפי ההיסטוריה.',
  openGraph: {
    title: 'טראמפ אמר לו. שוב.',
    description: 'אנחנו כאן כדי לוודא שאף "אמר לי" לא ילך לאיבוד בדפי ההיסטוריה.',
    locale: 'he_IL',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'טראמפ אמר לו. שוב.',
    description: 'אנחנו כאן כדי לוודא שאף "אמר לי" לא ילך לאיבוד בדפי ההיסטוריה.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;700;900&family=Heebo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}<Analytics /></body>
    </html>
  )
}
