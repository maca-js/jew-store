export type OrderStatus = 'new' | 'paid' | 'processing' | 'shipped' | 'delivered'
export type PaymentMethod = 'invoice' | 'liqpay'
export type OrderSource = 'website' | 'instagram'

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
  order_number: number
  customer_name: string
  email: string
  phone: string
  delivery_address: string
  delivery_service: string
  delivery_city: string
  delivery_branch: string
  payment_method: PaymentMethod
  items: OrderItem[]
  total: number
  status: OrderStatus
  liqpay_order_id: string | null
  tracking_number: string | null
  admin_notes: string | null
  source: OrderSource
  created_at: string
}
