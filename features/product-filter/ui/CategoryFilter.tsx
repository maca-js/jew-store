'use client'

import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import type { Category } from '@/entities/category/model/types'

interface CategoryFilterProps {
  categories: Category[]
  locale: string
  activeSlug?: string
  allLabel: string
}

export function CategoryFilter({
  categories,
  locale,
  activeSlug,
  allLabel,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/${locale}/catalog`}
        className={cn(
          'text-xs font-sans tracking-widest uppercase px-4 py-2 border transition-colors',
          !activeSlug
            ? 'bg-brand-black text-brand-white border-brand-black'
            : 'border-brand-border text-brand-muted hover:border-brand-black hover:text-brand-black',
        )}
      >
        {allLabel}
      </Link>
      {categories.map((cat) => {
        const name = locale === 'uk' ? cat.name_uk : cat.name_en
        return (
          <Link
            key={cat.id}
            href={`/${locale}/catalog/${cat.slug}`}
            className={cn(
              'text-xs font-sans tracking-widest uppercase px-4 py-2 border transition-colors',
              activeSlug === cat.slug
                ? 'bg-brand-black text-brand-white border-brand-black'
                : 'border-brand-border text-brand-muted hover:border-brand-black hover:text-brand-black',
            )}
          >
            {name}
          </Link>
        )
      })}
    </div>
  )
}
