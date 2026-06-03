'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X, Users, Eye, TrendingUp, Briefcase, BadgeCheck, LayoutDashboard, Moon, Sun } from 'lucide-react'
import { InfluencerCard } from '@/components/influencer/InfluencerCard'
import { MOCK_INFLUENCERS } from '@/lib/data'
import { NICHE_LABELS, formatNumber, cn } from '@/lib/utils'
import { Niche, Platform } from '@/types'

const NICHES: { value: string; label: string }[] = [
  { value: 'all',       label: 'الكل' },
  { value: 'news',      label: 'الصحافة' },
  { value: 'media',     label: 'إعلامي' },
  { value: 'business',  label: 'ريادة الأعمال' },
  { value: 'marketing', label: 'تسويق' },
  { value: 'tech',      label: 'تقني' },
  { value: 'ugc',       label: 'UGC' },
]

const PLATFORMS: { value: string; label: string; icon: React.ReactNode; bg: string; color: string }[] = [
  { value: 'all',       label: 'الكل',      icon: null,  bg: '', color: '' },
  { value: 'instagram', label: 'Instagram', icon: '📷',  bg: 'bg-pink-500',   color: 'text-white' },
  { value: 'tiktok',    label: 'TikTok',    icon: '♪',   bg: 'bg-gray-900',   color: 'text-white' },
  { value: 'snapchat',  label: 'Snapchat',  icon: '👻',  bg: 'bg-yellow-400', color: 'text-black' },
  { value: 'youtube',   label: 'YouTube',   icon: '▶',   bg: 'bg-red-600',    color: 'text-white' },
  { value: 'twitter',   label: 'X',         icon: '𝕏',   bg: 'bg-black',      color: 'text-white' },
]

