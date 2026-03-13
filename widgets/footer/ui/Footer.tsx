import Link from 'next/link'

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="border-t border-brand-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-serif text-lg tracking-widest uppercase text-brand-black">
          Legacy
        </span>
        <p className="text-xs font-sans text-brand-muted tracking-wide">
          © {new Date().getFullYear()} Legacy. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link
            href={`/${locale}/catalog`}
            className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors"
          >
            {locale === 'uk' ? 'Каталог' : 'Catalog'}
          </Link>
        </div>
      </div>
    </footer>
  )
}
