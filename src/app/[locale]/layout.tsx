import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'InfluenceX — منصة إدارة المؤثرين', template: '%s | InfluenceX' },
  description: 'منصة احترافية لاكتشاف وإدارة المؤثرين في السعودية والخليج',
  openGraph: {
    title: 'InfluenceX',
    description: 'منصة احترافية لاكتشاف وإدارة المؤثرين',
    locale: 'ar_SA',
    type: 'website',
  },
}

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }]
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const isAr = locale === 'ar'
  return (
    <html lang={locale} dir={isAr ? 'rtl' : 'ltr'} className={inter.className}>
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