export default function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const isAr = locale === 'ar'

  const [search, setSearch]               = useState('')
  const [activeNiches, setActiveNiches]   = useState<string[]>(['all'])
  const [activePlatform, setActivePlatform] = useState('all')
  const [gender, setGender]               = useState<'all' | 'male' | 'female'>('all')
  const [verifiedOnly, setVerifiedOnly]   = useState(false)
  const [darkMode, setDarkMode]           = useState(false)
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return MOCK_INFLUENCERS.filter(inf => {
      if (search && !inf.full_name.includes(search) && !inf.handle?.includes(search)) return false
      if (!activeNiches.includes('all') && !activeNiches.some(n => inf.niche.includes(n as Niche))) return false
      if (activePlatform !== 'all' && !inf.social_accounts?.some(s => s.platform === activePlatform)) return false
      if (gender !== 'all' && inf.gender !== gender) return false
      if (verifiedOnly && !inf.is_verified) return false
      return true
    })
  }, [search, activeNiches, activePlatform, gender, verifiedOnly])

  const totalFollowers = MOCK_INFLUENCERS.reduce((s, i) => s + (i.total_followers ?? 0), 0)

  function toggleNiche(val: string) {
    if (val === 'all') { setActiveNiches(['all']); return }
    setActiveNiches(prev => {
      const next = prev.filter(n => n !== 'all')
      const updated = next.includes(val) ? next.filter(n => n !== val) : [...next, val]
      return updated.length === 0 ? ['all'] : updated
    })
  }

  function clearAll() {
    setSearch(''); setActiveNiches(['all']); setActivePlatform('all')
    setGender('all'); setVerifiedOnly(false)
  }

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  return (
    <div className={cn('min-h-screen transition-colors', darkMode ? 'bg-[#0d0d0d]' : 'bg-gray-50')} dir={isAr ? 'rtl' : 'ltr'}>

      {/* NAV */}
      <nav className={cn('border-b px-4 md:px-6 sticky top-0 z-50 h-14 flex items-center justify-between transition-colors', darkMode ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">✦</span>
          </div>
          <span className={cn('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>First Mover</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${locale === 'ar' ? 'en' : 'ar'}`}
            className={cn('text-xs border px-3 py-1.5 rounded-lg transition-colors', darkMode ? 'border-[#333] text-gray-300 hover:bg-[#1a1a1a]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {isAr ? 'EN' : 'AR'}
          </Link>
          <button
            onClick={() => setDarkMode(d => !d)}
            className={cn('w-9 h-9 border rounded-lg flex items-center justify-center transition-colors', darkMode ? 'border-[#333] text-gray-400 hover:bg-[#1a1a1a]' : 'border-gray-200 text-gray-500 hover:bg-gray-50')}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href={`/${locale}/admin`}
            className="flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800">
            <LayoutDashboard className="w-3.5 h-3.5" />
            {isAr ? 'لوحة التحكم' : 'Dashboard'}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={cn('border-b px-4 py-10 text-center transition-colors', darkMode ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
        <div className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xl px-5 py-2 rounded-full mb-6 font-medium" style={darkMode ? {background:'#2a2440',color:'#AFA9EC'} : {}}>
          {isAr ? 'منصة إدارة المؤثرين' : 'Influencer Management Platform'}
        </div>
        <div className={cn('flex items-center border rounded-xl overflow-hidden max-w-lg mx-auto shadow-sm', darkMode ? 'border-[#333] bg-[#1a1a1a]' : 'border-gray-200 bg-white')}>
          <Search className={cn('w-4 h-4 mx-3 flex-shrink-0', darkMode ? 'text-gray-600' : 'text-gray-400')} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث بالاسم أو المجال...' : 'Search by name or niche...'}
            className={cn('flex-1 py-3 text-sm outline-none bg-transparent', darkMode ? 'text-white placeholder:text-gray-600' : 'text-gray-900 placeholder:text-gray-400')}
          />
          {search && <button onClick={() => setSearch('')} className="p-2 me-1"><X className="w-4 h-4 text-gray-400" /></button>}
        </div>
      </section>

      {/* STATS */}
      <div className={cn('border-b px-4 py-3 transition-colors', darkMode ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Users,      label: isAr ? 'إجمالي المؤثرين' : 'Influencers',  value: MOCK_INFLUENCERS.length.toString(), trend: isAr ? 'مؤثر نشط' : 'active' },
            { icon: Eye,        label: isAr ? 'إجمالي المتابعين' : 'Followers',   value: formatNumber(totalFollowers),        trend: '↑' },
            { icon: TrendingUp, label: isAr ? 'متوسط التفاعل' : 'Avg Engagement', value: '5.8%',                              trend: isAr ? 'معدل عالٍ' : 'High' },
            { icon: Briefcase,  label: isAr ? 'علامات تجارية' : 'Brands',        value: '150+',                              trend: isAr ? 'شريك' : 'partners' },
          ].map(({ icon: Icon, label, value, trend }) => (
            <div key={label} className={cn('rounded-xl p-3 transition-colors', darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50')}>
              <div className={cn('flex items-center gap-1.5 text-xs mb-1', darkMode ? 'text-gray-500' : 'text-gray-400')}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </div>
              <div className={cn('text-lg font-bold', darkMode ? 'text-white' : 'text-gray-900')}>{value}</div>
              <div className="text-xs text-emerald-600">{trend}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div className={cn('border-b px-4 py-3 sticky top-14 z-40 transition-colors', darkMode ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
        <div className="max-w-7xl mx-auto space-y-3">

          {/* رأس الفلاتر */}
          <div className="flex items-center justify-between">
            <span className={cn('text-xs', darkMode ? 'text-gray-500' : 'text-gray-400')}>
              {filtered.length} {isAr ? 'مؤثر' : 'influencers'}
            </span>
            {(search || !activeNiches.includes('all') || activePlatform !== 'all' || gender !== 'all' || verifiedOnly) && (
              <button onClick={clearAll} className="text-xs text-red-500 flex items-center gap-1">
                <X className="w-3 h-3" /> {isAr ? 'مسح الكل' : 'Clear all'}
              </button>
            )}
          </div>

          {/* التخصص */}
          <div>
            <p className={cn('text-[10px] font-medium uppercase tracking-wider mb-1.5', darkMode ? 'text-gray-600' : 'text-gray-400')}>
              {isAr ? 'التخصص' : 'Niche'}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {NICHES.map(n => (
                <button key={n.value} onClick={() => toggleNiche(n.value)}
                  className={cn('text-xs px-2.5 py-1 rounded-full border transition-colors',
                    activeNiches.includes(n.value)
                      ? darkMode ? 'bg-[#2a2440] border-violet-700 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-700'
                      : darkMode ? 'border-[#333] text-gray-500 hover:border-[#444]' : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* المنصة */}
          <div>
            <p className={cn('text-[10px] font-medium uppercase tracking-wider mb-1.5', darkMode ? 'text-gray-600' : 'text-gray-400')}>
              {isAr ? 'المنصة' : 'Platform'}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {PLATFORMS.map(p => (
                <button key={p.value} onClick={() => setActivePlatform(p.value)}
                  className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1 border rounded-lg transition-colors',
                    activePlatform === p.value
                      ? darkMode ? 'bg-[#222] border-[#444] text-white' : 'bg-gray-100 border-gray-300 text-gray-900'
                      : darkMode ? 'border-[#333] text-gray-500' : 'border-gray-200 text-gray-500')}>
                  {p.icon && (
                    <span className={cn('w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0', p.bg, p.color)}>
                      {p.icon}
                    </span>
                  )}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* الجنس + التوثيق */}
          <div className="flex items-start gap-6 flex-wrap">
            <div>
              <p className={cn('text-[10px] font-medium uppercase tracking-wider mb-1.5', darkMode ? 'text-gray-600' : 'text-gray-400')}>
                {isAr ? 'الجنس' : 'Gender'}
              </p>
              <div className="flex gap-1.5">
                {(['all','male','female'] as const).map(g => (
                  <button key={g} onClick={() => setGender(g)}
                    className={cn('text-xs px-3 py-1 rounded-full border transition-colors',
                      gender === g
                        ? darkMode ? 'bg-[#2a2440] border-violet-700 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-700'
                        : darkMode ? 'border-[#333] text-gray-500' : 'border-gray-200 text-gray-500')}>
                    {g === 'all' ? (isAr ? 'الجميع' : 'All') : g === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={cn('text-[10px] font-medium uppercase tracking-wider mb-1.5', darkMode ? 'text-gray-600' : 'text-gray-400')}>
                {isAr ? 'التوثيق' : 'Verified'}
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setVerifiedOnly(v => !v)}
                  className={cn('w-8 h-5 rounded-full relative transition-colors', verifiedOnly ? 'bg-violet-500' : darkMode ? 'bg-[#333]' : 'bg-gray-200')}>
                  <div className={cn('absolute w-3.5 h-3.5 bg-white rounded-full top-0.5 transition-transform', verifiedOnly ? 'translate-x-[-14px] right-0.5' : 'right-0.5')}/>
                </div>
                <BadgeCheck className="w-4 h-4 text-blue-500" />
                <span className={cn('text-xs', darkMode ? 'text-gray-500' : 'text-gray-500')}>
                  {isAr ? 'موثّقون فقط' : 'Verified only'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{isAr ? 'لا توجد نتائج' : 'No results'}</p>
            <button onClick={clearAll} className="mt-2 text-xs text-violet-500 hover:underline">
              {isAr ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(inf => (
              <InfluencerCard
                key={inf.id} influencer={inf} locale={locale}
                isSelected={selectedIds.has(inf.id)} onSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </main>

      {/* SHARE BAR */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl">
            <span className="text-sm">{selectedIds.size} {isAr ? 'مؤثر محدد' : 'selected'}</span>
            <Link href={`/${locale}/admin`}
              className="bg-violet-500 text-white text-xs px-4 py-1.5 rounded-lg">
              {isAr ? 'إنشاء قائمة' : 'Create list'}
            </Link>
            <button onClick={() => setSelectedIds(new Set())}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
