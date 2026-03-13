import type { Metadata } from 'next'
import { CheckoutPageClient } from './CheckoutPageClient'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'uk' ? 'Оформлення замовлення' : 'Checkout' }
}

export default async function CheckoutPage({ params }: PageProps) {
  const { locale } = await params
  return <CheckoutPageClient locale={locale} />
}
