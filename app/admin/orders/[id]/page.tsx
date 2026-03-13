import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import type { Order } from '@/entities/order/model/types'
import Link from 'next/link'
import Image from 'next/image'

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

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServerSupabase()
  const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
  if (!order) notFound()

  const o = order as Order

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-brand-black">
          Order #{o.id.slice(0, 8)}
        </h1>
        <Link
          href="/admin/orders"
          className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-black"
        >
          ← Back
        </Link>
      </div>

      <div className="bg-brand-white p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">
              Customer
            </p>
            <p>{o.customer_name}</p>
          </div>
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">
              Status
            </p>
            <p className="font-sans">{statusLabel[o.status]}</p>
          </div>
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">
              Email
            </p>
            <p>{o.email}</p>
          </div>
          <div>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">
              Phone
            </p>
            <p>{o.phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-1">
              Address
            </p>
            <p>{o.delivery_address}</p>
          </div>
        </div>
      </div>

      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">
          Items
        </h2>
        {o.items.map((item, i) => (
          <div key={i} className="flex gap-4 items-start pb-4 border-b border-brand-gray-dark last:border-0">
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
                {item.quantity} × {item.price.toLocaleString()} грн
              </p>
            </div>
            <p className="font-sans text-sm">
              {(item.price * item.quantity).toLocaleString()} грн
            </p>
          </div>
        ))}
        <div className="flex justify-between pt-2">
          <span className="text-xs font-sans tracking-widest uppercase text-brand-muted">
            Total
          </span>
          <span className="font-serif text-lg">{o.total.toLocaleString()} грн</span>
        </div>
      </div>
    </div>
  )
}
