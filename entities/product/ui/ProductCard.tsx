import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/shared/ui/Badge'
import type { Product } from '../model/types'

interface ProductCardProps {
  product: Product
  locale: string
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const name = locale === 'uk' ? product.name_uk : product.name_en
  const image = product.images[0] ?? '/placeholder.jpg'

  return (
    <Link href={`/${locale}/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-gray mb-4">
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant={product.badge} />
          </div>
        )}
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-base text-brand-black leading-snug">
          {name}
        </h3>
        <p className="font-sans text-sm text-brand-muted">
          {product.price.toLocaleString()} грн
        </p>
      </div>
    </Link>
  )
}
