'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { useCart } from '@/entities/cart/model/cartStore'
import type { Product } from '@/entities/product/model/types'

interface AddToCartButtonProps {
  product: Product
  locale: string
  selectedSize: string | null
  addLabel: string
  chooseSizeLabel: string
}

export function AddToCartButton({
  product,
  locale,
  selectedSize,
  addLabel,
  chooseSizeLabel,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const needsSize = product.available_sizes.length > 0

  function handleClick() {
    if (needsSize && !selectedSize) return

    addItem({
      product_id: product.id,
      name_uk: product.name_uk,
      name_en: product.name_en,
      price: product.price,
      quantity: 1,
      size: selectedSize ?? undefined,
      image: product.images[0] ?? '',
      slug: product.slug,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const label =
    added
      ? '✓'
      : needsSize && !selectedSize
        ? chooseSizeLabel
        : addLabel

  return (
    <Button
      variant="primary"
      size="lg"
      className="w-full"
      onClick={handleClick}
      disabled={!product.in_stock}
    >
      {label}
    </Button>
  )
}
