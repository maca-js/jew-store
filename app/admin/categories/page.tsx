import { createServerSupabase } from '@/shared/api/supabaseServer'
import type { Category } from '@/entities/category/model/types'
import Link from 'next/link'
import { AdminCategoriesClient } from './AdminCategoriesClient'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const supabase = createServerSupabase()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name_uk')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-brand-black">Categories</h1>
      </div>
      <AdminCategoriesClient categories={(categories as Category[]) ?? []} />
    </div>
  )
}
