import Link from 'next/link'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import { OrderRow } from '@/entities/order/ui/OrderRow'
import type { Order } from '@/entities/order/model/types'
import { Pagination } from '@/shared/ui/Pagination'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = Math.max(1, Number(searchParams.page) || 1)
  const supabase = createServerSupabase()
  const { data: orders, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-brand-black">Orders</h1>
        <Link
          href="/admin/orders/new"
          className="text-xs font-sans tracking-widest uppercase border border-brand-black px-4 py-2 hover:bg-brand-black hover:text-white transition-colors"
        >
          + New Order
        </Link>
      </div>
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
                Source
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
      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/orders" />
    </div>
  )
}
