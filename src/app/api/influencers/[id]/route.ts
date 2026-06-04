import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { MOCK_INFLUENCERS } from '@/lib/data'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('influencers')
      .select(`*, social_accounts(*), media_items(*), brand_collaborations(*)`)
      .or(`id.eq.${id},slug.eq.${id}`)
      .eq('is_active', true)
      .maybeSingle()

    if (!error && data) return NextResponse.json(data)
  } catch {}

  const inf = MOCK_INFLUENCERS.find(i => i.id === id || i.slug === id)
  if (!inf) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(inf)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    // إزالة الأعمدة المحسوبة من الـ View + social_accounts
    const {
      social_accounts,
      id: _id,
      total_followers,
      avg_views,
      avg_engagement,
      platform_count,
      ...infData
    } = body

    const { data, error } = await supabase
      .from('influencers')
      .update(infData)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error

    if (social_accounts !== undefined) {
      await supabase.from('social_accounts').delete().eq('influencer_id', params.id)
      if (social_accounts?.length > 0) {
        const saRows = social_accounts
          .filter((sa: any) => sa.platform)
          .map((sa: any) => ({
            influencer_id:   params.id,
            platform:        sa.platform,
            handle:          sa.handle || '',
            profile_url:     sa.profile_url || null,
            followers:       Math.max(0, Number(sa.followers) || 0),
            avg_views:       Math.max(0, Number(sa.avg_views) || 0),
            engagement_rate: Math.max(0, Number(sa.engagement_rate) || 0),
          }))
        await supabase.from('social_accounts').insert(saRows)
      }
    }

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('influencers')
      .update({ is_active: false })
      .eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
