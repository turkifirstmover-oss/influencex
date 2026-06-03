'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X, Users, Eye, TrendingUp, Briefcase, BadgeCheck, LayoutDashboard, Moon, Sun, MapPin } from 'lucide-react'
import { MOCK_INFLUENCERS } from '@/lib/data'
import { formatNumber, cn } from '@/lib/utils'

const NICHES = [
  { value: 'all',       label: 'الكل' },
  { value: 'news',      label: 'الصحافة' },
  { value: 'media',     label: 'إعلامي' },
  { value: 'business',  label: 'ريادة الأعمال' },
  { value: 'marketing', label: 'تسويق' },
  { value: 'tech',      label: 'تقني' },
  { value: 'ugc',       label: 'UGC' },
]

const PLATFORMS = [
  { value: 'all',       label: 'الكل',      dot: '' },
  { value: 'instagram', label: 'Instagram', dot: 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600' },
  { value: 'tiktok',    label: 'TikTok',    dot: 'bg-gray-900' },
  { value: 'snapchat',  label: 'Snapchat',  dot: 'bg-yellow-400' },
  { value: 'youtube',   label: 'YouTube',   dot: 'bg-red-600' },
  { value: 'twitter',   label: 'X',         dot: 'bg-black' },
]

const AVATAR_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-emerald-100',text: 'text-emerald-700' },
  { bg: 'bg-pink-100',   text: 'text-pink-700'   },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { bg: 'bg-amber-100',  text: 'text-amber-700'  },
]

function getAvColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)) % AVATAR_COLORS.length]
}

