import type { Order } from '../model/types'
import Link from 'next/link'

const statusLabel: Record<Order['status'], string> = {
  new: 'Нове',
  paid: 'Оплачено',
  processing: 'Обробка',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
}

const statusColor: Record<Order['status'], string> = {
  new: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-800',
}

interface OrderRowProps {
  order: Order
}

export function OrderRow({ order }: OrderRowProps) {
  return (
    <tr className="border-b border-brand-gray-dark hover:bg-brand-gray transition-colors">
      <td className="px-4 py-3 text-xs font-mono text-brand-muted">
        <Link href={`/admin/orders/${order.id}`} className="hover:text-brand-black">
          #{order.id.slice(0, 8)}
        </Link>
      </td>
      <td className="px-4 py-3 text-sm">{order.customer_name}</td>
      <td className="px-4 py-3 text-sm">{order.email}</td>
      <td className="px-4 py-3 text-sm font-sans">
        {order.total.toLocaleString()} грн
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded-full font-sans ${statusColor[order.status]}`}>
          {statusLabel[order.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-brand-muted">
        {new Date(order.created_at).toLocaleDateString('uk-UA')}
      </td>
    </tr>
  )
}
