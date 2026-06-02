'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, X, Users, Eye, TrendingUp, Briefcase, BadgeCheck, Sparkles, LayoutDashboard } from 'lucide-react'
import { InfluencerCard } from '@/components/influencer/InfluencerCard'
import { MOCK_INFLUENCERS } from '@/lib/data'
import { NICHE_LABELS, formatNumber, cn } from '@/lib/utils'
import { Niche, Platform } from '@/types'

const NICHES = Object.keys(NICHE_LABELS) as Niche[]
const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok',    label: 'TikTok'    },
  { value: 'snapchat',  label: 'Snapchat'  },
  { value: 'youtube',   label: 'YouTube'   },
  { value: 'twitter',   label: 'X / Twitter' },
]

export default function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const isAr = locale === 'ar'

  const [search, setSearch] = useState('')
  const [activeNiches, setActiveNiches] = useState<Niche[]>([])
  const [activePlatforms, setActivePlatforms] = useState<Platform[]>([])
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return MOCK_INFLUENCERS.filter(inf => {
      if (search && !inf.full_name.includes(search) && !inf.handle?.includes(search)) return false
      if (activeNiches.length > 0 && !activeNiches.some(n => inf.niche.includes(n))) return false
      if (activePlatforms.length > 0 && !activePlatforms.some(p => inf.social_accounts?.some(s => s.platform === p))) return false
      if (genderFilter !== 'all' && inf.gender !== genderFilter) return false
      if (verifiedOnly && !inf.is_verified) return false
      return true
    })
  }, [search, activeNiches, activePlatforms, genderFilter, verifiedOnly])

  const totalFollowers = MOCK_INFLUENCERS.reduce((s, i) => s + (i.total_followers ?? 0), 0)

  const toggleNiche = (n: Niche) =>
    setActiveNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])

  const togglePlatform = (p: Platform) =>
    setActivePlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const clearAll = () => {
    setSearch(''); setActiveNiches([]); setActivePlatforms([])
    setGenderFilter('all'); setVerifiedOnly(false)
  }

  const hasActiveFilters = search || activeNiches.length > 0 || activePlatforms.length > 0 || genderFilter !== 'all' || verifiedOnly

  return (
    <div className="min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>

      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 px-4 md:px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-none">InfluenceX</div>
              <div className="text-[10px] text-gray-400 leading-none mt-0.5">
                {isAr ? 'منصة المؤثرين' : 'Influencer Platform'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/${locale === 'ar' ? 'en' : 'ar'}`}
              className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full hover:border-gray-300">
              {isAr ? 'EN' : 'AR'}
            </Link>
            <Link href={`/${locale}/admin`}
              className="flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800">
              <LayoutDashboard className="w-3.5 h-3.5" />
              {isAr ? 'لوحة التحكم' : 'Dashboard'}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-white border-b px-4 py-10 md:py-14">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-600 text-xs px-3 py-1 rounded-full mb-4 font-medium">
            ✦ {isAr ? 'منصة إدارة المؤثرين الأكثر احترافية' : 'Most Professional Influencer Platform'}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-snug">
            {isAr ? 'اكتشف المؤثرين المثاليين لحملاتك' : 'Find the Perfect Influencers'}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {isAr ? `${MOCK_INFLUENCERS.length} مؤثر موثّق في السعودية والخليج والعالم العربي` : `${MOCK_INFLUENCERS.length} verified influencers across the Arab world`}
          </p>
          {/* Search */}
          <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden max-w-lg mx-auto shadow-sm">
            <Search className="w-4 h-4 text-gray-400 mx-3 flex-shrink-0" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث بالاسم أو المجال...' : 'Search by name or niche...'}
              className="flex-1 py-3 text-sm outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="p-2 me-1">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Users,     label: isAr ? 'إجمالي المؤثرين' : 'Total Influencers', value: MOCK_INFLUENCERS.length.toString(), sub: isAr ? 'مؤثر نشط' : 'Active' },
            { icon: Eye,       label: isAr ? 'إجمالي المتابعين' : 'Total Followers',   value: formatNumber(totalFollowers), sub: isAr ? 'متابع' : 'followers' },
            { icon: TrendingUp,label: isAr ? 'متوسط التفاعل' : 'Avg Engagement',      value: '5.8%', sub: isAr ? 'معدل عالٍ' : 'High rate' },
            { icon: Briefcase, label: isAr ? 'علامات تجارية' : 'Brand Partnerships',  value: '150+', sub: isAr ? 'علامة شريكة' : 'partners' },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Icon className="w-3.5 h-3.5" /> {label}
              </div>
              <div className="text-lg font-bold text-gray-900">{value}</div>
              <div className="text-xs text-emerald-600">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border-b px-4 py-2.5 sticky top-14 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 me-1 whitespace-nowrap">
              {filtered.length} {isAr ? 'مؤثر' : 'influencers'}
            </span>
            <div className="w-px h-4 bg-gray-200" />

            {/* Niche chips */}
            {NICHES.map(n => (
              <button key={n} onClick={() => toggleNiche(n)}
                className={cn('text-xs px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap',
                  activeNiches.includes(n)
                    ? 'bg-brand-50 border-brand-200 text-brand-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                {NICHE_LABELS[n]?.[isAr ? 'ar' : 'en']}
              </button>
            ))}

            <div className="w-px h-4 bg-gray-200" />
            <button onClick={() => setShowFilters(s => !s)}
              className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors',
                showFilters ? 'bg-gray-100 border-gray-300 text-gray-700' : 'border-gray-200 text-gray-500')}>
              <SlidersHorizontal className="w-3 h-3" />
              {isAr ? 'المزيد' : 'More'}
            </button>

            {hasActiveFilters && (
              <button onClick={clearAll} className="text-xs text-red-500 flex items-center gap-1 ms-auto">
                <X className="w-3 h-3" /> {isAr ? 'مسح الكل' : 'Clear all'}
              </button>
            )}
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-3 items-center">
              {/* Platform */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-400">{isAr ? 'المنصة:' : 'Platform:'}</span>
                {PLATFORMS.map(p => (
                  <button key={p.value} onClick={() => togglePlatform(p.value)}
                    className={cn('text-xs px-2 py-0.5 rounded border transition-colors',
                      activePlatforms.includes(p.value)
                        ? 'bg-brand-50 border-brand-200 text-brand-700'
                        : 'border-gray-200 text-gray-500')}>
                    {p.label}
                  </button>
                ))}
              </div>
              {/* Gender */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">{isAr ? 'الجنس:' : 'Gender:'}</span>
                {(['all', 'male', 'female'] as const).map(g => (
                  <button key={g} onClick={() => setGenderFilter(g)}
                    className={cn('text-xs px-2 py-0.5 rounded border transition-colors',
                      genderFilter === g ? 'bg-brand-50 border-brand-200 text-brand-700' : 'border-gray-200 text-gray-500')}>
                    {g === 'all' ? (isAr ? 'الكل' : 'All') : g === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
                  </button>
                ))}
              </div>
              {/* Verified */}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="rounded" />
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                  {isAr ? 'موثّقون فقط' : 'Verified only'}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* SHARE BAR */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl">
            <span className="text-sm">{selectedIds.size} {isAr ? 'مؤثر محدد' : 'selected'}</span>
            <Link href={`/${locale}/admin`}
              className="bg-brand-500 hover:bg-brand-400 text-white text-xs px-4 py-1.5 rounded-lg transition-colors">
              {isAr ? 'إنشاء قائمة مشاركة' : 'Create Share List'}
            </Link>
            <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* GRID */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{isAr ? 'لا توجد نتائج' : 'No results found'}</p>
            <button onClick={clearAll} className="mt-2 text-xs text-brand-500 hover:underline">
              {isAr ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          </div>
        ) : (
          <>
            {/* Featured */}
            {filtered.some(i => i.is_featured) && activeNiches.length === 0 && !search && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-gray-700">{isAr ? '⭐ مؤثرون مميزون' : '⭐ Featured'}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.filter(i => i.is_featured).map(inf => (
                    <InfluencerCard key={inf.id} influencer={inf} locale={locale}
                      isSelected={selectedIds.has(inf.id)} onSelect={toggleSelect} />
                  ))}
                </div>
              </div>
            )}

            {/* All / non-featured */}
            <div>
              {filtered.some(i => i.is_featured) && activeNiches.length === 0 && !search && (
                <h2 className="text-sm font-semibold text-gray-700 mb-3">{isAr ? 'جميع المؤثرين' : 'All Influencers'}</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(activeNiches.length > 0 || search ? filtered : filtered.filter(i => !i.is_featured)).map(inf => (
                  <InfluencerCard key={inf.id} influencer={inf} locale={locale}
                    isSelected={selectedIds.has(inf.id)} onSelect={toggleSelect} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
