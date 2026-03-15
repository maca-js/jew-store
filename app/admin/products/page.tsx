import { createServerSupabase } from '@/shared/api/supabaseServer'
import type { Product } from '@/entities/product/model/types'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = createServerSupabase()
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(name_uk)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-brand-black">Products</h1>
        <Link href="/admin/products/new">
          <div className="inline-flex items-center justify-center font-sans tracking-widest uppercase text-xs px-6 py-3 bg-brand-black text-brand-white hover:bg-brand-black/80 transition-all">
            + New Product
          </div>
        </Link>
      </div>

      <div className="bg-brand-white overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-gray-dark">
              {['', 'Name', 'Category', 'Price', 'Stock', 'Badge', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-sans tracking-widest uppercase text-brand-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(products as (Product & { category: { name_uk: string } | null })[])?.map(
              (p) => (
                <tr key={p.id} className="border-b border-brand-gray-dark hover:bg-brand-gray transition-colors">
                  <td className="px-4 py-3 w-12">
                    {p.images[0] && (
                      <div className="relative w-10 h-12">
                        <Image src={p.images[0]} alt={p.name_uk} fill className="object-cover" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-serif">{p.name_uk}</td>
                  <td className="px-4 py-3 text-xs text-brand-muted">
                    {p.category?.name_uk ?? '—'}
                  </td>
                  <td className="px-4 py-3">{p.price.toLocaleString()} грн</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${p.in_stock ? 'text-green-600' : 'text-red-500'}`}>
                      {p.in_stock ? 'In stock' : 'Out'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-muted">{p.badge ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {!products?.length && (
          <p className="text-center text-brand-muted py-12 font-sans text-sm">
            No products yet
          </p>
        )}
      </div>
    </div>
  )
}
