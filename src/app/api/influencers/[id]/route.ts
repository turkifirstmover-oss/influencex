import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { MOCK_INFLUENCERS } from '@/lib/data'

// GET /api/influencers/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from('influencers')
        .select(`*, social_accounts(*), media_items(*), brand_collaborations(*), collaboration_types(*)`)
        .or(`id.eq.${id},slug.eq.${id}`)
        .eq('is_active', true)
        .single()

      if (!error && data) {
        // تتبع المشاهدات
        supabase.rpc('increment_profile_views', { p_id: data.id }).then(() => {})
        return NextResponse.json(data)
      }
    } catch {}
  }

  // fallback
  const inf = MOCK_INFLUENCERS.find(i => i.id === id || i.slug === id)
  if (!inf) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(inf)
}

// PUT /api/influencers/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('influencers')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/influencers/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('influencers')
      .update({ is_active: false })   // soft delete
      .eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
