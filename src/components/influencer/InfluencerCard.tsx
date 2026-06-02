'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck, MapPin, Users, Eye } from 'lucide-react'
import { Influencer } from '@/types'
import { cn, formatNumber, NICHE_LABELS, PLATFORM_META, getAvatarColor } from '@/lib/utils'

interface InfluencerCardProps {
  influencer: Influencer
  locale: string
  isSelected?: boolean
  onSelect?: (id: string) => void
}

export function InfluencerCard({ influencer, locale, isSelected, onSelect }: InfluencerCardProps) {
  const isAr = locale === 'ar'
  const avatar = getAvatarColor(influencer.full_name)
  const engHigh = (influencer.avg_engagement ?? 0) >= 5

  return (
    <div
      className={cn(
        'relative bg-white border rounded-xl p-4 transition-all duration-150 group',
        'hover:shadow-sm hover:border-gray-200',
        isSelected ? 'border-brand-400 ring-2 ring-brand-100' : 'border-gray-100',
        onSelect && 'cursor-pointer'
      )}
      onClick={() => onSelect?.(influencer.id)}
    >
      {/* Engagement badge */}
      <span className={cn(
        'absolute top-3 end-3 text-xs px-2 py-0.5 rounded-full font-medium',
        engHigh ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      )}>
        {influencer.avg_engagement?.toFixed(1)}%
      </span>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold flex-shrink-0', avatar.bg, avatar.text)}>
          {influencer.avatar_url ? (
            <Image src={influencer.avatar_url} alt={influencer.full_name} width={48} height={48} className="rounded-full object-cover w-12 h-12" />
          ) : influencer.full_name.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{influencer.full_name}</h3>
            {influencer.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {influencer.niche.slice(0, 2).map(n => NICHE_LABELS[n]?.[isAr ? 'ar' : 'en']).join(' · ')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5">
            <Users className="w-3 h-3" />
            {isAr ? 'متابعون' : 'Followers'}
          </div>
          <div className="text-sm font-semibold text-gray-900">{formatNumber(influencer.total_followers ?? 0)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5">
            <Eye className="w-3 h-3" />
            {isAr ? 'مشاهدات' : 'Views'}
          </div>
          <div className="text-sm font-semibold text-gray-900">{formatNumber(influencer.avg_views ?? 0)}</div>
        </div>
      </div>

      {/* Platforms */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {influencer.social_accounts?.map(acc => {
          const meta = PLATFORM_META[acc.platform]
          if (!meta) return null
          return (
            <span key={acc.id} className={cn('w-6 h-6 rounded text-[10px] flex items-center justify-center font-bold', meta.bg, meta.color)}>
              {meta.label}
            </span>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          {influencer.city ? `${influencer.city}` : influencer.country}
        </span>
        <Link
          href={`/${locale}/influencer/${influencer.slug}`}
          onClick={e => e.stopPropagation()}
          className="text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {isAr ? 'عرض التفاصيل' : 'View Profile'}
        </Link>
      </div>
    </div>
  )
}
