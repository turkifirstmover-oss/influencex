'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Plus, Pencil, Trash2, Eye, Users, TrendingUp, Share2, Upload, Download, Search } from 'lucide-react'
import { MOCK_INFLUENCERS } from '@/lib/data'
import { formatNumber, getAvatarColor, NICHE_LABELS, cn } from '@/lib/utils'

export default function AdminPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const isAr = locale === 'ar'
  const [tab, setTab] = useState<'influencers' | 'lists' | 'import'>('influencers')
  const [search, setSearch] = useState('')

  const filtered = MOCK_INFLUENCERS.filter(i =>
    !search || i.full_name.includes(search) || i.handle?.includes(search)
  )

  return (
    <div className="min-h-screen bg-gray-50" dir={isAr ? 'rtl' : 'ltr'}>
      {/* TOP NAV */}
      <nav className="bg-gray-900 text-white px-4 h-14 flex items-center gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
          <ArrowRight className={cn('w-4 h-4', isAr ? '' : 'rotate-180')} />
        </Link>
        <div className="text-sm font-semibold">InfluenceX Admin</div>
        <div className="ms-auto flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
          {isAr ? 'مدير النظام' : 'System Admin'}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Users, label: isAr ? 'المؤثرون' : 'Influencers', value: MOCK_INFLUENCERS.length, color: 'text-brand-600' },
            { icon: Eye,   label: isAr ? 'مشاهدات اليوم' : "Today's Views", value: '1,248', color: 'text-emerald-600' },
            { icon: TrendingUp, label: isAr ? 'قوائم نشطة' : 'Active Lists', value: '12', color: 'text-amber-600' },
            { icon: Share2, label: isAr ? 'مشاركات' : 'Shares', value: '89', color: 'text-blue-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4">
              <Icon className={cn('w-5 h-5 mb-2', color)} />
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5">
          {([
            { id: 'influencers', label: isAr ? 'المؤثرون' : 'Influencers' },
            { id: 'lists', label: isAr ? 'قوائم المشاركة' : 'Share Lists' },
            { id: 'import', label: isAr ? 'استيراد البيانات' : 'Import Data' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('text-xs px-4 py-1.5 rounded-lg transition-colors',
                tab === t.id ? 'bg-white text-gray-900 font-medium shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: INFLUENCERS */}
        {tab === 'influencers' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                <Search className="w-4 h-4 text-gray-400 mx-3" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={isAr ? 'بحث...' : 'Search...'}
                  className="flex-1 py-2 text-sm outline-none" />
              </div>
              <button className="flex items-center gap-1.5 bg-brand-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-600">
                <Plus className="w-4 h-4" />
                {isAr ? 'إضافة مؤثر' : 'Add Influencer'}
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-start text-xs text-gray-400 font-medium px-4 py-3">{isAr ? 'المؤثر' : 'Influencer'}</th>
                    <th className="text-start text-xs text-gray-400 font-medium px-4 py-3 hidden md:table-cell">{isAr ? 'المجال' : 'Niche'}</th>
                    <th className="text-start text-xs text-gray-400 font-medium px-4 py-3 hidden md:table-cell">{isAr ? 'المتابعون' : 'Followers'}</th>
                    <th className="text-start text-xs text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">{isAr ? 'المشاهدات' : 'Views'}</th>
                    <th className="text-start text-xs text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">{isAr ? 'مشاهدات الملف' : 'Profile Views'}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(inf => {
                    const av = getAvatarColor(inf.full_name)
                    return (
                      <tr key={inf.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold', av.bg, av.text)}>
                              {inf.full_name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{inf.full_name}</div>
                              <div className="text-xs text-gray-400">{inf.handle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                            {NICHE_LABELS[inf.niche[0]]?.[isAr ? 'ar' : 'en']}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-700 font-medium">
                          {formatNumber(inf.total_followers ?? 0)}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-700">
                          {formatNumber(inf.avg_views ?? 0)}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-700">
                          {inf.profile_views.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/${locale}/influencer/${inf.slug}`}
                              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: LISTS */}
        {tab === 'lists' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">{isAr ? 'قوائم المشاركة مع العملاء' : 'Client Share Lists'}</h2>
              <button className="flex items-center gap-1.5 bg-brand-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-600">
                <Plus className="w-4 h-4" />
                {isAr ? 'قائمة جديدة' : 'New List'}
              </button>
            </div>
            <div className="space-y-3">
              {[
                { name: isAr ? 'حملة رمضان 2025' : 'Ramadan Campaign 2025', count: 5, views: 124, token: 'abc123', protected: true },
                { name: isAr ? 'عملاء السيارات' : 'Auto Clients', count: 3, views: 67, token: 'def456', protected: false },
                { name: isAr ? 'مؤثرو الطعام' : 'Food Influencers', count: 4, views: 89, token: 'ghi789', protected: true },
              ].map(list => (
                <div key={list.token} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{list.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {list.count} {isAr ? 'مؤثر' : 'influencers'} · {list.views} {isAr ? 'مشاهدة' : 'views'}
                      {list.protected && <span className="ms-2 text-amber-600">🔒 {isAr ? 'محمية' : 'Protected'}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">
                      /share/{list.token}
                    </code>
                    <button className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100">
                      {isAr ? 'نسخ الرابط' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: IMPORT */}
        {tab === 'import' && (
          <div className="max-w-lg">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">{isAr ? 'استيراد البيانات' : 'Import Data'}</h2>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-300 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{isAr ? 'اسحب ملف CSV أو Excel هنا' : 'Drop CSV or Excel file here'}</p>
                <p className="text-xs text-gray-400 mt-1">.csv, .xlsx, .xls</p>
                <button className="mt-3 text-xs bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600">
                  {isAr ? 'اختر ملفاً' : 'Choose File'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-gray-400" />
                <a href="#" className="text-xs text-brand-600 hover:underline">
                  {isAr ? 'تحميل نموذج CSV' : 'Download CSV Template'}
                </a>
              </div>
              <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                <strong>{isAr ? 'الأعمدة المطلوبة:' : 'Required columns:'}</strong><br />
                name, handle, country, city, gender, niche, instagram_followers, tiktok_followers, ...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
