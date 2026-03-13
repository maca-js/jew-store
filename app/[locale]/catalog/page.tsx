import type { Metadata } from 'next'
import { getProducts } from '@/entities/product/api/productApi'
import { getCategories } from '@/entities/category/api/categoryApi'
import { ProductGrid } from '@/widgets/product-grid/ui/ProductGrid'
import { CategoryFilter } from '@/features/product-filter/ui/CategoryFilter'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'uk' ? 'Каталог' : 'Catalog',
  }
}

export default async function CatalogPage({ params }: PageProps) {
  const { locale } = await params
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  const title = locale === 'uk' ? 'Каталог' : 'Catalog'
  const allLabel = locale === 'uk' ? 'Всі' : 'All'
  const emptyMsg = locale === 'uk' ? 'Товари не знайдено' : 'No products found'

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-brand-black mb-10">{title}</h1>
      <div className="mb-10">
        <CategoryFilter
          categories={categories}
          locale={locale}
          allLabel={allLabel}
        />
      </div>
      <ProductGrid products={products} locale={locale} emptyMessage={emptyMsg} />
    </div>
  )
}
