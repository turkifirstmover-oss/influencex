import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('client_lists')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, password, influencer_ids, expires_in_days = 7 } = body
    const supabase = createAdminClient()

    const token = crypto.randomBytes(24).toString('hex')
    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + Number(expires_in_days))

    const { data: list, error } = await supabase
      .from('client_lists')
      .insert({
        name,
        token,
        password_hash: password || null,
        expires_at: expires_at.toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    if (influencer_ids?.length > 0) {
      const rows = influencer_ids.map((id: string) => ({
        list_id: list.id,        // ✅ كان client_list_id — الآن list_id
        influencer_id: id,
      }))
      const { error: insertError } = await supabase
        .from('client_list_influencers')
        .insert(rows)

      if (insertError) throw insertError
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://first-mover.netlify.app'
    return NextResponse.json({ ...list, share_url: `${baseUrl}/share/${token}` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('client_lists')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
