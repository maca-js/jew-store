import { createServerSupabase } from '@/shared/api/supabaseServer'
import { OrderRow } from '@/entities/order/ui/OrderRow'
import type { Order } from '@/entities/order/model/types'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const supabase = createServerSupabase()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-brand-black">Orders</h1>
      <div className="bg-brand-white overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-gray-dark">
              <th className="px-4 py-3 text-left text-xs font-sans tracking-widest uppercase text-brand-muted">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-sans tracking-widest uppercase text-brand-muted">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-sans tracking-widest uppercase text-brand-muted">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-sans tracking-widest uppercase text-brand-muted">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-sans tracking-widest uppercase text-brand-muted">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-sans tracking-widest uppercase text-brand-muted">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {(orders as Order[])?.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
        {!orders?.length && (
          <p className="text-center text-brand-muted py-12 font-sans text-sm">
            No orders yet
          </p>
        )}
      </div>
    </div>
  )
}
