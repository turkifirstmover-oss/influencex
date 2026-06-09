'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BadgeCheck, MapPin, ArrowRight, Users, ExternalLink } from 'lucide-react'
import { MOCK_INFLUENCERS } from '@/lib/data'
import { formatNumber, getAvatarColor, cn } from '@/lib/utils'

const PLATFORM_LABELS: Record<string,string> = {
  instagram: 'Instagram', tiktok: 'TikTok', snapchat: 'Snapchat',
  youtube: 'YouTube', twitter: 'X',
}

const PLATFORM_COLORS: Record<string,{bg:string,text:string}> = {
  instagram: { bg: 'bg-pink-50',   text: 'text-pink-700'   },
  tiktok:    { bg: 'bg-gray-100',  text: 'text-gray-800'   },
  snapchat:  { bg: 'bg-yellow-50', text: 'text-yellow-800' },
  youtube:   { bg: 'bg-red-50',    text: 'text-red-700'    },
  twitter:   { bg: 'bg-gray-100',  text: 'text-gray-800'   },
}

const NICHE_LABELS: Record<string,string> = {
  news:'الصحافة', media:'الإعلام', business:'ريادة الأعمال',
  marketing:'التسويق', tech:'التقنية', ugc:'UGC',
  fal_license:'رخصة فال',
  lifestyle:'لايف ستايل', fashion:'أزياء', auto:'سيارات',
  sports:'رياضة', food:'طعام', travel:'سفر'
}

