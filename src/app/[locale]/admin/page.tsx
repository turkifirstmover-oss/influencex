'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Plus, Pencil, Trash2, Eye, Search, X, Save,
  Check, AlertCircle, Link2, ImageIcon, Share2,
  Upload, Download, Clock, Copy
} from 'lucide-react'

const NICHES = ['news','media','business','marketing','tech','ugc','fal_license']
const NICHE_AR: Record<string,string> = {
  news:'الصحافة', media:'الإعلام', business:'ريادة الأعمال',
  marketing:'التسويق', tech:'التقنية', ugc:'UGC', fal_license:'رخصة فال'
}
const PLATFORMS = ['instagram','tiktok','snapchat','youtube','twitter']
const PLATFORM_LABELS: Record<string,string> = {
  instagram:'Instagram', tiktok:'TikTok', snapchat:'Snapchat',
  youtube:'YouTube', twitter:'X'
}

const emptyInfluencer = () => ({
  id:'', slug:'', full_name:'', handle:'', bio:'',
  avatar_url:'', country:'السعودية', city:'', gender:'female',
  niche:[] as string[], languages:['العربية'],
  is_verified:false, is_featured:false, is_active:true,
  social_accounts:[] as any[],
  brand_names:[] as string[], collab_types:[] as string[],
})

function cn(...classes: any[]) { return classes.filter(Boolean).join(' ') }

