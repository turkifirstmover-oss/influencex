import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const supabase = createAdminClient()
    const password = req.nextUrl.searchParams.get('password')

    const { data: list, error } = await supabase
      .from('client_lists')
      .select('*')
      .eq('token', params.token)
      .eq('is_active', true)
      .maybeSingle()

    if (error || !list) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (list.expires_at && new Date(list.expires_at) < new Date()) {
      return NextResponse.json({ error: 'expired' }, { status: 410 })
    }

    if (list.password_hash && list.password_hash !== password) {
      return NextResponse.json({ error: 'wrong_password', list: { has_password: true } }, { status: 403 })
    }

    const { data: items } = await supabase
      .from('client_list_influencers')
      .select('influencer_id')
      .eq('client_list_id', list.id)

    const ids = (items ?? []).map((i: any) => i.influencer_id)
    let influencers: any[] = []

    if (ids.length > 0) {
      const { data: infs } = await supabase
        .from('influencer_stats_summary')
        .select('*')
        .in('id', ids)
        .eq('is_active', true)

      const { data: socials } = await supabase
        .from('social_accounts')
        .select('*')
        .in('influencer_id', ids)

      influencers = (infs ?? []).map((inf: any) => ({
        ...inf,
        social_accounts: (socials ?? []).filter((s: any) => s.influencer_id === inf.id),
      }))
    }

    return NextResponse.json({
      list: {
        id: list.id,
        name: list.name,
        expires_at: list.expires_at,
        has_password: !!list.password_hash,
      },
      influencers,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
