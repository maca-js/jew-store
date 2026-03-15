'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { supabase } from '@/shared/api/supabaseClient'
import type { Category } from '@/entities/category/model/types'

interface Props {
  categories: Category[]
}

async function uploadCategoryImage(file: File): Promise<string> {
  const path = `categories/${Date.now()}-${file.name}`
  await supabase.storage.from('product-images').upload(path, file)
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export function AdminCategoriesClient({ categories }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({ name_uk: '', name_en: '', slug: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name_uk: '', name_en: '', slug: '' })
  const [editSaving, setEditSaving] = useState(false)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    let image_url: string | undefined
    if (imageFile) {
      image_url = await uploadCategoryImage(imageFile)
    }

    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ...(image_url ? { image_url } : {}) }),
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); setError(d.error); return }
    setForm({ name_uk: '', name_en: '', slug: '' })
    setImageFile(null)
    router.refresh()
  }

  async function handleImageChange(id: string, file: File) {
    setUploadingId(id)
    const image_url = await uploadCategoryImage(file)
    await fetch('/api/admin/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, image_url }),
    })
    setUploadingId(null)
    router.refresh()
  }

  async function handleUpdate(id: string) {
    setEditSaving(true)
    await fetch('/api/admin/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm }),
    })
    setEditSaving(false)
    setEditingId(null)
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
          <div className="col-span-3 flex items-center gap-4">
            <label className="text-xs font-sans tracking-widest uppercase text-brand-muted cursor-pointer">
              <span>Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {imageFile ? (
              <span className="text-xs text-brand-muted">{imageFile.name}</span>
            ) : (
              <span className="text-xs text-brand-muted">No file chosen</span>
            )}
          </div>
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
              {['Image', 'Name (UA)', 'Name (EN)', 'Slug', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-sans tracking-widest uppercase text-brand-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-brand-gray-dark hover:bg-brand-gray transition-colors">
                <td className="px-4 py-3">
                  <button
                    onClick={() => editingId === cat.id && fileInputRefs.current[cat.id]?.click()}
                    className={`relative block w-10 h-10 bg-brand-gray overflow-hidden flex-shrink-0 ${editingId === cat.id ? 'cursor-pointer' : 'cursor-default'}`}
                    title={editingId === cat.id ? 'Change image' : undefined}
                  >
                    {cat.image_url ? (
                      <Image src={cat.image_url} fill className="object-cover" alt={cat.name_uk} />
                    ) : null}
                    {uploadingId === cat.id && (
                      <div className="absolute inset-0 bg-brand-black/40 flex items-center justify-center">
                        <span className="text-brand-white text-xs">...</span>
                      </div>
                    )}
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[cat.id] = el }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageChange(cat.id, file)
                    }}
                  />
                </td>
                {editingId === cat.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        className="w-full border border-brand-border px-2 py-1 text-sm"
                        value={editForm.name_uk}
                        onChange={(e) => setEditForm((f) => ({ ...f, name_uk: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="w-full border border-brand-border px-2 py-1 text-sm"
                        value={editForm.name_en}
                        onChange={(e) => setEditForm((f) => ({ ...f, name_en: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="w-full border border-brand-border px-2 py-1 text-sm font-mono"
                        value={editForm.slug}
                        onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-2 text-right space-x-3">
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        disabled={editSaving}
                        className="text-xs font-sans tracking-widest uppercase text-brand-black hover:text-brand-muted transition-colors"
                      >
                        {editSaving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">{cat.name_uk}</td>
                    <td className="px-4 py-3">{cat.name_en}</td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-muted">{cat.slug}</td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => { setEditingId(cat.id); setEditForm({ name_uk: cat.name_uk, name_en: cat.name_en, slug: cat.slug }) }}
                        className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
