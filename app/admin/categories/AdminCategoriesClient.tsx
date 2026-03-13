'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import type { Category } from '@/entities/category/model/types'

interface Props {
  categories: Category[]
}

export function AdminCategoriesClient({ categories }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({ name_uk: '', name_en: '', slug: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); setError(d.error); return }
    setForm({ name_uk: '', name_en: '', slug: '' })
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">
          New Category
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-3 gap-4">
          <Input
            label="Name (UA)"
            value={form.name_uk}
            onChange={(e) => setForm((f) => ({ ...f, name_uk: e.target.value }))}
            required
          />
          <Input
            label="Name (EN)"
            value={form.name_en}
            onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="e.g. rings"
            required
          />
          {error && <p className="col-span-3 text-xs text-red-500">{error}</p>}
          <div className="col-span-3">
            <Button type="submit" disabled={saving}>
              {saving ? '...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-brand-white overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-gray-dark">
              {['Name (UA)', 'Name (EN)', 'Slug', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-sans tracking-widest uppercase text-brand-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-brand-gray-dark hover:bg-brand-gray transition-colors">
                <td className="px-4 py-3">{cat.name_uk}</td>
                <td className="px-4 py-3">{cat.name_en}</td>
                <td className="px-4 py-3 font-mono text-xs text-brand-muted">{cat.slug}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
