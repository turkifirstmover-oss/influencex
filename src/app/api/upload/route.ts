import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const MAX_SIZE_MB = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']

// POST /api/upload
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'avatars'

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `Max size is ${MAX_SIZE_MB}MB` }, { status: 400 })
    }

    const supabase = createAdminClient()
    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('influencex-media')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('influencex-media')
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl, path: data.path })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
