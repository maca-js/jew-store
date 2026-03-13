import type { MetadataRoute } from 'next'
import { getAllProductSlugs } from '@/entities/product/api/productApi'
import { getCategories } from '@/entities/category/api/categoryApi'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://legacy-jewel.vercel.app'
const locales = ['uk', 'en']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('your_')

  const [slugs, categories] = supabaseConfigured
    ? await Promise.all([getAllProductSlugs(), getCategories()])
    : [[] as string[], [] as Awaited<ReturnType<typeof getCategories>>]

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    { url: `${BASE_URL}/${locale}`, lastModified: new Date(), priority: 1.0 },
    { url: `${BASE_URL}/${locale}/catalog`, lastModified: new Date(), priority: 0.9 },
  ])

  const categoryRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    categories.map((cat) => ({
      url: `${BASE_URL}/${locale}/catalog/${cat.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
  )

  const productRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    slugs.map((slug) => ({
      url: `${BASE_URL}/${locale}/product/${slug}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
  )

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
