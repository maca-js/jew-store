import type { Metadata } from 'next'
import Link from 'next/link'
import { getOrderById } from '@/entities/order/api/orderApi'
import { Button } from '@/shared/ui/Button'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'uk' ? 'Замовлення прийнято' : 'Order Confirmed' }
}

export default async function OrderConfirmPage({ params }: PageProps) {
  const { locale, id } = await params
  const order = await getOrderById(id)

  const t = {
    title: locale === 'uk' ? 'Дякуємо за замовлення!' : 'Thank you for your order!',
    text:
      locale === 'uk'
        ? `Ваше замовлення #${id.slice(0, 8)} успішно оформлено. Ми зв'яжемося з вами найближчим часом.`
        : `Your order #${id.slice(0, 8)} has been placed. We'll contact you shortly.`,
    cta: locale === 'uk' ? 'Продовжити покупки' : 'Continue Shopping',
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-8">
      <div className="w-16 h-16 bg-brand-black rounded-full flex items-center justify-center mx-auto">
        <span className="text-brand-white text-xl">✓</span>
      </div>
      <div className="space-y-4">
        <h1 className="font-serif text-3xl text-brand-black">{t.title}</h1>
        <p className="font-sans text-sm text-brand-muted leading-relaxed">{t.text}</p>
        {order && (
          <p className="font-sans text-sm text-brand-muted">
            {locale === 'uk' ? 'Разом' : 'Total'}: {order.total.toLocaleString()} грн
          </p>
        )}
      </div>
      <Link href={`/${locale}/catalog`}>
        <Button variant="outline">{t.cta}</Button>
      </Link>
    </div>
  )
}
