export type OrderStatus = 'new' | 'paid' | 'processing' | 'shipped' | 'delivered'

export interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  size?: string
  image: string
}

export interface Order {
  id: string
  customer_name: string
  email: string
  phone: string
  delivery_address: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  liqpay_order_id: string | null
  created_at: string
}
