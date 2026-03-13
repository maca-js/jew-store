export type BadgeType = 'new' | 'sale' | 'bestseller'

export interface Product {
  id: string
  category_id: string
  name_uk: string
  name_en: string
  description_uk: string
  description_en: string
  price: number
  images: string[]
  available_sizes: string[]
  badge: BadgeType | null
  is_featured: boolean
  slug: string
  in_stock: boolean
  created_at: string
  category?: Category
}

import type { Category } from '@/entities/category/model/types'
