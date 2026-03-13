import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import { createLiqPayForm } from '@/shared/api/liqpay'
import type { OrderItem } from '@/entities/order/model/types'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { customer_name, email, phone, delivery_address, items, total, locale } = body

  if (!customer_name || !email || !phone || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServerSupabase()

  // 1. Create order
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name,
      email,
      phone,
      delivery_address,
      items: items as OrderItem[],
      total,
      status: 'new',
    })
    .select()
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // 2. Generate LiqPay form data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin
  const { data, signature } = createLiqPayForm({
    orderId: order.id,
    amount: total,
    description: `Legacy order #${order.id.slice(0, 8)}`,
    resultUrl: `${baseUrl}/${locale}/order/${order.id}`,
    serverUrl: `${baseUrl}/api/liqpay/callback`,
  })

  return NextResponse.json({ data, signature })
}
