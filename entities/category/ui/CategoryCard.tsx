import Image from 'next/image'
import Link from 'next/link'
import type { Category } from '../model/types'

interface CategoryCardProps {
  category: Category
  locale: string
}

export function CategoryCard({ category, locale }: CategoryCardProps) {
  const name = locale === 'uk' ? category.name_uk : category.name_en

  return (
    <Link
      href={`/${locale}/catalog/${category.slug}`}
      className="group relative block aspect-square overflow-hidden bg-brand-gray"
    >
      {category.image_url && (
        <Image
          src={category.image_url}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-brand-black/30 transition-colors" />
      <div className="absolute inset-0 flex items-end p-6">
        <h3 className="font-serif text-xl text-brand-white tracking-wide">
          {name}
        </h3>
      </div>
    </Link>
  )
}
