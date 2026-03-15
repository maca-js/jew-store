import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import type { Category } from '@/entities/category/model/types'
import type { Product } from '@/entities/product/model/types'
import { ProductForm } from '@/features/admin-product-form/ui/ProductForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServerSupabase()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name_uk'),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-brand-black">Edit Product</h1>
      <ProductForm
        categories={(categories as Category[]) ?? []}
        product={product as Product}
      />
    </div>
  )
}
