import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'המלך אמר — מונה ה"טראמפ אמר לי" של ברק רביד',
  description: 'כמה פעמים ברק רביד כתב "טראמפ אמר לי"? הספירה הרשמית.',
  openGraph: {
    title: 'המלך אמר',
    description: 'מונה ה"טראמפ אמר לי" של ברק רביד',
    locale: 'he_IL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'המלך אמר',
    description: 'כמה פעמים ברק רביד כתב "טראמפ אמר לי"?',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="stars-bg">{children}</body>
    </html>
  )
}
