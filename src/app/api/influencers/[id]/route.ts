import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { MOCK_INFLUENCERS } from '@/lib/data'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from('influencers')
        .select(`*, social_accounts(*), media_items(*), brand_collaborations(*)`)
        .or(`id.eq.${id},slug.eq.${id}`)
        .eq('is_active', true)
        .single()
      if (!error && data) {
        supabase.rpc('increment_profile_views', { p_id: data.id }).then(() => {})
        return NextResponse.json(data)
      }
    } catch {}
  }
  const inf = MOCK_INFLUENCERS.find(i => i.id === id || i.slug === id)
  if (!inf) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(inf)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()
    const { social_accounts, ...infData } = body

    // تحديث بيانات المؤثر
    const { data, error } = await supabase
      .from('influencers')
      .update(infData)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error

    // تحديث المنصات: احذف القديمة وأضف الجديدة
    if (social_accounts !== undefined) {
      await supabase.from('social_accounts').delete().eq('influencer_id', params.id)
      if (social_accounts?.length > 0) {
        const saRows = social_accounts.map((sa: any) => ({
          influencer_id:   params.id,
          platform:        sa.platform,
          handle:          sa.handle,
          profile_url:     sa.profile_url || null,
          followers:       Number(sa.followers) || 0,
          avg_views:       Number(sa.avg_views) || 0,
          engagement_rate: Number(sa.engagement_rate) || 0,
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
