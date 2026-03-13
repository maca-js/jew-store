import { createServerSupabase } from '@/shared/api/supabaseServer'
import type { Category } from '@/entities/category/model/types'
import { ProductForm } from '@/features/admin-product-form/ui/ProductForm'

export default async function NewProductPage() {
  const supabase = createServerSupabase()
  const { data: categories } = await supabase.from('categories').select('*').order('name_uk')

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-brand-black">New Product</h1>
      <ProductForm categories={(categories as Category[]) ?? []} />
    </div>
  )
}
