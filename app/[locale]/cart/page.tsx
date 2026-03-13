import type { Metadata } from 'next'
import { CartPageClient } from './CartPageClient'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'uk' ? 'Кошик' : 'Cart' }
}

export default async function CartPage({ params }: PageProps) {
  const { locale } = await params
  return <CartPageClient locale={locale} />
}
