'use client'

import { useState } from 'react'
import { SizeSelector } from '@/features/select-size/ui/SizeSelector'
import { AddToCartButton } from '@/features/add-to-cart/ui/AddToCartButton'
import type { Product } from '@/entities/product/model/types'

interface ProductPageClientProps {
  product: Product
  locale: string
}

export function ProductPageClient({ product, locale }: ProductPageClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {product.available_sizes.length > 0 && (
        <SizeSelector
          sizes={product.available_sizes}
          selected={selectedSize}
          onSelect={setSelectedSize}
          label={locale === 'uk' ? 'Розмір' : 'Size'}
        />
      )}
      <AddToCartButton
        product={product}
        locale={locale}
        selectedSize={selectedSize}
        addLabel={locale === 'uk' ? 'Додати до кошика' : 'Add to Cart'}
        chooseSizeLabel={locale === 'uk' ? 'Оберіть розмір' : 'Choose size'}
      />
    </div>
  )
}
