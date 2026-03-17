import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import { verifyAdminToken } from '@/shared/lib/adminAuth'

async function isAdmin(request: NextRequest) {
  return verifyAdminToken(request.cookies.get('admin_token')?.value ?? '', process.env.ADMIN_SECRET!)
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const search = request.nextUrl.searchParams.get('search') ?? ''
  const db = createServerSupabase()
  let query = db
    .from('products')
    .select('id, name_uk, name_en, price, images, available_sizes, in_stock')
    .order('name_uk')
    .limit(20)
  if (search.length >= 2) {
    query = query.ilike('name_uk', `%${search}%`)
  }
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const db = createServerSupabase()
  const { data, error } = await db.from('products').insert(body).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...body } = await request.json()
  const db = createServerSupabase()
  const { data, error } = await db.from('products').update(body).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  const db = createServerSupabase()
  const { error } = await db.from('products').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
