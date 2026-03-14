import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import type { OrderItem } from '@/entities/order/model/types'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    customer_name, email, phone,
    delivery_service, delivery_city, delivery_branch,
    payment_method,
    items, total,
  } = body

  if (!customer_name || !email || !phone || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServerSupabase()

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name,
      email,
      phone,
      delivery_address: `${delivery_city}, ${delivery_branch}`,
      delivery_service: delivery_service ?? 'nova_post',
      delivery_city: delivery_city ?? '',
      delivery_branch: delivery_branch ?? '',
      payment_method: payment_method ?? 'invoice',
      items: items as OrderItem[],
      total,
      status: 'new',
    })
    .select()
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  return NextResponse.json({ orderId: order.id })
}
