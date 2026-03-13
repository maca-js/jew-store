import { supabase } from '@/shared/api/supabaseClient'
import type { Order, OrderItem } from '../model/types'

export interface CreateOrderPayload {
  customer_name: string
  email: string
  phone: string
  delivery_address: string
  items: OrderItem[]
  total: number
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...payload, status: 'new' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
