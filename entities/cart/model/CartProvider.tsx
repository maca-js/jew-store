'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { CartItem } from './types'

const CART_KEY = 'legacy_cart'

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export interface CartContextValue {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size?: string) => void
  updateQuantity: (productId: string, size: string | undefined, quantity: number) => void
  clearCart: () => void
  total: number
  count: number
}

export const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(readCart())
  }, [])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product_id === item.product_id && i.size === item.size,
      )
      const next = existing
        ? prev.map((i) =>
            i.product_id === item.product_id && i.size === item.size
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          )
        : [...prev, item]
      writeCart(next)
      return next
    })
  }, [])

  const removeItem = useCallback((productId: string, size?: string) => {
    setItems((prev) => {
      const next = prev.filter(
        (i) => !(i.product_id === productId && i.size === size),
      )
      writeCart(next)
      return next
    })
  }, [])

  const updateQuantity = useCallback((productId: string, size: string | undefined, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        const next = prev.filter((i) => !(i.product_id === productId && i.size === size))
        writeCart(next)
        return next
      }
      const next = prev.map((i) =>
        i.product_id === productId && i.size === size ? { ...i, quantity } : i,
      )
      writeCart(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    writeCart([])
    setItems([])
  }, [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
