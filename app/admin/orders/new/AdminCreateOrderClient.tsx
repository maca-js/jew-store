'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import type { OrderItem, OrderSource, OrderStatus, PaymentMethod } from '@/entities/order/model/types'

interface NpOption { ref: string; label: string }

interface ProductOption {
  id: string
  name_uk: string
  name_en: string
  price: number
  images: string[]
  available_sizes: string[]
  in_stock: boolean
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

interface AutocompleteProps {
  label: string
  placeholder: string
  options: NpOption[]
  loading: boolean
  value: string
  onChange: (v: string) => void
  onSelect: (opt: NpOption) => void
  disabled?: boolean
  error?: string
}

function Autocomplete({ label, placeholder, options, loading, value, onChange, onSelect, disabled, error }: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative flex flex-col gap-1">
      <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => options.length > 0 && setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`border px-4 py-3 text-sm font-sans focus:outline-none transition-colors ${
          error ? 'border-red-400' : 'border-brand-border focus:border-brand-black'
        } ${disabled ? 'bg-brand-gray text-brand-muted cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-xs text-red-500 font-sans">{error}</p>}
      {open && (loading || options.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-brand-border shadow-lg max-h-56 overflow-auto">
          {loading && <div className="px-4 py-3 text-xs font-sans text-brand-muted">Пошук...</div>}
          {options.map((opt) => (
            <button
              key={opt.ref}
              type="button"
              onClick={() => { onSelect(opt); setOpen(false) }}
              className="w-full text-left px-4 py-3 text-sm font-sans hover:bg-brand-gray transition-colors border-b border-brand-gray last:border-0"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
]

export function AdminCreateOrderClient() {
  const router = useRouter()

  // Customer
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Delivery
  const [cityInput, setCityInput] = useState('')
  const [cityOptions, setCityOptions] = useState<NpOption[]>([])
  const [cityLoading, setCityLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCityRef, setSelectedCityRef] = useState('')
  const [branchInput, setBranchInput] = useState('')
  const [branchOptions, setBranchOptions] = useState<NpOption[]>([])
  const [branchLoading, setBranchLoading] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState('')

  // Product search
  const [productSearch, setProductSearch] = useState('')
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [productLoading, setProductLoading] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const productRef = useRef<HTMLDivElement>(null)

  // Order
  const [items, setItems] = useState<OrderItem[]>([])
  const [status, setStatus] = useState<OrderStatus>('new')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('invoice')
  const [source, setSource] = useState<OrderSource>('instagram')
  const [notes, setNotes] = useState('')

  // UI
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  // Nova Post city autocomplete
  const debouncedCity = useDebounce(cityInput, 350)
  const fetchCities = useCallback(async (q: string) => {
    if (q.length < 2) { setCityOptions([]); return }
    setCityLoading(true)
    try {
      const res = await fetch(`/api/nova-post?action=cities&q=${encodeURIComponent(q)}`)
      setCityOptions(await res.json())
    } finally {
      setCityLoading(false)
    }
  }, [])
  useEffect(() => { fetchCities(debouncedCity) }, [debouncedCity, fetchCities])

  const fetchBranches = useCallback(async (cityRef: string) => {
    if (!cityRef) return
    setBranchLoading(true)
    try {
      const res = await fetch(`/api/nova-post?action=branches&cityRef=${cityRef}`)
      const data = await res.json()
      setBranchOptions(Array.isArray(data) ? data : [])
    } finally {
      setBranchLoading(false)
    }
  }, [])

  function handleCitySelect(opt: NpOption) {
    setCityInput(opt.label)
    setSelectedCity(opt.label)
    setSelectedCityRef(opt.ref)
    setBranchInput('')
    setSelectedBranch('')
    fetchBranches(opt.ref)
  }

  function handleBranchSelect(opt: NpOption) {
    setBranchInput(opt.label)
    setSelectedBranch(opt.label)
  }

  // Product search autocomplete
  const debouncedProduct = useDebounce(productSearch, 350)
  useEffect(() => {
    if (debouncedProduct.length < 2) { setProductOptions([]); return }
    setProductLoading(true)
    fetch(`/api/admin/products?search=${encodeURIComponent(debouncedProduct)}`)
      .then((r) => r.json())
      .then((data) => setProductOptions(Array.isArray(data) ? data : []))
      .finally(() => setProductLoading(false))
  }, [debouncedProduct])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (productRef.current && !productRef.current.contains(e.target as Node)) setProductOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleProductSelect(p: ProductOption) {
    setSelectedProduct(p)
    setProductSearch(p.name_uk)
    setProductOpen(false)
    setSelectedSize(p.available_sizes[0] ?? '')
    setQty(1)
  }

  function handleAddItem() {
    if (!selectedProduct) return
    const existing = items.findIndex(
      (i) => i.product_id === selectedProduct.id && i.size === (selectedSize || undefined)
    )
    if (existing >= 0) {
      setItems(items.map((item, idx) =>
        idx === existing ? { ...item, quantity: item.quantity + qty } : item
      ))
    } else {
      setItems([...items, {
        product_id: selectedProduct.id,
        name: selectedProduct.name_uk,
        price: selectedProduct.price,
        quantity: qty,
        ...(selectedSize ? { size: selectedSize } : {}),
        image: selectedProduct.images[0] ?? '',
      }])
    }
    setSelectedProduct(null)
    setProductSearch('')
    setSelectedSize('')
    setQty(1)
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Required'
    if (!phone.trim()) errs.phone = 'Required'
    if (items.length === 0) errs.items = 'Add at least one item'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          email,
          phone,
          delivery_city: selectedCity,
          delivery_branch: selectedBranch,
          items,
          total,
          status,
          payment_method: paymentMethod,
          source,
          admin_notes: notes || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setErrors({ submit: d.error ?? 'Failed to create order' })
        return
      }
      router.push('/admin/orders')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <h1 className="font-serif text-3xl text-brand-black">New Order</h1>

      {/* Customer */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Customer</h2>
        <Input
          label="Full Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Phone *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+380991234567"
          error={errors.phone}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Delivery */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Delivery (Nova Post)</h2>
        <Autocomplete
          label="City"
          placeholder="Enter city..."
          options={cityOptions}
          loading={cityLoading}
          value={cityInput}
          onChange={(v) => { setCityInput(v); setSelectedCity(''); setSelectedCityRef('') }}
          onSelect={handleCitySelect}
        />
        <Autocomplete
          label="Branch"
          placeholder={!selectedCityRef ? 'Select city first' : 'Select branch...'}
          options={branchInput ? branchOptions.filter((o) => o.label.toLowerCase().includes(branchInput.toLowerCase())) : branchOptions}
          loading={branchLoading}
          value={branchInput}
          onChange={(v) => { setBranchInput(v); setSelectedBranch('') }}
          onSelect={handleBranchSelect}
          disabled={!selectedCityRef}
        />
      </div>

      {/* Items */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Items</h2>

        {/* Product search */}
        <div ref={productRef} className="relative flex flex-col gap-1">
          <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">Search Product</label>
          <input
            type="text"
            value={productSearch}
            onChange={(e) => { setProductSearch(e.target.value); setProductOpen(true); setSelectedProduct(null) }}
            onFocus={() => productOptions.length > 0 && setProductOpen(true)}
            placeholder="Type product name..."
            className="border border-brand-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-black"
          />
          {productOpen && (productLoading || productOptions.length > 0) && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-brand-border shadow-lg max-h-56 overflow-auto">
              {productLoading && <div className="px-4 py-3 text-xs font-sans text-brand-muted">Searching...</div>}
              {productOptions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProductSelect(p)}
                  className="w-full text-left px-4 py-3 text-sm font-sans hover:bg-brand-gray transition-colors border-b border-brand-gray last:border-0 flex items-center gap-3"
                >
                  {p.images[0] && (
                    <img src={p.images[0]} alt="" className="w-8 h-8 object-cover flex-shrink-0" />
                  )}
                  <span className="flex-1">{p.name_uk}</span>
                  <span className="text-brand-muted">{p.price} грн</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Size + qty + add */}
        {selectedProduct && (
          <div className="flex gap-3 items-end">
            {selectedProduct.available_sizes.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">Size</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="border border-brand-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-black"
                >
                  {selectedProduct.available_sizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">Qty</label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="border border-brand-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-black w-20"
              />
            </div>
            <Button type="button" onClick={handleAddItem}>Add</Button>
          </div>
        )}

        {/* Items list */}
        {items.length > 0 && (
          <div className="border border-brand-gray-dark divide-y divide-brand-gray-dark">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-3">
                {item.image && (
                  <img src={item.image} alt="" className="w-10 h-12 object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans text-brand-black truncate">{item.name}</p>
                  {item.size && <p className="text-xs font-sans text-brand-muted">{item.size}</p>}
                </div>
                <span className="text-sm font-sans text-brand-muted whitespace-nowrap">
                  {item.quantity} × {item.price} грн
                </span>
                <span className="text-sm font-sans font-medium text-brand-black whitespace-nowrap">
                  {item.price * item.quantity} грн
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-xs font-sans text-red-400 hover:text-red-600 transition-colors ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="px-4 py-3 flex justify-end">
              <span className="text-sm font-sans font-medium text-brand-black">Total: {total} грн</span>
            </div>
          </div>
        )}

        {errors.items && <p className="text-xs text-red-500 font-sans">{errors.items}</p>}
      </div>

      {/* Order metadata */}
      <div className="bg-brand-white p-6 space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">Order Details</h2>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="border border-brand-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-black"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as OrderSource)}
            className="border border-brand-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-black"
          >
            <option value="instagram">Instagram</option>
            <option value="website">Website</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="border border-brand-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-black"
          >
            <option value="invoice">Invoice (bank transfer)</option>
            <option value="cod">Накладний платіж (передплата)</option>
            <option value="liqpay">LiqPay</option>
          </select>
        </div>
        <Textarea
          label="Admin Notes (internal)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Instagram order, DM received 17/03..."
        />
      </div>

      {errors.submit && <p className="text-xs text-red-500 font-sans">{errors.submit}</p>}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? '...' : 'Create Order'}
        </Button>
        <button
          type="button"
          onClick={() => router.push('/admin/orders')}
          className="text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
