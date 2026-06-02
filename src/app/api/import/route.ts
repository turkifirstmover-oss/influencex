import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// POST /api/import — استيراد مؤثرين من CSV
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const text = await file.text()
    const lines = text.split('\n').filter(Boolean)
    if (lines.length < 2) return NextResponse.json({ error: 'Empty file' }, { status: 400 })

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const supabase = createAdminClient()
    const results = { success: 0, errors: [] as string[], skipped: 0 }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const row: Record<string, string> = {}
      headers.forEach((h, j) => { row[h] = values[j] ?? '' })

      const name = row['name'] || row['full_name'] || row['الاسم']
      if (!name) { results.skipped++; continue }

      const slug = name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        + '-' + i

      const niche = row['niche'] || row['المجال']
      const niches = niche ? niche.split(';').map(n => n.trim()).filter(Boolean) : []

      try {
        const { error } = await supabase.from('influencers').upsert({
          slug,
          full_name: name,
          country: row['country'] || row['الدولة'] || 'SA',
          city: row['city'] || row['المدينة'] || null,
          gender: row['gender'] || row['الجنس'] || null,
          niche: niches,
          languages: ['ar'],
          is_active: true,
        }, { onConflict: 'slug' })

        if (error) throw error
        results.success++
      } catch (e: any) {
        results.errors.push(`سطر ${i + 1}: ${e.message}`)
      }
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
