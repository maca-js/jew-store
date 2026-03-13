'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/entities/cart/model/cartStore'
import { Button } from '@/shared/ui/Button'

interface CartPageClientProps {
  locale: string
}

export function CartPageClient({ locale }: CartPageClientProps) {
  const { items, removeItem, total } = useCart()

  const t = {
    title: locale === 'uk' ? 'Кошик' : 'Cart',
    empty: locale === 'uk' ? 'Кошик порожній' : 'Your cart is empty',
    emptyCta: locale === 'uk' ? 'До каталогу' : 'Browse catalog',
    size: locale === 'uk' ? 'Розмір' : 'Size',
    remove: locale === 'uk' ? 'Видалити' : 'Remove',
    subtotal: locale === 'uk' ? 'Разом' : 'Subtotal',
    checkout: locale === 'uk' ? 'Оформити замовлення' : 'Checkout',
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-brand-black mb-12">{t.title}</h1>

      {items.length === 0 ? (
        <div className="text-center py-24 space-y-6">
          <p className="font-sans text-brand-muted">{t.empty}</p>
          <Link href={`/${locale}/catalog`}>
            <Button variant="outline">{t.emptyCta}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {items.map((item) => {
            const name = locale === 'uk' ? item.name_uk : item.name_en
            return (
              <div
                key={`${item.product_id}-${item.size}`}
                className="flex gap-6 pb-8 border-b border-brand-border"
              >
                <Link href={`/${locale}/product/${item.slug}`} className="flex-shrink-0">
                  <div className="relative w-24 h-32 bg-brand-gray">
                    {item.image && (
                      <Image src={item.image} alt={name} fill className="object-cover" />
                    )}
                  </div>
                </Link>
                <div className="flex-1 space-y-2">
                  <Link href={`/${locale}/product/${item.slug}`}>
                    <h3 className="font-serif text-base hover:text-brand-muted transition-colors">
                      {name}
                    </h3>
                  </Link>
                  {item.size && (
                    <p className="text-xs font-sans text-brand-muted tracking-wide">
                      {t.size}: {item.size}
                    </p>
                  )}
                  <p className="font-sans text-sm">{item.price.toLocaleString()} грн</p>
                  <button
                    onClick={() => removeItem(item.product_id, item.size)}
                    className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-red-500 transition-colors"
                  >
                    {t.remove}
                  </button>
                </div>
              </div>
            )
          })}

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-xs font-sans tracking-widest uppercase text-brand-muted">
                {t.subtotal}
              </p>
              <p className="font-serif text-2xl mt-1">{total.toLocaleString()} грн</p>
            </div>
            <Link href={`/${locale}/checkout`}>
              <Button size="lg">{t.checkout}</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
