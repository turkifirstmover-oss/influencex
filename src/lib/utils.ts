import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + 'K'
  return String(n)
}

export const NICHE_LABELS: Record<string, { ar: string; en: string }> = {
  lifestyle: { ar: 'لايف ستايل', en: 'Lifestyle' },
  fashion:   { ar: 'أزياء',      en: 'Fashion'   },
  tech:      { ar: 'تقنية',      en: 'Tech'      },
  auto:      { ar: 'سيارات',     en: 'Auto'      },
  sports:    { ar: 'رياضة',      en: 'Sports'    },
  food:      { ar: 'طعام',       en: 'Food'      },
  travel:    { ar: 'سفر',        en: 'Travel'    },
  business:  { ar: 'أعمال',      en: 'Business'  },
}

export const PLATFORM_META: Record<string, { label: string; color: string; bg: string }> = {
  instagram: { label: 'IG', color: 'text-pink-700',   bg: 'bg-pink-50'  },
  tiktok:    { label: 'TT', color: 'text-white',      bg: 'bg-gray-900' },
  snapchat:  { label: 'SC', color: 'text-amber-700',  bg: 'bg-amber-50' },
  youtube:   { label: 'YT', color: 'text-red-700',    bg: 'bg-red-50'   },
  twitter:   { label: 'X',  color: 'text-blue-700',   bg: 'bg-blue-50'  },
}

export const AVATAR_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700'  },
  { bg: 'bg-emerald-100',text: 'text-emerald-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700'  },
  { bg: 'bg-pink-100',   text: 'text-pink-700'    },
  { bg: 'bg-blue-100',   text: 'text-blue-700'    },
  { bg: 'bg-amber-100',  text: 'text-amber-700'   },
]

export function getAvatarColor(name: string) {
  const i = (name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[i]
}
