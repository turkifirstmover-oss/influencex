'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { BadgeCheck, MapPin, Users, ExternalLink, Clock, Lock, Tag, Search, X, Moon, Sun } from 'lucide-react'
import { formatNumber, getAvatarColor, cn } from '@/lib/utils'

const PLATFORM_LABELS: Record<string,string> = {
  instagram:'Instagram', tiktok:'TikTok', snapchat:'Snapchat', youtube:'YouTube', twitter:'X',
}
const PLATFORM_COLORS: Record<string,{bg:string,text:string}> = {
  instagram:{ bg:'bg-pink-50',   text:'text-pink-700'   },
  tiktok:   { bg:'bg-gray-100',  text:'text-gray-800'   },
  snapchat: { bg:'bg-yellow-50', text:'text-yellow-800' },
  youtube:  { bg:'bg-red-50',    text:'text-red-700'    },
  twitter:  { bg:'bg-gray-100',  text:'text-gray-800'   },
}
const NICHE_LABELS: Record<string,string> = {
  news:'الصحافة', media:'إعلامي', business:'ريادة الأعمال',
  marketing:'تسويق', tech:'تقني', ugc:'UGC',
  lifestyle:'لايف ستايل', fashion:'أزياء', auto:'سيارات',
  sports:'رياضة', food:'طعام', travel:'سفر'
}
const NICHES = [
  { value:'all', label:'الكل' }, { value:'news', label:'الصحافة' },
  { value:'media', label:'إعلامي' }, { value:'business', label:'ريادة الأعمال' },
  { value:'marketing', label:'تسويق' }, { value:'tech', label:'تقني' },
  { value:'ugc', label:'UGC' },
]
const PLATFORMS = [
  { value:'all', label:'الكل', color:'' },
  { value:'instagram', label:'Instagram', color:'#E1306C' },
  { value:'tiktok', label:'TikTok', color:'#000000' },
  { value:'snapchat', label:'Snapchat', color:'#FFFC00' },
  { value:'youtube', label:'YouTube', color:'#FF0000' },
  { value:'twitter', label:'X', color:'#111111' },
]

const AVATAR_COLORS = [
  { bg:'bg-violet-100', text:'text-violet-700' },
  { bg:'bg-emerald-100', text:'text-emerald-700' },
  { bg:'bg-pink-100', text:'text-pink-700' },
  { bg:'bg-orange-100', text:'text-orange-700' },
  { bg:'bg-blue-100', text:'text-blue-700' },
  { bg:'bg-amber-100', text:'text-amber-700' },
]
function getAvColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)) % AVATAR_COLORS.length]
}

function getDaysLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function SharePage() {
  const params = useParams()
  const token = params.token as string

  const [state, setState] = useState<'loading'|'password'|'ready'|'expired'|'error'>('loading')
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)
  const [list, setList] = useState<any>(null)
  const [influencers, setInfluencers] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [dark, setDark] = useState(false)
  const [lang, setLang] = useState<'ar'|'en'>('ar')
  const [search, setSearch] = useState('')
  const [niche, setNiche] = useState('all')
  const [platform, setPlatform] = useState('all')
  const [gender, setGender] = useState<'all'|'male'|'female'>('all')
  const [verified, setVerified] = useState(false)

  const isAr = lang === 'ar'

  useEffect(() => { loadList() }, [token])

  async function loadList(pw?: string) {
    try {
      const url = `/api/share/${token}${pw ? `?password=${encodeURIComponent(pw)}` : ''}`
      const res = await fetch(url)
      if (res.status === 410) { setState('expired'); return }
      if (res.status === 403) { setState('password'); return }
      if (!res.ok) { setState('error'); return }
      const data = await res.json()
      if (data.list?.has_password && !pw) { setState('password'); return }
      setList(data.list)
      setInfluencers(data.influencers ?? [])
      setState('ready')
    } catch { setState('error') }
  }

  async function submitPassword() {
    setPwError(false)
    const res = await fetch(`/api/share/${token}?password=${encodeURIComponent(password)}`)
    if (res.status === 403) { setPwError(true); return }
    if (res.status === 410) { setState('expired'); return }
    if (!res.ok) { setState('error'); return }
    const data = await res.json()
    setList(data.list)
    setInfluencers(data.influencers ?? [])
    setState('ready')
  }

  const filtered = useMemo(() => {
    return influencers.filter(inf => {
      if (search && !inf.full_name?.includes(search) && !inf.handle?.includes(search)) return false
      if (niche !== 'all' && !inf.niche?.includes(niche)) return false
      if (platform !== 'all' && !inf.social_accounts?.some((s: any) => s.platform === platform)) return false
      if (gender !== 'all' && inf.gender !== gender) return false
      if (verified && !inf.is_verified) return false
      return true
    })
  }, [influencers, search, niche, platform, gender, verified])

  if (state === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (state === 'expired') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="text-center max-w-sm mx-auto p-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-red-400"/>
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">انتهت صلاحية هذا الرابط</h1>
        <p className="text-sm text-gray-400">تواصل مع الوكالة لتجديد الوصول</p>
      </div>
    </div>
  )

  if (state === 'error') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="text-center">
        <p className="text-4xl font-bold text-gray-200 mb-2">404</p>
        <p className="text-sm text-gray-400">الرابط غير صحيح</p>
      </div>
    </div>
  )

  if (state === 'password') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full mx-4 shadow-sm">
        <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-violet-600"/>
        </div>
        <h1 className="text-base font-bold text-gray-900 text-center mb-1">قائمة محمية</h1>
        <p className="text-xs text-gray-400 text-center mb-5">أدخل كلمة المرور للوصول</p>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitPassword()} placeholder="كلمة المرور"
          className={cn('w-full border rounded-xl px-3 py-2.5 text-sm outline-none mb-3 text-right',
            pwError ? 'border-red-300' : 'border-gray-200 focus:border-violet-400')}/>
        {pwError && <p className="text-xs text-red-500 mb-2 text-right">كلمة المرور غير صحيحة</p>}
        <button onClick={submitPassword} className="w-full bg-violet-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700">
          دخول
        </button>
      </div>
    </div>
  )

  const daysLeft = list?.expires_at ? getDaysLeft(list.expires_at) : null

  if (selected) {
    const avatar = getAvatarColor(selected.full_name)
    const totalFollowers = selected.social_accounts?.reduce((s: number, a: any) => s + (a.followers ?? 0), 0) ?? selected.total_followers ?? 0
    const hasPrices = (selected.social_accounts ?? []).some((a: any) => a.price_from || a.price_to)

    return (
      <div className={cn('min-h-screen', dark ? 'bg-[#0d0d0d]' : 'bg-gray-50')} dir={isAr ? 'rtl' : 'ltr'}>
        <nav className={cn('border-b px-4 h-14 flex items-center justify-between sticky top-0 z-50', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
          <button onClick={() => setSelected(null)} className={cn('flex items-center gap-1.5 text-sm hover:opacity-70', dark ? 'text-gray-400' : 'text-gray-500')}>
            ← {isAr ? 'العودة للقائمة' : 'Back to list'}
          </button>
          <span className={cn('text-xs font-medium', dark ? 'text-gray-400' : 'text-gray-400')}>{list?.name}</span>
        </nav>
        <div className="h-24 bg-gradient-to-br from-violet-600 to-violet-800"/>
        <div className="max-w-2xl mx-auto px-4">
          <div className={cn('border rounded-2xl p-5 -mt-8 shadow-sm mb-4', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
            <div className="flex items-start gap-4">
              {selected.avatar_url ? (
                <img src={selected.avatar_url} alt={selected.full_name} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-sm flex-shrink-0"/>
              ) : (
                <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-4 border-white shadow-sm flex-shrink-0', avatar.bg, avatar.text)}>
                  {selected.full_name?.slice(0,2)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className={cn('text-lg font-bold', dark ? 'text-white' : 'text-gray-900')}>{selected.full_name}</h1>
                  {selected.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500"/>}
                </div>
                <p className={cn('text-xs mb-2', dark ? 'text-gray-500' : 'text-gray-400')}>{selected.handle}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.niche ?? []).map((n: string) => (
                    <span key={n} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{NICHE_LABELS[n]??n}</span>
                  ))}
                  {selected.city && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full flex items-center gap-1', dark ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-100 text-gray-600')}>
                      <MapPin className="w-3 h-3"/>{selected.city}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {selected.bio && <p className={cn('mt-3 text-sm border-t pt-3', dark ? 'text-gray-400 border-[#2a2a2a]' : 'text-gray-600 border-gray-100')}>{selected.bio}</p>}
          </div>

          <div className={cn('border rounded-xl p-4 mb-4', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
            <div className={cn('flex items-center gap-1.5 text-xs mb-2', dark ? 'text-gray-500' : 'text-gray-400')}>
              <Users className="w-3.5 h-3.5"/> {isAr ? 'إجمالي المتابعين' : 'Total Followers'}
            </div>
            <div className={cn('text-2xl font-bold', dark ? 'text-white' : 'text-gray-900')}>{formatNumber(totalFollowers)}</div>
          </div>

          {hasPrices && (
            <div className={cn('border rounded-2xl p-4 mb-4', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
              <h2 className={cn('text-sm font-semibold mb-3', dark ? 'text-gray-300' : 'text-gray-700')}>{isAr ? 'السعر التقريبي' : 'Estimated Price'}</h2>
              <div className={cn('divide-y', dark ? 'divide-[#2a2a2a]' : 'divide-gray-100')}>
                {(selected.social_accounts ?? []).map((acc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      {(acc.price_from || acc.price_to) ? (
                        <>
                          <div className={cn('text-[10px] mb-0.5', dark ? 'text-gray-500' : 'text-gray-400')}>ابتداءً من</div>
                          <div className={cn('text-lg font-bold', dark ? 'text-white' : 'text-gray-900')}>
                            {acc.price_to && formatNumber(Number(acc.price_to))}
                            {acc.price_from && acc.price_to && ' — '}
                            {acc.price_from && formatNumber(Number(acc.price_from))}
                            <span className={cn('text-xs font-normal mr-1', dark ? 'text-gray-500' : 'text-gray-400')}>ريال</span>
                          </div>
                          {acc.price_note && (
                            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full mt-1 inline-block">{acc.price_note}</span>
                          )}
                        </>
                      ) : (
                        <span className={cn('text-xs', dark ? 'text-gray-500' : 'text-gray-400')}>— {isAr ? 'لا يوجد سعر' : 'No price'}</span>
                      )}
                    </div>
                    <span className={cn('text-sm font-semibold', dark ? 'text-gray-300' : 'text-gray-700')}>
                      {PLATFORM_LABELS[acc.platform] ?? acc.platform}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(selected.social_accounts ?? []).length > 0 && (
            <div className={cn('border rounded-2xl p-4 mb-8', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
              <h2 className={cn('text-sm font-semibold mb-3', dark ? 'text-gray-300' : 'text-gray-700')}>{isAr ? 'المنصات الاجتماعية' : 'Social Platforms'}</h2>
              <div className="space-y-2">
                {(selected.social_accounts ?? []).map((acc: any, i: number) => {
                  const colors = PLATFORM_COLORS[acc.platform] ?? {bg:'bg-gray-50',text:'text-gray-700'}
                  const inner = (
                    <div className={cn('flex items-center justify-between p-3 rounded-xl hover:opacity-80 transition-opacity', colors.bg)}>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-bold px-2 py-1 rounded-lg bg-white shadow-sm', colors.text)}>
                          {PLATFORM_LABELS[acc.platform]??acc.platform}
                        </span>
                        <span className="text-xs text-gray-500">{acc.handle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-900">{formatNumber(acc.followers)}</div>
                        {acc.profile_url && <ExternalLink className="w-3.5 h-3.5 text-gray-400"/>}
                      </div>
                    </div>
                  )
                  return acc.profile_url ? (
                    <a key={i} href={acc.profile_url} target="_blank" rel="noopener noreferrer">{inner}</a>
                  ) : <div key={i}>{inner}</div>
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('min-h-screen transition-colors duration-200', dark ? 'bg-[#0d0d0d]' : 'bg-gray-50')} dir={isAr ? 'rtl' : 'ltr'}>
      <nav className={cn('border-b px-4 h-14 flex items-center justify-between sticky top-0 z-50', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-800 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <span className={cn('text-sm font-bold', dark ? 'text-white' : 'text-gray-900')}>First Mover</span>
        </div>
        <div className="flex items-center gap-2">
          {daysLeft !== null && (
            <div className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full',
              daysLeft <= 2 ? 'bg-red-50 text-red-600' : daysLeft <= 5 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600')}>
              <Clock className="w-3 h-3"/>
              {daysLeft === 0 ? (isAr ? 'ينتهي اليوم' : 'Expires today') : `${daysLeft} ${isAr ? 'يوم متبقي' : 'days left'}`}
            </div>
          )}
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            className={cn('text-xs border px-3 py-1.5 rounded-lg', dark ? 'border-[#333] text-gray-300' : 'border-gray-200 text-gray-600')}>
            {isAr ? 'EN' : 'AR'}
          </button>
          <button onClick={() => setDark(d => !d)}
            className={cn('w-8 h-8 border rounded-lg flex items-center justify-center', dark ? 'border-[#333] text-gray-400' : 'border-gray-200 text-gray-500')}>
            {dark ? <Sun className="w-3.5 h-3.5"/> : <Moon className="w-3.5 h-3.5"/>}
          </button>
        </div>
      </nav>

      <section className={cn('border-b px-4 py-8 text-center', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
        <div className={cn('inline-flex items-center text-sm px-4 py-1.5 rounded-full mb-4 font-medium', dark ? 'bg-[#2a2440] text-violet-300' : 'bg-violet-50 text-violet-800')}>
          {list?.name}
        </div>
        <div className={cn('flex items-center rounded-xl overflow-hidden max-w-lg mx-auto', dark ? 'border border-[#333] bg-[#1a1a1a]' : 'border border-violet-200 bg-violet-50')}>
          <Search className={cn('w-4 h-4 mx-3 flex-shrink-0', dark ? 'text-gray-600' : 'text-violet-400')}/>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث بالاسم...' : 'Search...'}
            className={cn('flex-1 py-3 text-sm outline-none bg-transparent', dark ? 'text-white placeholder:text-gray-600' : 'text-gray-900 placeholder:text-violet-300')}/>
          {search && <button onClick={() => setSearch('')} className="p-2 me-1"><X className="w-4 h-4 text-gray-400"/></button>}
        </div>
      </section>

      <div className="max-w-5xl mx-auto flex">
        <aside className={cn('w-44 flex-shrink-0 border-r sticky top-14 self-start h-fit py-4 px-3 flex flex-col gap-5', dark ? 'bg-[#111] border-[#2a2a2a]' : 'bg-white border-gray-100')}>
          {(niche !== 'all' || platform !== 'all' || gender !== 'all' || verified) && (
            <button onClick={() => { setNiche('all'); setPlatform('all'); setGender('all'); setVerified(false) }}
              className="text-xs text-red-500 flex items-center gap-1 justify-end">
              {isAr ? 'مسح الكل' : 'Clear'} <X className="w-3 h-3"/>
            </button>
          )}

          <div className="flex flex-col gap-0.5">
            <span className={cn('text-xs font-medium px-2 mb-1 text-right', dark ? 'text-gray-500' : 'text-gray-400')}>{isAr ? 'المجال' : 'Niche'}</span>
            {NICHES.map(n => (
              <button key={n.value} onClick={() => setNiche(n.value)}
                className={cn('text-right text-sm px-2.5 py-1.5 rounded-lg transition-colors w-full',
                  niche === n.value ? 'bg-violet-50 text-violet-800 font-semibold' : dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-700 hover:bg-gray-50')}>
                {n.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-0.5">
            <span className={cn('text-xs font-medium px-2 mb-1 text-right', dark ? 'text-gray-500' : 'text-gray-400')}>{isAr ? 'المنصة' : 'Platform'}</span>
            {PLATFORMS.map(p => (
              <button key={p.value} onClick={() => setPlatform(p.value)}
                className={cn('flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-lg transition-colors w-full',
                  platform === p.value ? 'bg-violet-50 text-violet-800 font-semibold' : dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-700 hover:bg-gray-50')}>
                {p.color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:p.color, border:p.value==='snapchat'?'1px solid #ddd':'none'}}/>}
                <span className="flex-1 text-right">{p.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-0.5">
            <span className={cn('text-xs font-medium px-2 mb-1 text-right', dark ? 'text-gray-500' : 'text-gray-400')}>{isAr ? 'الجنس' : 'Gender'}</span>
            {(['all','male','female'] as const).map(g => (
              <button key={g} onClick={() => setGender(g)}
                className={cn('text-right text-sm px-2.5 py-1.5 rounded-lg transition-colors w-full',
                  gender === g ? 'bg-violet-50 text-violet-800 font-semibold' : dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-700 hover:bg-gray-50')}>
                {g === 'all' ? (isAr ? 'الجميع' : 'All') : g === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-0.5">
            <span className={cn('text-xs font-medium px-2 mb-1 text-right', dark ? 'text-gray-500' : 'text-gray-400')}>{isAr ? 'التوثيق' : 'Verified'}</span>
            <label className="flex items-center justify-end gap-2 px-2.5 py-1.5 cursor-pointer" onClick={() => setVerified(v => !v)}>
              <span className={cn('text-sm', dark ? 'text-gray-400' : 'text-gray-700')}>{isAr ? 'موثّقون فقط' : 'Verified only'}</span>
              <div className={cn('w-8 h-5 rounded-full relative transition-colors flex-shrink-0', verified ? 'bg-violet-700' : dark ? 'bg-[#333]' : 'bg-gray-200')}>
                <div className={cn('absolute w-3.5 h-3.5 bg-white rounded-full top-[3px] transition-all', verified ? 'right-[3px]' : 'right-[13px]')}/>
              </div>
            </label>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5">
          <div className={cn('text-xs mb-3', dark ? 'text-gray-500' : 'text-gray-400')}>
            {filtered.length} {isAr ? 'مؤثر' : 'influencers'}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30"/>
              <p className="text-sm">{isAr ? 'لا توجد نتائج' : 'No results'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(inf => {
                const av = getAvColor(inf.full_name)
                const hasSocials = (inf.social_accounts ?? []).length > 0
                const hasPrice = (inf.social_accounts ?? []).some((a: any) => a.price_from || a.price_to)
                const minPrice = (inf.social_accounts ?? [])
                  .filter((a: any) => a.price_from || a.price_to)
                  .reduce((min: number, a: any) => {
                    const p = Number(a.price_from ?? a.price_to)
                    return min === 0 ? p : Math.min(min, p)
                  }, 0)

                return (
                  <div key={inf.id} onClick={() => setSelected(inf)}
                    className={cn('rounded-2xl border p-4 flex flex-col gap-3 cursor-pointer transition-colors',
                      dark ? 'bg-[#111] border-[#2a2a2a] hover:border-[#3a3a3a]' : 'bg-white border-gray-100 hover:shadow-sm')}>
                    <div className="flex items-center gap-3">
                      {inf.avatar_url ? (
                        <img src={inf.avatar_url} alt={inf.full_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-100"/>
                      ) : (
                        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0', av.bg, av.text)}>
                          {inf.full_name?.slice(0,2)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className={cn('text-sm font-bold flex items-center gap-1', dark ? 'text-white' : 'text-gray-900')}>
                          {inf.full_name}
                          {inf.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"/>}
                        </div>
                        {inf.city && (
                          <div className={cn('text-xs flex items-center gap-1 mt-0.5', dark ? 'text-gray-500' : 'text-gray-500')}>
                            <MapPin className="w-3 h-3"/>{inf.city}، {inf.country ?? 'السعودية'}
                          </div>
                        )}
                        {inf.niche?.[0] && (
                          <div className={cn('text-xs flex items-center gap-1 mt-0.5', dark ? 'text-gray-500' : 'text-gray-500')}>
                            <Tag className="w-3 h-3"/>{NICHE_LABELS[inf.niche[0]] ?? inf.niche[0]}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={cn('border-t', dark ? 'border-[#2a2a2a]' : 'border-gray-100')}/>
                    {hasSocials && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {(inf.social_accounts ?? []).map((acc: any, i: number) => (
                          <div key={acc.id ?? acc.platform} className="flex items-center gap-1">
                            {i > 0 && <span className={cn('text-sm', dark ? 'text-gray-700' : 'text-gray-200')}>|</span>}
                            <span className={cn('text-xs font-bold', dark ? 'text-white' : 'text-gray-900')}>{formatNumber(acc.followers)}</span>
                            <span className={cn('text-xs', dark ? 'text-gray-500' : 'text-gray-400')}>{PLATFORM_LABELS[acc.platform] ?? acc.platform}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={cn('border-t mt-auto', dark ? 'border-[#2a2a2a]' : 'border-gray-100')}/>
                    <div className="flex items-center justify-between">
                      {hasPrice ? (
                        <div>
                          <div className={cn('text-[10px]', dark ? 'text-gray-500' : 'text-gray-400')}>ابتداءً من</div>
                          <div className={cn('text-sm font-bold', dark ? 'text-white' : 'text-gray-900')}>
                            {formatNumber(minPrice)}
                            <span className={cn('text-xs font-normal mr-1', dark ? 'text-gray-500' : 'text-gray-400')}>ريال</span>
                          </div>
                        </div>
                      ) : <span/>}
                      <span className="text-xs text-violet-600 font-medium">{isAr ? 'عرض التفاصيل ←' : 'View Details →'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
