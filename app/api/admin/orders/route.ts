import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import { verifyAdminToken } from '@/shared/lib/adminAuth'

async function isAdmin(request: NextRequest) {
  return verifyAdminToken(request.cookies.get('admin_token')?.value ?? '', process.env.ADMIN_SECRET!)
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...updates } = await request.json()
  const allowed = ['status', 'tracking_number', 'admin_notes']
  const patch = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  )

  const db = createServerSupabase()
  const { error } = await db.from('orders').update(patch).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  const db = createServerSupabase()
  const { error } = await db.from('orders').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
