import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { z } from 'zod'

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  password: z.string().optional(),
  influencer_ids: z.array(z.string()).min(1).max(50),
  expires_in_days: z.number().int().min(1).max(365).optional(),
})

// POST /api/share — إنشاء قائمة مشاركة
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { name, description, password, influencer_ids, expires_in_days } = parsed.data
    const supabase = createAdminClient()

    let password_hash: string | undefined
    if (password) {
      const { hashSync } = await import('bcryptjs')
      password_hash = hashSync(password, 10)
    }

    const expires_at = expires_in_days
      ? new Date(Date.now() + expires_in_days * 864e5).toISOString()
      : null

    const { data: list, error } = await supabase
      .from('client_lists')
      .insert({ name, description, password_hash, expires_at })
      .select()
      .single()

    if (error || !list) throw error

    // ربط المؤثرين
    await supabase.from('client_list_influencers').insert(
      influencer_ids.map((id, i) => ({
        list_id: list.id,
        influencer_id: id,
        sort_order: i,
      }))
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    return NextResponse.json({
      token: list.token,
      share_url: `${appUrl}/ar/share/${list.token}`,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// GET /api/share?token=xxx — جلب قائمة بالـ token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const password = req.nextUrl.searchParams.get('password')
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    const { data: list, error } = await supabase
      .from('client_lists')
      .select(`*, client_list_influencers(*, influencers(*))`)
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (error || !list) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // فحص الانتهاء
    if (list.expires_at && new Date(list.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link expired' }, { status: 410 })
    }

    // فحص كلمة المرور
    if (list.password_hash) {
      if (!password) return NextResponse.json({ protected: true }, { status: 401 })
      const { compareSync } = await import('bcryptjs')
      if (!compareSync(password, list.password_hash)) {
        return NextResponse.json({ error: 'Wrong password' }, { status: 403 })
      }
    }

    // تتبع المشاهدات
    await supabase.from('client_lists').update({ view_count: (list.view_count ?? 0) + 1 }).eq('id', list.id)

    return NextResponse.json(list)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
