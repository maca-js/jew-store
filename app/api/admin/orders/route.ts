import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import { verifyAdminToken } from '@/shared/lib/adminAuth'
import { sendTelegramMessage } from '@/shared/api/telegram'
import type { OrderItem } from '@/entities/order/model/types'

async function isAdmin(request: NextRequest) {
  return verifyAdminToken(request.cookies.get('admin_token')?.value ?? '', process.env.ADMIN_SECRET!)
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    customer_name, email, phone,
    delivery_type, delivery_city, delivery_branch,
    delivery_street, delivery_house,
    items, total, status, payment_method, admin_notes, source,
  } = body

  if (!customer_name || !phone || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const isCourier = delivery_type === 'courier'
  const delivery_address = isCourier
    ? `${delivery_city ?? ''}, вул. ${delivery_street ?? ''}, ${delivery_house ?? ''}`
    : `${delivery_city ?? ''}, ${delivery_branch ?? ''}`

  const db = createServerSupabase()
  const { data: order, error } = await db
    .from('orders')
    .insert({
      customer_name,
      email: email ?? '',
      phone,
      delivery_address,
      delivery_service: 'nova_post',
      delivery_type: delivery_type ?? 'branch',
      delivery_city: delivery_city ?? '',
      delivery_branch: isCourier ? '' : (delivery_branch ?? ''),
      delivery_street: isCourier ? (delivery_street ?? '') : null,
      delivery_house: isCourier ? (delivery_house ?? '') : null,
      payment_method: payment_method ?? 'invoice',
      items: items as OrderItem[],
      total,
      status: status ?? 'new',
      admin_notes: admin_notes ?? null,
      source: source ?? 'instagram',
    })
    .select()
    .single()

  if (error || !order) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create order' }, { status: 500 })
  }

  for (const item of items as OrderItem[]) {
    if (!item.product_id) continue
    const { error: rpcError } = await db.rpc('decrement_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    })
    if (rpcError) console.error('decrement_stock error:', rpcError.message)
  }

  const shortId = order.order_number
  const itemLines = (items as OrderItem[])
    .map((i) => `• ${i.name}${i.size ? ` (${i.size})` : ''} × ${i.quantity} — ${i.price * i.quantity} грн`)
    .join('\n')
  const paymentLabel = (payment_method ?? 'invoice') === 'liqpay' ? 'LiqPay' : 'Рахунок-фактура'

  const deliveryLine = isCourier
    ? `${delivery_city ?? '—'}, вул. ${delivery_street ?? ''}, ${delivery_house ?? ''} (кур'єр)`
    : `${delivery_city ?? '—'}, ${delivery_branch ?? '—'}`

  await sendTelegramMessage(
    `🛍 <b>Нове замовлення ${shortId} (адмін)</b>\n\n` +
      `👤 ${customer_name}\n` +
      `📞 ${phone}\n` +
      `📧 ${email ?? '—'}\n` +
      `📦 ${deliveryLine}\n\n` +
      `${itemLines}\n\n` +
      `💰 Разом: <b>${total} грн</b>\n` +
      `💳 Оплата: ${paymentLabel}`,
  )

  return NextResponse.json({ ok: true, id: order.id })
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...updates } = await request.json()
  const allowed = ['status', 'tracking_number', 'admin_notes', 'source']
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
