import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import type { Order } from '@/entities/order/model/types'
import Link from 'next/link'
import Image from 'next/image'
import { AdminOrderDetailClient } from './AdminOrderDetailClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const statusLabel: Record<Order['status'], string> = {
  new: 'New',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

const paymentLabel: Record<string, string> = {
  invoice: 'Invoice (bank transfer)',
  liqpay: 'LiqPay',
  cod: 'Накладний платіж (передплата)',
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServerSupabase()
  const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
  if (!order) notFound()

  const o = order as Order

  const productIds = o.items.map((item) => item.product_id)
  const { data: products } = await supabase.from('products').select('id, slug').in('id', productIds)
  const slugMap = Object.fromEntries((products ?? []).map((p) => [p.id, p.slug]))

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-brand-black">
          Order #{o.order_number}
        </h1>
        <Link
          href="/admin/orders"
          className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-black"
        >
          Back
        </Link>
      </div>

      {/* Customer & delivery info */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Customer</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">Name</p>
            <p>{o.customer_name}</p>
          </div>
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">Status</p>
            <p className="font-sans">{statusLabel[o.status]}</p>
          </div>
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">Email</p>
            <p>{o.email}</p>
          </div>
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">Phone</p>
            <p>{o.phone}</p>
          </div>
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">Delivery</p>
            <p>Nova Post {o.delivery_type === 'courier' ? '(Courier)' : '(Branch)'}</p>
            {o.delivery_city && <p className="text-brand-muted">{o.delivery_city}</p>}
            {o.delivery_type === 'courier'
              ? (o.delivery_street || o.delivery_house) && (
                  <p className="text-brand-muted text-xs">вул. {o.delivery_street}, {o.delivery_house}</p>
                )
              : o.delivery_branch && <p className="text-brand-muted text-xs">{o.delivery_branch}</p>
            }
          </div>
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">Payment</p>
            <p>{paymentLabel[o.payment_method] ?? o.payment_method}</p>
          </div>
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">Source</p>
            <span className={`text-xs px-2 py-1 font-sans ${
              o.source === 'instagram' ? 'bg-pink-100 text-pink-700' : 'bg-brand-gray text-brand-muted'
            }`}>
              {o.source === 'instagram' ? 'Instagram' : 'Website'}
            </span>
          </div>
          {o.tracking_number && (
            <div className="col-span-2">
              <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">Tracking (TTN)</p>
              <p className="font-mono">{o.tracking_number}</p>
            </div>
          )}
          {o.admin_notes && (
            <div className="col-span-2">
              <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">Admin Notes</p>
              <p className="text-brand-muted">{o.admin_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Items</h2>
        {o.items.map((item, i) => (
          <Link key={i} href={`/uk/product/${slugMap[item.product_id]}`} className="flex gap-4 items-start pb-4 border-b border-brand-gray-dark last:border-0 hover:bg-brand-gray -mx-2 px-2 transition-colors rounded">
            {item.image && (
              <div className="relative w-12 h-16 bg-brand-gray flex-shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-serif text-sm">{item.name}</p>
              {item.size && (
                <p className="text-xs font-sans text-brand-muted">Size: {item.size}</p>
              )}
              <p className="text-xs font-sans text-brand-muted">
                {item.quantity} x {item.price.toLocaleString()} hrn
              </p>
            </div>
            <p className="font-sans text-sm">
              {(item.price * item.quantity).toLocaleString()} hrn
            </p>
          </Link>
        ))}
        <div className="flex justify-between pt-2">
          <span className="text-xs font-sans tracking-widest uppercase text-brand-muted">Total</span>
          <span className="font-serif text-lg">{o.total.toLocaleString()} hrn</span>
        </div>
      </div>

      {/* Admin actions */}
      <AdminOrderDetailClient order={o} />
    </div>
  )
}
