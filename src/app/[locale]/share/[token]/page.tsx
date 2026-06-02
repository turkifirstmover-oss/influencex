'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, ExternalLink, Users, Eye, TrendingUp, Sparkles } from 'lucide-react'
import { formatNumber, getAvatarColor, NICHE_LABELS, PLATFORM_META, cn } from '@/lib/utils'

interface SharePageProps {
  params: { locale: string; token: string }
}

export default function SharePage({ params: { locale, token } }: SharePageProps) {
  const isAr = locale === 'ar'
  const [state, setState] = useState<'loading' | 'protected' | 'ready' | 'error' | 'expired'>('loading')
  const [password, setPassword] = useState('')
  const [list, setList] = useState<any>(null)
  const [error, setError] = useState('')

  async function fetchList(pw?: string) {
    setState('loading')
    const url = `/api/share?token=${token}${pw ? `&password=${encodeURIComponent(pw)}` : ''}`
    const res = await fetch(url)
    const data = await res.json()

    if (res.status === 401 && data.protected) { setState('protected'); return }
    if (res.status === 403) { setError(isAr ? 'كلمة المرور غلط' : 'Wrong password'); setState('protected'); return }
    if (res.status === 410) { setState('expired'); return }
    if (!res.ok) { setState('error'); return }

    setList(data)
    setState('ready')
  }

  useEffect(() => { fetchList() }, [token])

  // LOADING
  if (state === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</p>
      </div>
    </div>
  )

  // EXPIRED
  if (state === 'expired') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center max-w-sm px-4">
        <div className="text-4xl mb-4">⏰</div>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">{isAr ? 'انتهت صلاحية الرابط' : 'Link Expired'}</h1>
        <p className="text-sm text-gray-500">{isAr ? 'يرجى التواصل مع الوكالة للحصول على رابط جديد.' : 'Please contact the agency for a new link.'}</p>
      </div>
    </div>
  )

  // PASSWORD PROTECTED
  if (state === 'protected') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-sm text-center">
        <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-brand-600" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">{isAr ? 'قائمة محمية' : 'Protected List'}</h1>
        <p className="text-sm text-gray-500 mb-5">{isAr ? 'أدخل كلمة المرور للوصول' : 'Enter password to access'}</p>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchList(password)}
          placeholder={isAr ? 'كلمة المرور...' : 'Password...'}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400 mb-3"
        />
        <button onClick={() => fetchList(password)}
          className="w-full bg-brand-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-600">
          {isAr ? 'دخول' : 'Enter'}
        </button>
      </div>
    </div>
  )

  // ERROR
  if (state === 'error') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-gray-500">{isAr ? 'القائمة غير موجودة' : 'List not found'}</p>
      </div>
    </div>
  )

  // READY
  const influencers = list?.client_list_influencers?.map((cli: any) => cli.influencers) ?? []

  return (
    <div className="min-h-screen bg-gray-50" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">InfluenceX</span>
          </div>
          <div className="text-xs text-gray-400">{isAr ? 'قائمة مؤثرين مخصصة' : 'Curated Influencer List'}</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* List info */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{list?.name}</h1>
          {list?.description && <p className="text-sm text-gray-500 mt-1">{list.description}</p>}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span>{influencers.length} {isAr ? 'مؤثر' : 'influencers'}</span>
            <span>·</span>
            <span>{isAr ? 'شاركها معك فريق InfluenceX' : 'Shared by InfluenceX team'}</span>
          </div>
        </div>

        {/* Influencer cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {influencers.map((inf: any) => {
            if (!inf) return null
            const av = getAvatarColor(inf.full_name ?? 'U')
            return (
              <div key={inf.id} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0', av.bg, av.text)}>
                    {(inf.full_name ?? '??').slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{inf.full_name}</div>
                    <div className="text-xs text-gray-400">{inf.city ?? inf.country}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { icon: Users, v: formatNumber(inf.total_followers ?? 0) },
                    { icon: Eye,   v: formatNumber(inf.avg_views ?? 0) },
                    { icon: TrendingUp, v: `${inf.avg_engagement ?? 0}%` },
                  ].map(({ icon: Icon, v }, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-1.5 text-center">
                      <Icon className="w-3 h-3 text-gray-400 mx-auto mb-0.5" />
                      <div className="text-xs font-semibold text-gray-800">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(inf.niche ?? []).slice(0, 2).map((n: string) => (
                    <span key={n} className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                      {NICHE_LABELS[n]?.[isAr ? 'ar' : 'en'] ?? n}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-400 mb-2">{isAr ? 'مهتم بالتعاون؟ تواصل معنا' : 'Interested in collaborating? Contact us'}</p>
          <a href="mailto:info@influencex.sa" className="text-xs text-brand-600 hover:underline flex items-center gap-1 justify-center">
            <ExternalLink className="w-3 h-3" /> info@influencex.sa
          </a>
        </div>
      </div>
    </div>
  )
}
