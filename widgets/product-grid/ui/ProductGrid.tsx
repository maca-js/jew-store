import { ProductCard } from '@/entities/product/ui/ProductCard'
import type { Product } from '@/entities/product/model/types'

interface ProductGridProps {
  products: Product[]
  locale: string
  emptyMessage?: string
}

export function ProductGrid({ products, locale, emptyMessage }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-center text-brand-muted font-sans py-16">
        {emptyMessage ?? 'No products found'}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  )
}
