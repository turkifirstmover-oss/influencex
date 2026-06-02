'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, LayoutDashboard, Globe } from 'lucide-react'

interface NavbarProps {
  locale: string
}

export function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname()
  const isAr = locale === 'ar'
  const otherLocale = isAr ? 'en' : 'ar'
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`)

  return (
    <nav className="bg-white border-b border-gray-100 px-4 md:px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 leading-none">InfluenceX</div>
            <div className="text-[10px] text-gray-400 leading-none mt-0.5">
              {isAr ? 'منصة المؤثرين' : 'Influencer Platform'}
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={otherPath}
            className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full hover:border-gray-300 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {isAr ? 'EN' : 'AR'}
          </Link>
          <Link
            href={`/${locale}/admin`}
            className="flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            {isAr ? 'لوحة التحكم' : 'Dashboard'}
          </Link>
        </div>
      </div>
    </nav>
  )
}
