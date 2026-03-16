import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import { verifyAdminToken } from '@/shared/lib/adminAuth'

async function isAdmin(request: NextRequest) {
  return verifyAdminToken(request.cookies.get('admin_token')?.value ?? '', process.env.ADMIN_SECRET!)
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const db = createServerSupabase()
  const { data, error } = await db.from('categories').insert(body).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...body } = await request.json()
  const db = createServerSupabase()
  const { data, error } = await db.from('categories').update(body).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  const db = createServerSupabase()
  const { error } = await db.from('categories').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
