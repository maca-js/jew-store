import type { OrderItem } from '@/entities/order/model/types';
import { createServerSupabase } from '@/shared/api/supabaseServer';
import { sendTelegramMessage } from '@/shared/api/telegram';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    customer_name,
    email,
    phone,
    delivery_service,
    delivery_city,
    delivery_branch,
    payment_method,
    items,
    total,
  } = body;

  if (!customer_name || !phone || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createServerSupabase();

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
      source: 'website',
    })
    .select()
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }

  for (const item of items as OrderItem[]) {
    if (!item.product_id) continue;
    const { error: rpcError } = await supabase.rpc('decrement_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    });
    if (rpcError) console.error('decrement_stock error:', rpcError.message);
  }

  console.log('items', items);

  const shortId = order.order_number;
  const itemLines = (items as OrderItem[])
    .map((i) => `• ${i.name}${i.size ? ` (${i.size})` : ''} × ${i.quantity} — ${i.price * i.quantity} грн`)
    .join('\n');
  const paymentLabel = (payment_method ?? 'invoice') === 'liqpay' ? 'LiqPay' : 'Рахунок-фактура';

  await sendTelegramMessage(
    `🛍 <b>Нове замовлення ${shortId}</b>\n\n` +
      `👤 ${customer_name}\n` +
      `📞 ${phone}\n` +
      `📧 ${email}\n` +
      `📦 ${delivery_city}, ${delivery_branch}\n\n` +
      `${itemLines}\n\n` +
      `💰 Разом: <b>${total} грн</b>\n` +
      `💳 Оплата: ${paymentLabel}`,
  );

  return NextResponse.json({ orderId: order.id });
}
