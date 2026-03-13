import { supabase } from '@/shared/api/supabaseClient'
import type { Product } from '../model/types'

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
  }

  const { data } = await query
  return data ?? []
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_featured', true)
    .eq('in_stock', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

export async function getAllProductSlugs(): Promise<string[]> {
  const { data } = await supabase.from('products').select('slug')
  return (data ?? []).map((p) => p.slug)
}
