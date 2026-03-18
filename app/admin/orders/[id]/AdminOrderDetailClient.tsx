'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus } from '@/entities/order/model/types'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'

const STATUS_OPTIONS: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered']
const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

interface Props {
  order: Order
}

export function AdminOrderDetailClient({ order }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [tracking, setTracking] = useState(order.tracking_number ?? '')
  const [notes, setNotes] = useState(order.admin_notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: order.id,
        status,
        tracking_number: tracking || null,
        admin_notes: notes || null,
      }),
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); setError(d.error); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("Delete order #" + order.order_number + "? This cannot be undone.")) return
    await fetch('/api/admin/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id }),
    })
    router.push('/admin/orders')
  }

  return (
    <div className="bg-brand-white p-6 space-y-5">
      <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Admin Actions</h2>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="border border-brand-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-black"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
          {order.status === 'paid' && (
            <option value="paid">{STATUS_LABELS.paid}</option>
          )}
        </select>
      </div>
      <Input
        label="Nova Post Tracking (TTN)"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        placeholder="e.g. 20400048799700"
      />
      <Textarea
        label="Admin Notes (internal)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Internal notes, not visible to customer"
      />
      {error && <p className="text-xs text-red-500 font-sans">{error}</p>}
      <div className="flex items-center justify-between pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '...' : saved ? 'Saved ✓' : 'Save Changes'}
        </Button>
        <button
          onClick={handleDelete}
          className="text-xs font-sans tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors"
        >
          Delete Order
        </button>
      </div>
    </div>
  )
}