export default function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const isAr = locale === 'ar'

  const [search, setSearch]       = useState('')
  const [niche, setNiche]         = useState('all')
  const [platform, setPlatform]   = useState('all')
  const [gender, setGender]       = useState<'all'|'male'|'female'>('all')
  const [verified, setVerified]   = useState(false)
  const [dark, setDark]           = useState(false)

  const totalFollowers = MOCK_INFLUENCERS.reduce((s, i) => s + (i.total_followers ?? 0), 0)

  const filtered = useMemo(() => {
    return MOCK_INFLUENCERS.filter(inf => {
      if (search && !inf.full_name.includes(search) && !inf.handle?.includes(search)) return false
      if (niche !== 'all' && !inf.niche.includes(niche as any)) return false
      if (platform !== 'all' && !inf.social_accounts?.some(s => s.platform === platform)) return false
      if (gender !== 'all' && inf.gender !== gender) return false
      if (verified && !inf.is_verified) return false
      return true
    })
  }, [search, niche, platform, gender, verified])

  const dm = (light: string, darkCls: string) => dark ? darkCls : light

  return (
    <div className={cn('min-h-screen transition-colors duration-200', dark ? 'bg-[#0d0d0d]' : 'bg-gray-50')} dir={isAr ? 'rtl' : 'ltr'}>

      {/* NAV */}
      <nav className={cn('border-b px-4 md:px-6 sticky top-0 z-50 h-14 flex items-center justify-between transition-colors', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <span className={cn('text-sm font-semibold', dark ? 'text-white' : 'text-gray-900')}>First Mover</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${locale === 'ar' ? 'en' : 'ar'}`}
            className={cn('text-xs border px-3 py-1.5 rounded-lg', dark ? 'border-[#333] text-gray-300' : 'border-gray-200 text-gray-600')}>
            {isAr ? 'EN' : 'AR'}
          </Link>
          <button onClick={() => setDark(d => !d)}
            className={cn('w-9 h-9 border rounded-lg flex items-center justify-center', dark ? 'border-[#333] text-gray-400' : 'border-gray-200 text-gray-500')}>
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href={`/${locale}/admin`}
            className="flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800">
            <LayoutDashboard className="w-3.5 h-3.5" />
            {isAr ? 'لوحة التحكم' : 'Dashboard'}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={cn('border-b px-4 py-10 text-center transition-colors', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
        <div className={cn('inline-flex items-center text-xl px-5 py-2 rounded-full mb-6 font-medium', dark ? 'bg-[#2a2440] text-violet-300' : 'bg-violet-50 text-violet-700')}>
          {isAr ? 'منصة إدارة المؤثرين' : 'Influencer Management Platform'}
        </div>
        <div className={cn('flex items-center border rounded-xl overflow-hidden max-w-lg mx-auto shadow-sm', dark ? 'border-[#333] bg-[#1a1a1a]' : 'border-gray-200 bg-white')}>
          <Search className={cn('w-4 h-4 mx-3 flex-shrink-0', dark ? 'text-gray-600' : 'text-gray-400')} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث بالاسم أو المجال...' : 'Search...'}
            className={cn('flex-1 py-3 text-sm outline-none bg-transparent', dark ? 'text-white placeholder:text-gray-600' : 'text-gray-900 placeholder:text-gray-400')} />
          {search && <button onClick={() => setSearch('')} className="p-2 me-1"><X className="w-4 h-4 text-gray-400" /></button>}
        </div>
      </section>

      {/* STATS */}
      <div className={cn('border-b px-4 py-3', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Users,      label: isAr ? 'إجمالي المؤثرين' : 'Influencers',  value: MOCK_INFLUENCERS.length.toString() },
            { icon: Eye,        label: isAr ? 'إجمالي المتابعين' : 'Followers',   value: formatNumber(totalFollowers) },
            { icon: TrendingUp, label: isAr ? 'متوسط التفاعل' : 'Avg Engagement', value: '5.8%' },
            { icon: Briefcase,  label: isAr ? 'علامات تجارية' : 'Brands',        value: '150+' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className={cn('rounded-xl p-3', dark ? 'bg-[#1a1a1a]' : 'bg-gray-50')}>
              <div className={cn('flex items-center gap-1.5 text-xs mb-1', dark ? 'text-gray-500' : 'text-gray-400')}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </div>
              <div className={cn('text-lg font-bold', dark ? 'text-white' : 'text-gray-900')}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div className={cn('border-b px-4 py-4 sticky top-14 z-40', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
        <div className="max-w-5xl mx-auto space-y-3">

          {/* رأس */}
          <div className="flex items-center justify-between">
            <span className={cn('text-xs', dark ? 'text-gray-500' : 'text-gray-400')}>
              {filtered.length} {isAr ? 'مؤثر' : 'influencers'}
            </span>
            {(search || niche !== 'all' || platform !== 'all' || gender !== 'all' || verified) && (
              <button onClick={() => { setSearch(''); setNiche('all'); setPlatform('all'); setGender('all'); setVerified(false) }}
                className="text-xs text-red-500 flex items-center gap-1">
                <X className="w-3 h-3" /> {isAr ? 'مسح الكل' : 'Clear'}
              </button>
            )}
          </div>

          {/* المجال */}
          <div className="flex items-center gap-3">
            <span className={cn('text-xs font-medium whitespace-nowrap min-w-[36px]', dark ? 'text-gray-500' : 'text-gray-400')}>
              {isAr ? 'المجال' : 'Niche'}
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {NICHES.map(n => (
                <button key={n.value} onClick={() => setNiche(n.value)}
                  className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors',
                    niche === n.value
                      ? 'bg-violet-500 border-violet-500 text-white'
                      : dark ? 'border-[#333] text-gray-500 hover:border-[#444]' : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* المنصة */}
          <div className="flex items-center gap-3">
            <span className={cn('text-xs font-medium whitespace-nowrap min-w-[36px]', dark ? 'text-gray-500' : 'text-gray-400')}>
              {isAr ? 'المنصة' : 'Platform'}
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {PLATFORMS.map(p => (
                <button key={p.value} onClick={() => setPlatform(p.value)}
                  className={cn('flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded-lg transition-colors',
                    platform === p.value
                      ? dark ? 'bg-[#222] border-[#444] text-white' : 'bg-gray-100 border-gray-300 text-gray-900'
                      : dark ? 'border-[#333] text-gray-500' : 'border-gray-200 text-gray-500')}>
                  {p.dot && <span className={cn('w-2 h-2 rounded-full flex-shrink-0', p.dot)} />}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* الجنس + التوثيق */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className={cn('text-xs font-medium whitespace-nowrap min-w-[36px]', dark ? 'text-gray-500' : 'text-gray-400')}>
                {isAr ? 'الجنس' : 'Gender'}
              </span>
              <div className="flex gap-1.5">
                {(['all','male','female'] as const).map(g => (
                  <button key={g} onClick={() => setGender(g)}
                    className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors',
                      gender === g
                        ? 'bg-violet-500 border-violet-500 text-white'
                        : dark ? 'border-[#333] text-gray-500' : 'border-gray-200 text-gray-500')}>
                    {g === 'all' ? (isAr ? 'الجميع' : 'All') : g === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
                  </button>
                ))}
              </div>
            </div>
            <div className={cn('w-px h-5', dark ? 'bg-[#2a2a2a]' : 'bg-gray-200')} />
            <label className="flex items-center gap-2 cursor-pointer" onClick={() => setVerified(v => !v)}>
              <div className={cn('w-8 h-5 rounded-full relative transition-colors', verified ? 'bg-violet-500' : dark ? 'bg-[#333]' : 'bg-gray-200')}>
                <div className={cn('absolute w-3.5 h-3.5 bg-white rounded-full top-[3px] transition-all', verified ? 'right-[3px]' : 'right-[13px]')} />
              </div>
              <BadgeCheck className="w-4 h-4 text-blue-500" />
              <span className={cn('text-xs', dark ? 'text-gray-500' : 'text-gray-500')}>
                {isAr ? 'موثّقون فقط' : 'Verified only'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* GRID */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{isAr ? 'لا توجد نتائج' : 'No results'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(inf => {
              const av = getAvColor(inf.full_name)
              const engHigh = (inf.avg_engagement ?? 0) >= 5
              return (
                <div key={inf.id} className={cn('relative rounded-2xl border p-4 flex flex-col gap-3 transition-colors', dark ? 'bg-[#111] border-[#2a2a2a] hover:border-[#3a3a3a]' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm')}>

                  {/* badge تفاعل */}
                  <span className={cn('absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full font-medium',
                    engHigh ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                    {(inf.avg_engagement ?? 0).toFixed(1)}%
                  </span>

                  {/* الهيدر */}
                  <div className="flex items-center gap-3">
                    {inf.avatar_url ? (
                      <img src={inf.avatar_url} alt={inf.full_name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0', av.bg, av.text)}>
                        {inf.full_name.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className={cn('text-sm font-semibold truncate flex items-center gap-1', dark ? 'text-white' : 'text-gray-900')}>
                        {inf.full_name}
                        {inf.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                      </div>
                      <div className={cn('text-xs mt-0.5', dark ? 'text-gray-500' : 'text-gray-400')}>
                        {(inf.niche[0] === 'lifestyle' ? 'لايف ستايل' : inf.niche[0] === 'tech' ? 'تقني' : inf.niche[0] === 'business' ? 'ريادة الأعمال' : inf.niche[0] === 'food' ? 'طعام' : inf.niche[0] === 'fashion' ? 'أزياء' : inf.niche[0] === 'auto' ? 'سيارات' : inf.niche[0] === 'travel' ? 'سفر' : inf.niche[0] === 'sports' ? 'رياضة' : inf.niche[0])} · {inf.city}
                      </div>
                    </div>
                  </div>

                  {/* الإحصائيات */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: isAr ? 'المتابعون' : 'Followers', value: formatNumber(inf.total_followers ?? 0) },
                      { label: isAr ? 'المشاهدات' : 'Views',     value: formatNumber(inf.avg_views ?? 0) },
                    ].map(s => (
                      <div key={s.label} className={cn('rounded-lg p-2.5', dark ? 'bg-[#1a1a1a]' : 'bg-gray-50')}>
                        <div className={cn('text-[10px] mb-1', dark ? 'text-gray-500' : 'text-gray-400')}>{s.label}</div>
                        <div className={cn('text-sm font-semibold', dark ? 'text-white' : 'text-gray-900')}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* المنصات نصياً */}
                  <div className="flex gap-1.5 flex-wrap">
                    {inf.social_accounts?.map(acc => (
                      <span key={acc.id} className={cn('text-[10px] px-2 py-1 rounded border font-medium',
                        dark ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500')}>
                        {acc.platform === 'instagram' ? 'Instagram' : acc.platform === 'tiktok' ? 'TikTok' : acc.platform === 'snapchat' ? 'Snapchat' : acc.platform === 'youtube' ? 'YouTube' : acc.platform === 'twitter' ? 'X' : acc.platform}
                      </span>
                    ))}
                  </div>

                  {/* الفوتر */}
                  <div className={cn('flex items-center justify-between pt-2 border-t mt-auto', dark ? 'border-[#2a2a2a]' : 'border-gray-100')}>
                    <span className={cn('flex items-center gap-1 text-xs', dark ? 'text-gray-500' : 'text-gray-400')}>
                      <MapPin className="w-3 h-3" /> {inf.city ?? inf.country}
                    </span>
                    <Link href={`/${locale}/influencer/${inf.slug}`}
                      className="text-xs bg-violet-500 hover:bg-violet-600 text-white px-4 py-1.5 rounded-lg transition-colors font-medium">
                      {isAr ? 'عرض التفاصيل' : 'View Profile'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