export default function AdminPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const isAr = locale === 'ar'
  const [tab, setTab] = useState<'influencers'|'lists'|'import'>('influencers')
  const [search, setSearch] = useState('')
  const [influencers, setInfluencers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<any>(emptyInfluencer())
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{msg:string,type:'ok'|'err'}|null>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [listName, setListName] = useState('')
  const [listPw, setListPw] = useState('')
  const [expiryDays, setExpiryDays] = useState(7)
  const [shareLink, setShareLink] = useState('')
  const [shareLists, setShareLists] = useState<any[]>([])
  const [importResult, setImportResult] = useState<any>(null)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, type: 'ok'|'err' = 'ok') => {
    setToast({msg,type}); setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => { loadInfluencers() }, [])

  async function loadInfluencers() {
    setLoading(true)
    try {
      const r = await fetch('/api/influencers?per_page=100')
      const d = await r.json()
      setInfluencers(d.data ?? [])
    } catch { showToast('خطأ في تحميل البيانات', 'err') }
    setLoading(false)
  }

  async function loadShareLists() {
    try {
      const r = await fetch('/api/share')
      const d = await r.json()
      setShareLists(Array.isArray(d) ? d : [])
    } catch {}
  }

  useEffect(() => { if (tab === 'lists') loadShareLists() }, [tab])

  function openAdd() { setEditData(emptyInfluencer()); setShowForm(true) }
  function openEdit(inf: any) {
    setEditData({...emptyInfluencer(),...inf,
      niche:inf.niche??[], social_accounts:inf.social_accounts??[],
      brand_names:inf.brand_names??[], collab_types:inf.collab_types??[],
    })
    setShowForm(true)
  }

  async function saveInfluencer() {
    if (!editData.full_name.trim()) { showToast('الاسم مطلوب','err'); return }
    setSaving(true)
    try {
      const isNew = !editData.id
      const url = isNew ? '/api/influencers' : `/api/influencers/${editData.id}`
      const method = isNew ? 'POST' : 'PUT'
      const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(editData) })
      if (!r.ok) throw new Error(await r.text())
      showToast(isNew ? 'تمت الإضافة ✅' : 'تم التعديل ✅')
      setShowForm(false); loadInfluencers()
    } catch (e: any) { showToast('خطأ: '+e.message,'err') }
    setSaving(false)
  }

  async function deleteInfluencer(id: string) {
    try {
      await fetch(`/api/influencers/${id}`, { method:'DELETE' })
      showToast('تم الحذف'); setDeleteId(null); loadInfluencers()
    } catch { showToast('خطأ في الحذف','err') }
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true)
    try {
      const fd = new FormData(); fd.append('file',file); fd.append('folder','avatars')
      const r = await fetch('/api/upload', { method:'POST', body:fd })
      const d = await r.json()
      if (d.url) { setEditData((p:any) => ({...p,avatar_url:d.url})); showToast('تم رفع الصورة ✅') }
      else throw new Error(d.error)
    } catch (e:any) { showToast('خطأ في الرفع: '+e.message,'err') }
    setUploadingAvatar(false)
  }

  async function createShareList() {
    if (!listName.trim()) { showToast('اسم القائمة مطلوب','err'); return }
    if (selectedIds.size === 0) { showToast('اختر مؤثراً على الأقل','err'); return }
    try {
      const r = await fetch('/api/share', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:listName, password:listPw||undefined, influencer_ids:Array.from(selectedIds), expires_in_days:expiryDays })
      })
      const d = await r.json()
      setShareLink(d.share_url ?? '')
      showToast('تم إنشاء الرابط ✅')
      loadShareLists()
    } catch { showToast('خطأ في إنشاء القائمة','err') }
  }

  async function extendList(id: string, days: number) {
    try {
      await fetch('/api/share', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id, expires_in_days:days}) })
      showToast(`تم التمديد +${days} أيام ✅`); loadShareLists()
    } catch { showToast('خطأ','err') }
  }

  async function toggleListActive(id: string, is_active: boolean) {
    try {
      await fetch('/api/share', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id, is_active}) })
      showToast(is_active ? 'تم التفعيل ✅' : 'تم الإيقاف'); loadShareLists()
    } catch { showToast('خطأ','err') }
  }

  async function handleImport(file: File) {
    setImporting(true)
    const fd = new FormData(); fd.append('file',file)
    try {
      const r = await fetch('/api/import', { method:'POST', body:fd })
      const d = await r.json()
      setImportResult(d)
      if (d.success > 0) { loadInfluencers(); showToast(`تم استيراد ${d.success} مؤثر ✅`) }
    } catch { showToast('خطأ في الاستيراد','err') }
    setImporting(false)
  }

  function addSocial() {
    setEditData((p:any) => ({...p, social_accounts:[...(p.social_accounts??[]),
      {platform:'instagram',handle:'',followers:0,profile_url:'',price_from:'',price_to:'',price_note:'غير شامل الضريبة'}
    ]}))
  }
  function updateSocial(i:number, key:string, val:any) {
    setEditData((p:any) => { const a=[...(p.social_accounts??[])]; a[i]={...a[i],[key]:val}; return {...p,social_accounts:a} })
  }
  function removeSocial(i:number) {
    setEditData((p:any) => ({...p, social_accounts:(p.social_accounts??[]).filter((_:any,j:number)=>j!==i)}))
  }

  const filtered = influencers.filter(i => !search || i.full_name?.includes(search) || i.handle?.includes(search))

  return (
    <div className="min-h-screen bg-gray-50" dir={isAr?'rtl':'ltr'}>

      {toast && (
        <div className={cn('fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm shadow-lg',
          toast.type==='ok'?'bg-gray-900 text-white':'bg-red-500 text-white')}>
          {toast.type==='ok'?<Check className="w-4 h-4"/>:<AlertCircle className="w-4 h-4"/>}
          {toast.msg}
        </div>
      )}

      <nav className="bg-gray-900 text-white px-4 h-14 flex items-center gap-4 sticky top-0 z-50">
        <Link href={`/${locale}`} className="text-gray-400 hover:text-white">
          <ArrowRight className={cn('w-4 h-4', isAr?'':'rotate-180')}/>
        </Link>
        <span className="text-sm font-semibold">First Mover — لوحة التحكم</span>
        <div className="ms-auto text-xs text-gray-400">{filtered.length} مؤثر</div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {([['influencers','المؤثرون'],['lists','قوائم المشاركة'],['import','استيراد CSV']] as const).map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)}
              className={cn('text-xs px-4 py-1.5 rounded-lg transition-colors',
                tab===id?'bg-white text-gray-900 font-medium shadow-sm':'text-gray-500 hover:text-gray-700')}>
              {label}
            </button>
          ))}
        </div>

        {tab==='influencers' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                <Search className="w-4 h-4 text-gray-400 mx-3"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث..." className="flex-1 py-2 text-sm outline-none"/>
                {search && <button onClick={()=>setSearch('')} className="p-2"><X className="w-3.5 h-3.5 text-gray-400"/></button>}
              </div>
              <button onClick={openAdd} className="flex items-center gap-1.5 bg-violet-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-violet-700">
                <Plus className="w-4 h-4"/> إضافة مؤثر
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">{Array.from({length:5}).map((_,i)=>(
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>
              ))}</div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="w-10 px-4 py-3">
                        <input type="checkbox" onChange={e=>{
                          if(e.target.checked) setSelectedIds(new Set(filtered.map(i=>i.id)))
                          else setSelectedIds(new Set())
                        }}/>
                      </th>
                      <th className="text-start text-xs text-gray-400 font-medium px-4 py-3">المؤثر</th>
                      <th className="text-start text-xs text-gray-400 font-medium px-4 py-3 hidden md:table-cell">المجال</th>
                      <th className="text-start text-xs text-gray-400 font-medium px-4 py-3 hidden md:table-cell">المتابعون</th>
                      <th className="px-4 py-3"/>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(inf => (
                      <tr key={inf.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedIds.has(inf.id)}
                            onChange={e=>{const s=new Set(selectedIds);e.target.checked?s.add(inf.id):s.delete(inf.id);setSelectedIds(s)}}/>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {inf.avatar_url ? (
                              <img src={inf.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover"/>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">
                                {inf.full_name?.slice(0,2)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{inf.full_name}</div>
                              <div className="text-xs text-gray-400">{inf.handle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {(inf.niche??[]).slice(0,2).map((n:string)=>(
                              <span key={n} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{NICHE_AR[n]??n}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-700 font-medium">
                          {inf.total_followers ? (
                            inf.total_followers>=1e6 ? (inf.total_followers/1e6).toFixed(1)+'M' :
                            inf.total_followers>=1000 ? (inf.total_followers/1000).toFixed(0)+'K' :
                            inf.total_followers
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/${locale}/influencer/${inf.slug}`} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                              <Eye className="w-3.5 h-3.5"/>
                            </Link>
                            <button onClick={()=>openEdit(inf)} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg">
                              <Pencil className="w-3.5 h-3.5"/>
                            </button>
                            <button onClick={()=>setDeleteId(inf.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length===0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">لا توجد بيانات</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {selectedIds.size > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-gray-600">{selectedIds.size} مؤثر محدد</span>
                <button onClick={()=>setTab('lists')} className="flex items-center gap-1.5 bg-violet-600 text-white text-sm px-4 py-2 rounded-xl">
                  <Share2 className="w-4 h-4"/> إنشاء قائمة مشاركة
                </button>
              </div>
            )}
          </div>
        )}

        {tab==='lists' && (
          <div className="space-y-4 max-w-2xl">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">إنشاء قائمة مشاركة جديدة</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">اسم القائمة</label>
                  <input value={listName} onChange={e=>setListName(e.target.value)} placeholder="مثال: حملة رمضان 2025"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">كلمة مرور (اختياري)</label>
                  <input value={listPw} onChange={e=>setListPw(e.target.value)} placeholder="اتركها فارغة للوصول المفتوح"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">مدة الصلاحية</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1,3,7,14,30].map(d => (
                      <button key={d} onClick={()=>setExpiryDays(d)}
                        className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors',
                          expiryDays===d?'bg-violet-500 text-white border-violet-500':'border-gray-200 text-gray-500')}>
                        {d} {d===1?'يوم':'أيام'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">المؤثرون المحددون</label>
                  {selectedIds.size === 0 ? (
                    <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">اذهب لتبويب المؤثرين وحدد المؤثرين أولاً</p>
                  ) : (
                    <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">✓ {selectedIds.size} مؤثر محدد</p>
                  )}
                </div>
                <button onClick={createShareList} className="w-full bg-violet-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700">
                  إنشاء الرابط
                </button>
                {shareLink && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2">الرابط جاهز:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 flex-1 truncate">{shareLink}</code>
                      <button onClick={()=>{navigator.clipboard.writeText(shareLink);showToast('تم نسخ الرابط ✅')}}
                        className="text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg whitespace-nowrap">نسخ</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">الروابط السابقة</span>
                <button onClick={loadShareLists} className="text-xs text-violet-600">تحديث</button>
              </div>
              {shareLists.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">لا توجد قوائم بعد</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {shareLists.map((sl: any) => {
                    const daysLeft = sl.expires_at ? Math.ceil((new Date(sl.expires_at).getTime()-Date.now())/86400000) : null
                    const expired = daysLeft !== null && daysLeft <= 0
                    const shareUrl = `${typeof window!=='undefined'?window.location.origin:''}/share/${sl.token}`
                    return (
                      <div key={sl.id} className="px-5 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{sl.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn('text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1',
                              expired?'bg-red-50 text-red-600':daysLeft!==null&&daysLeft<=2?'bg-amber-50 text-amber-600':'bg-emerald-50 text-emerald-600')}>
                              <Clock className="w-2.5 h-2.5"/>
                              {expired?'منتهي':daysLeft===0?'ينتهي اليوم':daysLeft!==null?`${daysLeft} يوم`:''}
                            </span>
                            {sl.password_hash && <span className="text-xs text-gray-400">🔒</span>}
                            {!sl.is_active && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">موقوف</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={()=>{navigator.clipboard.writeText(shareUrl);showToast('تم نسخ الرابط ✅')}}
                            className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                            <Copy className="w-3.5 h-3.5"/>
                          </button>
                          <button onClick={()=>extendList(sl.id,7)}
                            className="text-xs border border-violet-200 text-violet-600 px-2 py-1 rounded-lg hover:bg-violet-50 whitespace-nowrap">
                            +7 أيام
                          </button>
                          <button onClick={()=>toggleListActive(sl.id,!sl.is_active)}
                            className={cn('text-xs px-2 py-1 rounded-lg border whitespace-nowrap',
                              sl.is_active?'border-red-200 text-red-500 hover:bg-red-50':'border-emerald-200 text-emerald-600 hover:bg-emerald-50')}>
                            {sl.is_active?'إيقاف':'تفعيل'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab==='import' && (
          <div className="max-w-lg">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">استيراد مؤثرين من CSV</h2>
              <div onClick={()=>importRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-violet-300">
                {importing ? <div className="text-sm text-gray-500">جارٍ الاستيراد...</div> : (
                  <><Upload className="w-8 h-8 text-gray-300 mx-auto mb-2"/><p className="text-sm text-gray-500">اضغط لاختيار ملف CSV</p></>
                )}
              </div>
              <input ref={importRef} type="file" accept=".csv" className="hidden"
                onChange={e=>{ if(e.target.files?.[0]) handleImport(e.target.files[0]) }}/>
              {importResult && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <p className="text-emerald-600">✅ تم استيراد {importResult.success} مؤثر</p>
                </div>
              )}
              <a href="#" onClick={e=>{
                e.preventDefault()
                const csv='name,handle,country,city,gender,niche\nسارة المثال,@sara,السعودية,الرياض,female,media'
                const b=new Blob([csv],{type:'text/csv'})
                const u=URL.createObjectURL(b)
                const a=document.createElement('a');a.href=u;a.download='template.csv';a.click()
              }} className="flex items-center gap-1.5 text-xs text-violet-600 hover:underline">
                <Download className="w-3.5 h-3.5"/> تحميل نموذج CSV
              </a>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-start justify-center p-4 overflow-y-auto" dir={isAr?'rtl':'ltr'}>
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-base font-semibold text-gray-900">{editData.id ? 'تعديل مؤثر' : 'إضافة مؤثر جديد'}</h2>
              <button onClick={()=>setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-5 space-y-5">

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-violet-100 flex items-center justify-center flex-shrink-0">
                  {editData.avatar_url ? <img src={editData.avatar_url} alt="" className="w-full h-full object-cover"/> :
                    <span className="text-violet-700 text-lg font-bold">{editData.full_name?.slice(0,2)||'صو'}</span>}
                </div>
                <div>
                  <button onClick={()=>fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                    <ImageIcon className="w-3.5 h-3.5"/> {uploadingAvatar?'جارٍ الرفع...':'رفع صورة'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e=>{ if(e.target.files?.[0]) uploadAvatar(e.target.files[0]) }}/>
                  {editData.avatar_url && (
                    <button onClick={()=>setEditData((p:any)=>({...p,avatar_url:''}))} className="text-xs text-red-500 mt-1 block">حذف الصورة</button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">الاسم الكامل *</label>
                  <input value={editData.full_name} onChange={e=>setEditData((p:any)=>({...p,full_name:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">المعرف</label>
                  <input value={editData.handle} onChange={e=>setEditData((p:any)=>({...p,handle:e.target.value}))}
                    placeholder="@username" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">الدولة</label>
                  <input value={editData.country} onChange={e=>setEditData((p:any)=>({...p,country:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">المدينة</label>
                  <input value={editData.city} onChange={e=>setEditData((p:any)=>({...p,city:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">الجنس</label>
                  <select value={editData.gender} onChange={e=>setEditData((p:any)=>({...p,gender:e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400">
                    <option value="female">أنثى</option>
                    <option value="male">ذكر</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editData.is_verified} onChange={e=>setEditData((p:any)=>({...p,is_verified:e.target.checked}))}/> موثّق
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editData.is_featured} onChange={e=>setEditData((p:any)=>({...p,is_featured:e.target.checked}))}/> مميز
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">النبذة التعريفية</label>
                <textarea value={editData.bio} onChange={e=>setEditData((p:any)=>({...p,bio:e.target.value}))}
                  rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 resize-none"/>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">المجالات</label>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map(n => (
                    <button key={n} type="button"
                      onClick={()=>setEditData((p:any)=>({...p,niche:p.niche.includes(n)?p.niche.filter((x:string)=>x!==n):[...p.niche,n]}))}
                      className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors',
                        editData.niche.includes(n)?'bg-violet-50 border-violet-200 text-violet-700':'border-gray-200 text-gray-500')}>
                      {NICHE_AR[n]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500">المنصات الاجتماعية</label>
                  <button onClick={addSocial} className="text-xs text-violet-600 flex items-center gap-1">
                    <Plus className="w-3 h-3"/> إضافة منصة
                  </button>
                </div>
                <div className="space-y-3">
                  {(editData.social_accounts??[]).map((acc:any, i:number) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <select value={acc.platform} onChange={e=>updateSocial(i,'platform',e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none flex-1">
                          {PLATFORMS.map(p=><option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
                        </select>
                        <button onClick={()=>removeSocial(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4"/></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={acc.handle} onChange={e=>updateSocial(i,'handle',e.target.value)}
                          placeholder="@username" className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-violet-400"/>
                        <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1.5">
                          <Link2 className="w-3 h-3 text-gray-400 flex-shrink-0"/>
                          <input value={acc.profile_url||''} onChange={e=>updateSocial(i,'profile_url',e.target.value)}
                            placeholder="رابط الحساب" className="text-xs outline-none flex-1 bg-transparent"/>
                        </div>
                        <input value={acc.followers} onChange={e=>updateSocial(i,'followers',Number(e.target.value))}
                          type="number" placeholder="عدد المتابعين"
                          className="col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-violet-400"/>
                      </div>
                      <div className="border-t border-gray-100 pt-2">
                        <p className="text-[10px] text-gray-400 mb-1.5">السعر التقريبي (اختياري)</p>
                        <div className="grid grid-cols-3 gap-2">
                          <input value={acc.price_to||''} onChange={e=>updateSocial(i,'price_to',e.target.value)}
                            type="number" placeholder="الأكبر ←"
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-violet-400"/>
                          <input value={acc.price_from||''} onChange={e=>updateSocial(i,'price_from',e.target.value)}
                            type="number" placeholder="→ الأصغر"
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-violet-400"/>
                          <select value={acc.price_note||'غير شامل الضريبة'} onChange={e=>updateSocial(i,'price_note',e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-violet-400">
                            <option value="غير شامل الضريبة">غير شامل الضريبة</option>
                            <option value="شامل الضريبة">شامل الضريبة</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">علامات تجارية سابقة (مفصولة بفاصلة)</label>
                <input value={(editData.brand_names??[]).join(',')}
                  onChange={e=>setEditData((p:any)=>({...p,brand_names:e.target.value.split(',').map((x:string)=>x.trim()).filter(Boolean)}))}
                  placeholder="Samsung, Apple, STC"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"/>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">أنواع التعاون (مفصولة بفاصلة)</label>
                <input value={(editData.collab_types??[]).join(',')}
                  onChange={e=>setEditData((p:any)=>({...p,collab_types:e.target.value.split(',').map((x:string)=>x.trim()).filter(Boolean)}))}
                  placeholder="منشور ممول, ستوري, ريلز"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"/>
              </div>

            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={()=>setShowForm(false)} className="text-sm text-gray-500 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">إلغاء</button>
              <button onClick={saveInfluencer} disabled={saving}
                className="flex items-center gap-1.5 bg-violet-600 text-white text-sm px-5 py-2 rounded-xl hover:bg-violet-700 disabled:opacity-50">
                <Save className="w-4 h-4"/>
                {saving?'جارٍ الحفظ...':'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3"/>
            <h3 className="text-base font-semibold text-gray-900 mb-1">تأكيد الحذف</h3>
            <p className="text-sm text-gray-500 mb-4">هل أنت متأكد؟ لا يمكن التراجع.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={()=>setDeleteId(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm">إلغاء</button>
              <button onClick={()=>deleteInfluencer(deleteId)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
