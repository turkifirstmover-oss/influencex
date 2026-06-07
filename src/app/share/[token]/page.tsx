'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { BadgeCheck, MapPin, Users, Eye, TrendingUp, ExternalLink, Clock, Lock, DollarSign, Tag } from 'lucide-react'
import { formatNumber, getAvatarColor, cn } from '@/lib/utils'

const PLATFORM_LABELS: Record<string,string> = {
  instagram:'Instagram', tiktok:'TikTok', snapchat:'Snapchat', youtube:'YouTube', twitter:'X',
}
const PLATFORM_ICONS: Record<string,string> = {
  instagram:'📸', tiktok:'🎵', snapchat:'👻', youtube:'▶️', twitter:'✕',
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
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitPassword()}
          placeholder="كلمة المرور"
          className={cn('w-full border rounded-xl px-3 py-2.5 text-sm outline-none mb-3 text-right',
            pwError ? 'border-red-300' : 'border-gray-200 focus:border-violet-400')}
        />
        {pwError && <p className="text-xs text-red-500 mb-2 text-right">كلمة المرور غير صحيحة</p>}
        <button onClick={submitPassword}
          className="w-full bg-violet-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700">
          دخول
        </button>
      </div>
    </div>
  )

  const daysLeft = list?.expires_at ? getDaysLeft(list.expires_at) : null

  // تفاصيل مؤثر
  if (selected) {
    const avatar = getAvatarColor(selected.full_name)
    const totalFollowers = selected.social_accounts?.reduce((s: number, a: any) => s + (a.followers ?? 0), 0) ?? selected.total_followers ?? 0
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <nav className="bg-white border-b px-4 h-14 flex items-center justify-between sticky top-0 z-50">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            ← العودة للقائمة
          </button>
          <span className="text-xs text-gray-400 font-medium">{list?.name}</span>
        </nav>
        <div className="h-24 bg-gradient-to-br from-violet-500 to-violet-700"/>
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 -mt-8 shadow-sm mb-4">
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
                  <h1 className="text-lg font-bold text-gray-900">{selected.full_name}</h1>
                  {selected.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500"/>}
                </div>
                <p className="text-xs text-gray-400 mb-2">{selected.handle}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.niche ?? []).map((n: string) => (
                    <span key={n} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{NICHE_LABELS[n]??n}</span>
                  ))}
                  {selected.city && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3"/>{selected.city}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {selected.bio && <p className="mt-3 text-sm text-gray-600 border-t pt-3">{selected.bio}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: Users, label: 'المتابعون', value: formatNumber(totalFollowers) },
              { icon: Eye, label: 'المشاهدات', value: formatNumber(selected.avg_views ?? 0) },
              { icon: TrendingUp, label: 'التفاعل', value: `${Number(selected.avg_engagement ?? 0).toFixed(1)}%` },
            ].map(({icon:Icon, label, value}) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                <Icon className="w-4 h-4 text-gray-400 mx-auto mb-1"/>
                <div className="text-lg font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          {(selected.price_from || selected.price_to) && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4"/> السعر التقريبي
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-bold text-gray-900">
                  {selected.price_from && formatNumber(Number(selected.price_from))}
                  {selected.price_from && selected.price_to && ' — '}
                  {selected.price_to && formatNumber(Number(selected.price_to))}
                </span>
                <span className="text-sm text-gray-500">ريال</span>
                {selected.price_note && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{selected.price_note}</span>
                )}
              </div>
            </div>
          )}

          {(selected.social_accounts ?? []).length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-8">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">المنصات الاجتماعية</h2>
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
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{formatNumber(acc.followers)}</div>
                          <div className="text-xs text-gray-400">{acc.engagement_rate}%</div>
                        </div>
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

  // القائمة الرئيسية
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <nav className="bg-white border-b px-4 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">First Mover</span>
        </div>
        {daysLeft !== null && (
          <div className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full',
            daysLeft <= 2 ? 'bg-red-50 text-red-600' : daysLeft <= 5 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600')}>
            <Clock className="w-3 h-3"/>
            {daysLeft === 0 ? 'ينتهي اليوم' : `${daysLeft} يوم متبقي`}
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{list?.name}</h1>
          <p className="text-sm text-gray-400">{influencers.length} مؤثر في هذه القائمة</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {influencers.map(inf => {
            const av = getAvatarColor(inf.full_name)
            const hasSocials = (inf.social_accounts ?? []).length > 0
            const hasPrice = inf.price_from || inf.price_to

            return (
              <div key={inf.id} onClick={() => setSelected(inf)}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow">

                {/* الهيدر: صورة + اسم + موقع + مجال */}
                <div className="flex items-center gap-3">
                  {inf.avatar_url ? (
                    <img src={inf.avatar_url} alt={inf.full_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-100"/>
                  ) : (
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0', av.bg, av.text)}>
                      {inf.full_name?.slice(0,2)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 text-right">
                    <div className="text-sm font-semibold text-gray-900 flex items-center justify-end gap-1 truncate">
                      {inf.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"/>}
                      {inf.full_name}
                    </div>
                    {inf.city && (
                      <div className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                        <MapPin className="w-3 h-3"/>
                        {inf.city}، {inf.country ?? 'السعودية'}
                      </div>
                    )}
                    {inf.niche?.[0] && (
                      <div className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                        <Tag className="w-3 h-3"/>
                        {NICHE_LABELS[inf.niche[0]] ?? inf.niche[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* فاصل */}
                <div className="border-t border-gray-100"/>

                {/* المنصات بأرقامها */}
                {hasSocials && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {(inf.social_accounts ?? []).map((acc: any, i: number) => (
                      <div key={acc.id ?? acc.platform} className="flex items-center gap-1">
                        {i > 0 && <span className="text-gray-200 text-sm">|</span>}
                        <span className="text-xs font-semibold text-gray-700">
                          {formatNumber(acc.followers)}
                        </span>
                        <span className="text-xs text-gray-400">{PLATFORM_LABELS[acc.platform] ?? acc.platform}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* فاصل */}
                <div className="border-t border-gray-100"/>

                {/* السعر + عرض التفاصيل */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-violet-600 font-medium">عرض التفاصيل ←</span>
                  {hasPrice ? (
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400">ابتداءً من</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatNumber(Number(inf.price_from ?? inf.price_to))}
                        <span className="text-xs font-normal text-gray-400 mr-1">ريال</span>
                      </div>
                    </div>
                  ) : null}
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
