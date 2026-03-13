'use client'

import { useCart } from '@/entities/cart/model/cartStore'
import { CheckoutForm } from '@/features/checkout-form/ui/CheckoutForm'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/shared/ui/Button'

interface CheckoutPageClientProps {
  locale: string
}

export function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const { items, total } = useCart()

  const t = {
    title: locale === 'uk' ? 'Оформлення замовлення' : 'Checkout',
    orderSummary: locale === 'uk' ? 'Ваше замовлення' : 'Order Summary',
    total: locale === 'uk' ? 'Разом' : 'Total',
    size: locale === 'uk' ? 'Розмір' : 'Size',
    empty: locale === 'uk' ? 'Кошик порожній' : 'Your cart is empty',
    emptyCta: locale === 'uk' ? 'До каталогу' : 'Browse catalog',
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-6">
        <p className="font-sans text-brand-muted">{t.empty}</p>
        <Link href={`/${locale}/catalog`}>
          <Button variant="outline">{t.emptyCta}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-brand-black mb-12">{t.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Form */}
        <CheckoutForm locale={locale} />

        {/* Order summary */}
        <div className="space-y-6">
          <h2 className="font-serif text-xl text-brand-black">{t.orderSummary}</h2>
          <div className="space-y-4">
            {items.map((item) => {
              const name = locale === 'uk' ? item.name_uk : item.name_en
              return (
                <div
                  key={`${item.product_id}-${item.size}`}
                  className="flex gap-4 items-start"
                >
                  <div className="relative w-16 h-20 bg-brand-gray flex-shrink-0">
                    {item.image && (
                      <Image src={item.image} alt={name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-sm">{name}</p>
                    {item.size && (
                      <p className="text-xs font-sans text-brand-muted">
                        {t.size}: {item.size}
                      </p>
                    )}
                    <p className="text-xs font-sans text-brand-muted mt-1">
                      {item.quantity} × {item.price.toLocaleString()} грн
                    </p>
                  </div>
                  <p className="font-sans text-sm">
                    {(item.price * item.quantity).toLocaleString()} грн
                  </p>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-brand-border">
            <span className="text-xs font-sans tracking-widest uppercase text-brand-muted">
              {t.total}
            </span>
            <span className="font-serif text-xl">{total.toLocaleString()} грн</span>
          </div>
        </div>
      </div>
    </div>
  )
}
