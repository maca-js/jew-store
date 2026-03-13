'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/entities/cart/model/cartStore'
import { cn } from '@/shared/lib/cn'

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav')
  const { count } = useCart()
  const pathname = usePathname()
  const router = useRouter()

  const otherLocale = locale === 'uk' ? 'en' : 'uk'
  const localePath = pathname.replace(`/${locale}`, `/${otherLocale}`)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-serif text-xl tracking-widest uppercase text-brand-black"
        >
          Legacy
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href={`/${locale}/catalog`}
            className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors"
          >
            {t('catalog')}
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-6">
          {/* Locale switcher */}
          <button
            onClick={() => router.push(localePath)}
            className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors"
          >
            {otherLocale.toUpperCase()}
          </button>

          {/* Cart */}
          <Link
            href={`/${locale}/cart`}
            className="relative text-xs font-sans tracking-widest uppercase text-brand-black hover:text-brand-muted transition-colors"
          >
            {t('cart')}
            {count > 0 && (
              <span className="absolute -top-2 -right-4 bg-brand-black text-brand-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
