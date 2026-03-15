import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategories, getCategoryBySlug } from '@/entities/category/api/categoryApi'
import { ProductGrid } from '@/widgets/product-grid/ui/ProductGrid'
import { CategoryFilter } from '@/features/product-filter/ui/CategoryFilter'
import { supabase } from '@/shared/api/supabaseClient'

interface PageProps {
  params: Promise<{ locale: string; category: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: locale === 'uk' ? category.name_uk : category.name_en,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, category: slug } = await params
  const [category, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ])

  if (!category) notFound()

  // Filter products by category id
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', category.id)
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  const title = locale === 'uk' ? category.name_uk : category.name_en
  const allLabel = locale === 'uk' ? 'Всі' : 'All'
  const emptyMsg = locale === 'uk' ? 'Товари не знайдено' : 'No products found'

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-brand-black mb-10">{title}</h1>
      <div className="mb-10">
        <CategoryFilter
          categories={categories}
          locale={locale}
          activeSlug={slug}
          allLabel={allLabel}
        />
      </div>
      <ProductGrid products={products ?? []} locale={locale} emptyMessage={emptyMsg} />
    </div>
  )
}
