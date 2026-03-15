'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Button } from '@/shared/ui/Button'
import type { Category } from '@/entities/category/model/types'
import type { Product, BadgeType } from '@/entities/product/model/types'
import Image from 'next/image'

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

const BADGE_OPTIONS: (BadgeType | '')[] = ['', 'new', 'sale', 'bestseller']
const RING_SIZES = ['14', '15', '15.5', '16', '16.5', '17', '17.5', '18', '18.5', '19', '20', '21']

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name_uk: product?.name_uk ?? '',
    name_en: product?.name_en ?? '',
    description_uk: product?.description_uk ?? '',
    description_en: product?.description_en ?? '',
    price: product?.price?.toString() ?? '',
    category_id: product?.category_id ?? '',
    slug: product?.slug ?? '',
    badge: (product?.badge ?? '') as BadgeType | '',
    is_featured: product?.is_featured ?? false,
    in_stock: product?.in_stock ?? true,
    available_sizes: product?.available_sizes ?? [] as string[],
    images: product?.images ?? [] as string[],
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleSize(size: string) {
    setForm((f) => ({
      ...f,
      available_sizes: f.available_sizes.includes(size)
        ? f.available_sizes.filter((s) => s !== size)
        : [...f.available_sizes, size],
    }))
  }

  async function uploadImages(files: FileList) {
    setUploading(true)
    const urls: string[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        urls.push(url)
      }
    }

    setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    setUploading(false)
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      price: parseFloat(form.price),
      badge: form.badge || null,
      category_id: form.category_id || null,
    }

    const res = product
      ? await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: product.id, ...payload }),
        })
      : await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    setSaving(false)
    if (!res.ok) { const d = await res.json(); setError(d.error); return }
    router.push('/admin/products')
    router.refresh()
  }

  async function handleDelete() {
    if (!product || !confirm('Delete this product?')) return
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product.id }),
    })
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Images */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Images</h2>
        <div className="flex flex-wrap gap-3">
          {form.images.map((url) => (
            <div key={url} className="relative w-20 h-24 group">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-24 border-2 border-dashed border-brand-border flex items-center justify-center text-brand-muted hover:border-brand-black transition-colors text-2xl"
          >
            {uploading ? '...' : '+'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadImages(e.target.files)}
        />
      </div>

      {/* Names */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Names</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name (UA)" value={form.name_uk} onChange={(e) => setForm((f) => ({ ...f, name_uk: e.target.value }))} required />
          <Input label="Name (EN)" value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Textarea label="Description (UA)" value={form.description_uk} onChange={(e) => setForm((f) => ({ ...f, description_uk: e.target.value }))} rows={4} />
          <Textarea label="Description (EN)" value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))} rows={4} />
        </div>
      </div>

      {/* Pricing & meta */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Details</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Price (UAH)" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="e.g. gold-ring-01" required />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className="border border-brand-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-black"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_uk}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">Badge</label>
            <select
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value as BadgeType | '' }))}
              className="border border-brand-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-black"
            >
              {BADGE_OPTIONS.map((b) => (
                <option key={b} value={b}>{b || 'None'}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="in_stock" checked={form.in_stock} onChange={(e) => setForm((f) => ({ ...f, in_stock: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="in_stock" className="text-xs font-sans tracking-widest uppercase text-brand-muted">In Stock</label>
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="is_featured" className="text-xs font-sans tracking-widest uppercase text-brand-muted">Featured</label>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Ring Sizes</h2>
        <div className="flex flex-wrap gap-2">
          {RING_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`w-12 h-12 text-sm font-sans border transition-colors ${
                form.available_sizes.includes(size)
                  ? 'bg-brand-black text-brand-white border-brand-black'
                  : 'bg-brand-white text-brand-black border-brand-border hover:border-brand-black'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 font-sans">{error}</p>}

      <div className="flex items-center justify-between">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? '...' : product ? 'Save Changes' : 'Create Product'}
        </Button>
        {product && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs font-sans tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors"
          >
            Delete Product
          </button>
        )}
      </div>
    </form>
  )
}
