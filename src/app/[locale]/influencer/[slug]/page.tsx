import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BadgeCheck, MapPin, ArrowRight, Users, Eye, TrendingUp, Link2, Share2, Lock, ExternalLink } from 'lucide-react'
import { MOCK_INFLUENCERS } from '@/lib/data'
import { NICHE_LABELS, PLATFORM_META, formatNumber, getAvatarColor, cn } from '@/lib/utils'

export async function generateStaticParams() {
  return MOCK_INFLUENCERS.map(inf => ({ slug: inf.slug }))
}

export default function InfluencerDetailPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const { locale, slug } = params
  const isAr = locale === 'ar'
  const inf = MOCK_INFLUENCERS.find(i => i.slug === slug)
  if (!inf) notFound()

  const avatar = getAvatarColor(inf.full_name)
  const totalFollowers = inf.social_accounts?.reduce((s, a) => s + a.followers, 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-50" dir={isAr ? 'rtl' : 'ltr'}>

      {/* NAV */}
      <nav className="bg-white border-b px-4 h-14 flex items-center">
        <Link href={`/${locale}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowRight className={cn('w-4 h-4', isAr ? '' : 'rotate-180')} />
          {isAr ? 'العودة' : 'Back'}
        </Link>
      </nav>

      {/* COVER */}
      <div className="h-32 md:h-44 bg-gradient-to-br from-brand-500 to-brand-700 relative">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* PROFILE HEADER */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 -mt-10 relative shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 border-4 border-white shadow-sm', avatar.bg, avatar.text)}>
              {inf.full_name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{inf.full_name}</h1>
                {inf.is_verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
              </div>
              <p className="text-sm text-gray-500 mb-2">{inf.handle}</p>
              <div className="flex flex-wrap gap-1.5">
                {inf.niche.map(n => (
                  <span key={n} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                    {NICHE_LABELS[n]?.[isAr ? 'ar' : 'en']}
                  </span>
                ))}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {inf.city ?? inf.country}
                </span>
              </div>
            </div>
            {/* Share buttons */}
            <div className="flex gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                <Link2 className="w-3.5 h-3.5" /> {isAr ? 'نسخ الرابط' : 'Copy link'}
              </button>
              <button className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                <Share2 className="w-3.5 h-3.5" /> {isAr ? 'إضافة للقائمة' : 'Add to list'}
              </button>
              <Link href={`/${locale}/admin`}
                className="flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800">
                <Lock className="w-3.5 h-3.5" /> {isAr ? 'رابط محمي' : 'Private link'}
              </Link>
            </div>
          </div>

          {/* Bio */}
          {inf.bio && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed border-t pt-4">{inf.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
            <span>{isAr ? 'الدولة:' : 'Country:'} {inf.country}</span>
            <span>·</span>
            <span>{isAr ? 'المدينة:' : 'City:'} {inf.city ?? '—'}</span>
            <span>·</span>
            <span>{isAr ? 'اللغات:' : 'Languages:'} {inf.languages.join('، ')}</span>
            <span>·</span>
            <span>{isAr ? 'الجنس:' : 'Gender:'} {inf.gender === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {[
            { icon: Users, label: isAr ? 'إجمالي المتابعين' : 'Total Followers', value: formatNumber(totalFollowers), sub: isAr ? 'عبر جميع المنصات' : 'all platforms' },
            { icon: Eye, label: isAr ? 'متوسط المشاهدات' : 'Avg Views', value: formatNumber(inf.avg_views ?? 0), sub: isAr ? 'لكل منشور' : 'per post' },
            { icon: TrendingUp, label: isAr ? 'معدل التفاعل' : 'Engagement Rate', value: `${inf.avg_engagement?.toFixed(1)}%`, sub: isAr ? 'متوسط عالٍ' : 'above average' },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                <Icon className="w-3.5 h-3.5" /> {label}
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-emerald-600 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* SOCIAL ACCOUNTS */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {isAr ? 'المنصات الاجتماعية' : 'Social Platforms'}
          </h2>
          <div className="space-y-2">
            {inf.social_accounts?.map(acc => {
              const meta = PLATFORM_META[acc.platform]
              return (
                <div key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold', meta?.bg, meta?.color)}>
                      {meta?.label}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{acc.platform}</div>
                      <div className="text-xs text-gray-400">{acc.handle}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatNumber(acc.followers)}</div>
                    <div className="text-xs text-gray-400">{acc.engagement_rate}% {isAr ? 'تفاعل' : 'eng'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* PORTFOLIO placeholder */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {isAr ? 'معرض الأعمال' : 'Portfolio'}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                {i % 2 === 0 ? '🖼' : '🎬'}
              </div>
            ))}
          </div>
        </div>

        {/* COLLAB TYPES */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {isAr ? 'أنواع التعاون المتاحة' : 'Collaboration Types'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {inf.collab_types?.map(c => (
              <span key={c} className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full">{c}</span>
            ))}
          </div>
        </div>

        {/* BRANDS */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {isAr ? 'علامات تجارية سابقة' : 'Previous Brand Collaborations'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {inf.brand_names?.map(b => (
              <span key={b} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
