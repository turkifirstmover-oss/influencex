import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { MOCK_INFLUENCERS } from '@/lib/data'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const search  = searchParams.get('search') ?? ''
  const page    = Number(searchParams.get('page') ?? 1)
  const perPage = Number(searchParams.get('per_page') ?? 100)

  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('influencer_stats_summary')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .range((page - 1) * perPage, page * perPage - 1)

    if (search) query = query.ilike('full_name', `%${search}%`)

    const { data, count, error } = await query
    if (error) throw error

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
  } catch {
    const results = MOCK_INFLUENCERS
    return NextResponse.json({ data: results, count: results.length, page: 1, per_page: perPage })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()
    const { social_accounts, id: _id, ...infData } = body

    const generateSlug = (name: string) => {
      const timestamp = Date.now()
      const cleaned = name
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      return cleaned ? `${cleaned}-${timestamp}` : `influencer-${timestamp}`
    }

    const slug = infData.slug || generateSlug(infData.full_name ?? '')

    const { data: inf, error } = await supabase
      .from('influencers')
      .insert({ ...infData, slug })
      .select()
      .single()

    if (error) throw error

    if (social_accounts?.length > 0) {
      const saRows = social_accounts
        .filter((sa: any) => sa.platform)
        .map((sa: any) => ({
          influencer_id:   inf.id,
          platform:        sa.platform,
          handle:          sa.handle || '',
          profile_url:     sa.profile_url || null,
          followers:       Math.max(0, Number(sa.followers) || 0),
          avg_views:       Math.max(0, Number(sa.avg_views) || 0),
          engagement_rate: Math.max(0, Number(sa.engagement_rate) || 0),
        }))
      await supabase.from('social_accounts').insert(saRows)
    }

    return NextResponse.json(inf, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
