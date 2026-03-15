import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getProductBySlug,
} from '@/entities/product/api/productApi'
import { ProductGallery } from '@/widgets/product-gallery/ui/ProductGallery'
import { ProductPageClient } from './ProductPageClient'
import { Badge } from '@/shared/ui/Badge'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const name = locale === 'uk' ? product.name_uk : product.name_en
  const description = locale === 'uk' ? product.description_uk : product.description_en
  const image = product.images[0]

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      images: image ? [{ url: image }] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const name = locale === 'uk' ? product.name_uk : product.name_en
  const description = locale === 'uk' ? product.description_uk : product.description_en
  const categoryName = product.category
    ? locale === 'uk'
      ? product.category.name_uk
      : product.category.name_en
    : null

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'UAH',
      availability: product.in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery */}
          <ProductGallery images={product.images} name={name} />

          {/* Info */}
          <div className="space-y-8">
            {categoryName && (
              <p className="text-xs font-sans tracking-widest uppercase text-brand-muted">
                {categoryName}
              </p>
            )}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <h1 className="font-serif text-3xl md:text-4xl text-brand-black leading-tight">
                  {name}
                </h1>
                {product.badge && <Badge variant={product.badge} className="mt-2" />}
              </div>
              <p className="font-serif text-2xl text-brand-black">
                {product.price.toLocaleString()} грн
              </p>
            </div>

            <ProductPageClient product={product} locale={locale} />

            {description && (
              <div className="pt-6 border-t border-brand-border">
                <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mb-3">
                  {locale === 'uk' ? 'Опис' : 'Description'}
                </p>
                <p className="font-sans text-sm text-brand-muted leading-relaxed">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
