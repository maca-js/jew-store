import type { Metadata } from 'next'
import Link from 'next/link'
import { getFeaturedProducts } from '@/entities/product/api/productApi'
import { getCategories } from '@/entities/category/api/categoryApi'
import { ProductGrid } from '@/widgets/product-grid/ui/ProductGrid'
import { CategoryCard } from '@/entities/category/ui/CategoryCard'
import { Button } from '@/shared/ui/Button'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'uk' ? 'Legacy — Ювелірні прикраси' : 'Legacy — Fine Jewelry',
    description:
      locale === 'uk'
        ? 'Ексклюзивні ювелірні прикраси Legacy. Каблучки, намиста, браслети.'
        : 'Exclusive Legacy fine jewelry. Rings, necklaces, bracelets.',
  }
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  const heroTitle = locale === 'uk' ? 'Ювелірні прикраси Legacy' : 'Legacy Fine Jewelry'
  const heroSub = locale === 'uk' ? 'Кожна деталь — вічна' : 'Every detail — timeless'
  const heroCta = locale === 'uk' ? 'Переглянути колекцію' : 'View Collection'
  const featuredTitle = locale === 'uk' ? 'Обрані прикраси' : 'Featured Pieces'
  const categoriesTitle = locale === 'uk' ? 'Категорії' : 'Categories'

  return (
    <>
      {/* Hero */}
      <section className="h-[85vh] flex flex-col items-center justify-center text-center px-6 border-b border-brand-border">
        <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-6">
          {heroSub}
        </p>
        <h1 className="font-serif text-5xl md:text-7xl text-brand-black leading-none mb-10">
          {heroTitle}
        </h1>
        <Link href={`/${locale}/catalog`}>
          <Button size="lg" variant="outline">{heroCta}</Button>
        </Link>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="font-serif text-3xl text-brand-black mb-10">{categoriesTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-brand-border">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-serif text-3xl text-brand-black">{featuredTitle}</h2>
            <Link
              href={`/${locale}/catalog`}
              className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors"
            >
              {locale === 'uk' ? 'Всі товари →' : 'All products →'}
            </Link>
          </div>
          <ProductGrid products={featured} locale={locale} />
        </section>
      )}
    </>
  )
}
