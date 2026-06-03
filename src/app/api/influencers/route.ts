import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { MOCK_INFLUENCERS } from '@/lib/data'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const search   = searchParams.get('search') ?? ''
  const niches   = searchParams.getAll('niche')
  const platform = searchParams.get('platform') ?? ''
  const country  = searchParams.get('country') ?? ''
  const gender   = searchParams.get('gender') ?? ''
  const page     = Number(searchParams.get('page') ?? 1)
  const perPage  = Number(searchParams.get('per_page') ?? 100)

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createAdminClient()
      let query = supabase
        .from('influencer_stats_summary')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range((page - 1) * perPage, page * perPage - 1)

      if (search) query = query.ilike('full_name', `%${search}%`)
      if (niches.length) query = query.overlaps('niche', niches)
      if (country) query = query.eq('country', country)
      if (gender) query = query.eq('gender', gender)

      const { data, count, error } = await query
      if (!error) {
        // جلب social_accounts لكل مؤثر
        const ids = (data ?? []).map((i: any) => i.id)
        let socials: any[] = []
        if (ids.length > 0) {
          const { data: sa } = await supabase
            .from('social_accounts')
            .select('*')
            .in('influencer_id', ids)
          socials = sa ?? []
        }
        const result = (data ?? []).map((inf: any) => ({
          ...inf,
          social_accounts: socials.filter((s: any) => s.influencer_id === inf.id),
        }))
        return NextResponse.json({ data: result, count, page, per_page: perPage })
      }
    } catch {}
  }

  // fallback mock
  let results = [...MOCK_INFLUENCERS]
  if (search) results = results.filter(i => i.full_name.includes(search) || i.handle?.includes(search))
  return NextResponse.json({ data: results, count: results.length, page: 1, per_page: perPage })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    // فصل social_accounts عن بيانات المؤثر
    const { social_accounts, ...infData } = body

    const slug = infData.slug ||
      (infData.full_name as string).trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '')
        + '-' + Date.now()

    // حفظ المؤثر
    const { data: inf, error } = await supabase
      .from('influencers')
      .insert({ ...infData, slug })
      .select()
      .single()

    if (error) throw error

    // حفظ المنصات في جدولها المنفصل
    if (social_accounts?.length > 0) {
      const saRows = social_accounts.map((sa: any) => ({
        influencer_id:   inf.id,
        platform:        sa.platform,
        handle:          sa.handle,
        profile_url:     sa.profile_url || null,
        followers:       Number(sa.followers) || 0,
        avg_views:       Number(sa.avg_views) || 0,
        engagement_rate: Number(sa.engagement_rate) || 0,
      }))
      await supabase.from('social_accounts').insert(saRows)
    }

    return NextResponse.json(inf, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
