import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/shared/config/i18n'
import { Header } from '@/widgets/header/ui/Header'
import { Footer } from '@/widgets/footer/ui/Footer'
import '../globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://legacy-jewel.vercel.app'),
  title: { default: 'Legacy — Ювелірні прикраси', template: '%s | Legacy' },
  description: 'Ексклюзивні ювелірні прикраси Legacy. Каблучки, намиста, браслети.',
  openGraph: {
    siteName: 'Legacy',
    type: 'website',
  },
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!(routing.locales as readonly string[]).includes(locale)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <main className="pt-16 min-h-screen">{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
