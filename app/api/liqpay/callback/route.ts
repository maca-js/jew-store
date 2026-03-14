import { NextRequest, NextResponse } from 'next/server'
import { verifyLiqPayCallback, decodeLiqPayData } from '@/shared/api/liqpay'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import { sendTelegramMessage } from '@/shared/api/telegram'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const data = formData.get('data') as string
  const signature = formData.get('signature') as string

  if (!data || !signature) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (!verifyLiqPayCallback(data, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const payload = decodeLiqPayData(data)
  const orderId = payload.order_id as string
  const status = payload.status as string

  if (status === 'success' || status === 'sandbox') {
    const supabase = createServerSupabase()
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        liqpay_order_id: payload.payment_id as string,
      })
      .eq('id', orderId)

    await sendTelegramMessage(
      `✅ <b>Оплачено замовлення ${orderId.slice(0, 8)}</b>\n` +
      `💳 LiqPay ID: ${payload.payment_id}`
    )
  }

  return NextResponse.json({ ok: true })
}
