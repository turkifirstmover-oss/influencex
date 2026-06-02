import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { MOCK_INFLUENCERS } from '@/lib/data'

// GET /api/influencers
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const search   = searchParams.get('search') ?? ''
  const niches   = searchParams.getAll('niche')
  const platforms= searchParams.getAll('platform')
  const country  = searchParams.get('country') ?? ''
  const gender   = searchParams.get('gender') ?? ''
  const minFol   = Number(searchParams.get('min_followers') ?? 0)
  const page     = Number(searchParams.get('page') ?? 1)
  const perPage  = 24

  // استخدام Supabase إذا كانت متغيرات البيئة موجودة
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createAdminClient()
      let query = supabase
        .from('influencer_stats_summary')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range((page - 1) * perPage, page * perPage - 1)

      if (search) query = query.ilike('full_name', `%${search}%`)
      if (niches.length)    query = query.overlaps('niche', niches)
      if (country)          query = query.eq('country', country)
      if (gender)           query = query.eq('gender', gender)
      if (minFol > 0)       query = query.gte('total_followers', minFol)

      const { data, count, error } = await query
      if (!error) {
        return NextResponse.json({ data, count, page, per_page: perPage })
      }
    } catch {}
  }

  // fallback: بيانات تجريبية
  let results = [...MOCK_INFLUENCERS]
  if (search) results = results.filter(i => i.full_name.includes(search) || i.handle?.includes(search))
  if (niches.length)   results = results.filter(i => niches.some(n => i.niche.includes(n as any)))
  if (platforms.length) results = results.filter(i => platforms.some(p => i.social_accounts?.some(s => s.platform === p as any)))
  if (country) results = results.filter(i => i.country === country)
  if (gender)  results = results.filter(i => i.gender === gender)
  if (minFol)  results = results.filter(i => (i.total_followers ?? 0) >= minFol)

  return NextResponse.json({ data: results, count: results.length, page: 1, per_page: perPage })
}

// POST /api/influencers — إضافة مؤثر جديد
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    const slug = (body.full_name as string)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      + '-' + Date.now()

    const { data, error } = await supabase
      .from('influencers')
      .insert({ ...body, slug })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