export default function InfluencerDetailPage() {
  const params = useParams()
  const locale = params.locale as string
  const slug = params.slug as string
  const isAr = locale === 'ar'

  const [inf, setInf] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/influencers/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setInf(data)
          setLoading(false)
          return
        }
      } catch {}
      const found = MOCK_INFLUENCERS.find(i => i.slug === slug)
      setInf(found ?? null)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (!inf) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
      <div>
        <p className="text-4xl font-bold text-gray-200 mb-2">404</p>
        <Link href={`/${locale}`} className="text-sm text-violet-600 hover:underline">
          {isAr ? 'العودة للرئيسية' : 'Back to home'}
        </Link>
      </div>
    </div>
  )

  const avatar = getAvatarColor(inf.full_name)
  const totalFollowers = inf.social_accounts?.reduce((s: number, a: any) => s + (a.followers ?? 0), 0) ?? inf.total_followers ?? 0
  const hasPrices = (inf.social_accounts ?? []).some((a: any) => a.price_from || a.price_to || a.price_from_home || a.price_to_home)

  return (
    <div className="min-h-screen bg-gray-50" dir={isAr ? 'rtl' : 'ltr'}>

      <nav className="bg-white border-b px-4 h-14 flex items-center sticky top-0 z-50">
        <Link href={`/${locale}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowRight className={cn('w-4 h-4', isAr ? '' : 'rotate-180')} />
          {isAr ? 'العودة' : 'Back'}
        </Link>
      </nav>

      <div className="h-28 bg-gradient-to-br from-violet-500 to-violet-700 relative">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',backgroundSize:'30px 30px'}}/>
      </div>

      <div className="max-w-3xl mx-auto px-4">

        <div className="bg-white border border-gray-100 rounded-2xl p-5 -mt-10 relative shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-shrink-0">
              {inf.avatar_url ? (
                <img src={inf.avatar_url} alt={inf.full_name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-sm"/>
              ) : (
                <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm', avatar.bg, avatar.text)}>
                  {inf.full_name?.slice(0, 2)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{inf.full_name}</h1>
                {inf.is_verified && <BadgeCheck className="w-5 h-5 text-blue-500"/>}
              </div>
              <p className="text-sm text-gray-500 mb-2">{inf.handle}</p>
              <div className="flex flex-wrap gap-1.5">
                {(inf.niche ?? []).map((n: string) => (
                  <span key={n} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
                    {NICHE_LABELS[n] ?? n}
                  </span>
                ))}
                {(inf.city || inf.country) && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3"/> {inf.city ?? inf.country}
                  </span>
                )}
              </div>
            </div>
          </div>
          {inf.bio && <p className="mt-4 text-sm text-gray-600 leading-relaxed border-t pt-4">{inf.bio}</p>}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <Users className="w-3.5 h-3.5"/> {isAr ? 'إجمالي المتابعين' : 'Total Followers'}
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(totalFollowers)}</div>
        </div>

        {/* السعر التقريبي */}
        {hasPrices && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              {isAr ? 'السعر التقريبي' : 'Estimated Price'}
            </h2>
            <div className="divide-y divide-gray-100">
              {(inf.social_accounts ?? []).map((acc: any, i: number) => {
                const hasOnsite = acc.price_from || acc.price_to
                const hasHome = acc.price_from_home || acc.price_to_home
                if (!hasOnsite && !hasHome) return null
                return (
                  <div key={i} className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        {PLATFORM_LABELS[acc.platform] ?? acc.platform}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {hasOnsite && (
                        <div className="bg-violet-50 rounded-xl px-3 py-2">
                          <div className="text-[10px] text-violet-500 font-medium mb-0.5">حضوري</div>
                          <div className="text-base font-bold text-gray-900">
                            {acc.price_to && formatNumber(Number(acc.price_to))}
                            {acc.price_from && acc.price_to && ' — '}
                            {acc.price_from && formatNumber(Number(acc.price_from))}
                            <span className="text-xs font-normal text-gray-400 mr-1">ريال</span>
                          </div>
                          {acc.price_note && (
                            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                              {acc.price_note}
                            </span>
                          )}
                        </div>
                      )}
                      {hasHome && (
                        <div className="bg-emerald-50 rounded-xl px-3 py-2">
                          <div className="text-[10px] text-emerald-600 font-medium mb-0.5">منزلي</div>
                          <div className="text-base font-bold text-gray-900">
                            {acc.price_to_home && formatNumber(Number(acc.price_to_home))}
                            {acc.price_from_home && acc.price_to_home && ' — '}
                            {acc.price_from_home && formatNumber(Number(acc.price_from_home))}
                            <span className="text-xs font-normal text-gray-400 mr-1">ريال</span>
                          </div>
                          {acc.price_note_home && (
                            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                              {acc.price_note_home}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {(inf.social_accounts ?? []).length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{isAr ? 'المنصات الاجتماعية' : 'Social Platforms'}</h2>
            <div className="space-y-2">
              {(inf.social_accounts ?? []).map((acc: any, i: number) => {
                const colors = PLATFORM_COLORS[acc.platform] ?? { bg: 'bg-gray-50', text: 'text-gray-700' }
                const inner = (
                  <div className={cn('flex items-center justify-between p-3 rounded-xl transition-opacity hover:opacity-80', colors.bg)}>
                    <div className="flex items-center gap-3">
                      <div className={cn('text-sm font-bold px-2 py-1 rounded-lg bg-white shadow-sm', colors.text)}>
                        {PLATFORM_LABELS[acc.platform] ?? acc.platform}
                      </div>
                      <span className="text-sm text-gray-500">{acc.handle}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-gray-900">{formatNumber(acc.followers)}</div>
                      {acc.profile_url && <ExternalLink className="w-4 h-4 text-gray-400"/>}
                    </div>
                  </div>
                )
                return acc.profile_url ? (
                  <a key={i} href={acc.profile_url} target="_blank" rel="noopener noreferrer">{inner}</a>
                ) : (
                  <div key={i}>{inner}</div>
                )
              })}
            </div>
          </div>
        )}

        {(inf.collab_types ?? []).length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{isAr ? 'أنواع التعاون' : 'Collaboration Types'}</h2>
            <div className="flex flex-wrap gap-2">
              {(inf.collab_types ?? []).map((c: string) => (
                <span key={c} className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        )}

        {(inf.brand_names ?? []).length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{isAr ? 'علامات تجارية سابقة' : 'Previous Collaborations'}</h2>
            <div className="flex flex-wrap gap-2">
              {(inf.brand_names ?? []).map((b: string) => (
                <span key={b} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium">{b}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
