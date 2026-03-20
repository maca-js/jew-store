'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { useCart } from '@/entities/cart/model/cartStore'

interface NpOption { ref: string; label: string }

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
  onChange: (label: string) => void
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
          {loading && (
            <div className="px-4 py-3 text-xs font-sans text-brand-muted">Пошук...</div>
          )}
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

interface CheckoutFormProps {
  locale: string
}

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const router = useRouter()
  const { items, total, clearCart } = useCart()

  const t = {
    contact: locale === 'uk' ? 'Контактні дані' : 'Contact',
    delivery: locale === 'uk' ? 'Доставка' : 'Delivery',
    payment: locale === 'uk' ? 'Оплата' : 'Payment',
    name: locale === 'uk' ? "Ім'я та прізвище *" : 'Full name *',
    email: 'Email',
    phone: locale === 'uk' ? 'Телефон *' : 'Phone *',
    city: locale === 'uk' ? 'Місто *' : 'City *',
    cityPh: locale === 'uk' ? 'Введіть місто...' : 'Enter city...',
    branch: locale === 'uk' ? 'Відділення *' : 'Branch *',
    branchPh: locale === 'uk' ? 'Оберіть відділення...' : 'Select branch...',
    deliveryTypeBranch: locale === 'uk' ? 'Відділення' : 'Branch',
    deliveryTypeCourier: locale === 'uk' ? "Кур'єр" : 'Courier',
    street: locale === 'uk' ? 'Вулиця *' : 'Street *',
    streetPh: locale === 'uk' ? 'напр. Хрещатик' : 'e.g. Khreshchatyk',
    house: locale === 'uk' ? 'Будинок *' : 'House number *',
    housePh: locale === 'uk' ? 'напр. 12а' : 'e.g. 12a',
    invoice: locale === 'uk' ? 'Оплата за рахунком (банківський переказ)' : 'Invoice (bank transfer)',
    cod: locale === 'uk' ? 'Накладний платіж (передплата)' : 'Cash on delivery (prepayment)',
    liqpay: locale === 'uk' ? 'LiqPay' : 'LiqPay',
    submit: locale === 'uk' ? 'Оформити замовлення' : 'Place Order',
    required: locale === 'uk' ? "Обов'язкове поле" : 'Required',
    phoneInvalid: locale === 'uk' ? 'Введіть 9 цифр (напр. 991234567)' : 'Enter 9 digits (e.g. 991234567)',
  }

  const schema = useMemo(() => z.object({
    customer_name: z.string().min(2),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().regex(/^\d{9}$/, t.phoneInvalid),
    delivery_type: z.enum(['branch', 'courier']),
    delivery_city: z.string().min(1),
    delivery_city_ref: z.string().min(1),
    delivery_branch: z.string().optional(),
    delivery_branch_ref: z.string().optional(),
    delivery_street: z.string().optional(),
    delivery_house: z.string().optional(),
    payment_method: z.enum(['invoice', 'cod', 'liqpay']),
  }).superRefine((data, ctx) => {
    if (data.delivery_type === 'branch') {
      if (!data.delivery_branch) ctx.addIssue({ code: 'custom', path: ['delivery_branch'], message: t.required })
      if (!data.delivery_branch_ref) ctx.addIssue({ code: 'custom', path: ['delivery_branch_ref'], message: t.required })
    }
    if (data.delivery_type === 'courier') {
      if (!data.delivery_street) ctx.addIssue({ code: 'custom', path: ['delivery_street'], message: t.required })
      if (!data.delivery_house) ctx.addIssue({ code: 'custom', path: ['delivery_house'], message: t.required })
    }
  }), [t.phoneInvalid, t.required])

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { payment_method: 'invoice', delivery_type: 'branch' },
  })

  const deliveryType = watch('delivery_type')

  // Nova Post city autocomplete
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [cityInput, setCityInput] = useState('')
  const [cityOptions, setCityOptions] = useState<NpOption[]>([])
  const [cityLoading, setCityLoading] = useState(false)
  const debouncedCity = useDebounce(cityInput, 350)

  const fetchCities = useCallback(async (q: string) => {
    if (q.length < 2) { setCityOptions([]); return }
    setCityLoading(true)
    try {
      const res = await fetch(`/api/nova-post?action=cities&q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setCityOptions(data)
    } finally {
      setCityLoading(false)
    }
  }, [])

  useEffect(() => { fetchCities(debouncedCity) }, [debouncedCity, fetchCities])

  // Nova Post branch autocomplete
  const [branchInput, setBranchInput] = useState('')
  const [branchOptions, setBranchOptions] = useState<NpOption[]>([])
  const [branchLoading, setBranchLoading] = useState(false)
  const [selectedCityRef, setSelectedCityRef] = useState('')

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
    setValue('delivery_city', opt.label, { shouldValidate: true })
    setValue('delivery_city_ref', opt.ref, { shouldValidate: true })
    setSelectedCityRef(opt.ref)
    setBranchInput('')
    setValue('delivery_branch', '', { shouldValidate: false })
    setValue('delivery_branch_ref', '', { shouldValidate: false })
    fetchBranches(opt.ref)
  }

  function handleBranchSelect(opt: NpOption) {
    setBranchInput(opt.label)
    setValue('delivery_branch', opt.label, { shouldValidate: true })
    setValue('delivery_branch_ref', opt.ref, { shouldValidate: true })
  }

  async function onSubmit(data: FormData) {
    setSubmitError(null)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: data.customer_name,
        email: data.email,
        phone: `+380${data.phone}`,
        delivery_service: 'nova_post',
        delivery_type: data.delivery_type,
        delivery_city: data.delivery_city,
        delivery_branch: data.delivery_type === 'branch' ? data.delivery_branch : undefined,
        delivery_street: data.delivery_type === 'courier' ? data.delivery_street : undefined,
        delivery_house: data.delivery_type === 'courier' ? data.delivery_house : undefined,
        payment_method: data.payment_method,
        items: items.map(item => ({
          product_id: item.product_id,
          name: locale === 'en' ? item.name_en : item.name_uk,
          price: item.price,
          quantity: item.quantity,
          ...(item.size && { size: item.size }),
          image: item.image,
        })),
        total,
      }),
    })
    if (!res.ok) {
      setSubmitError(locale === 'uk' ? 'Помилка при оформленні замовлення. Спробуйте ще раз.' : 'Failed to place order. Please try again.')
      return
    }
    const { orderId } = await res.json()
    clearCart()
    router.push(`/${locale}/order/${orderId}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Section 1: Contact */}
      <div className="space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t.contact}</h2>
        <Input
          label={t.name}
          error={errors.customer_name?.message}
          {...register('customer_name')}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t.phone}</label>
          <div className={`flex border transition-colors focus-within:border-brand-black ${errors.phone ? 'border-red-400' : 'border-brand-border'}`}>
            <span className="px-4 py-3 text-sm font-sans text-brand-black bg-brand-gray border-r border-brand-border select-none">+380</span>
            <input
              type="tel"
              maxLength={9}
              placeholder="991234567"
              className="flex-1 px-4 py-3 text-sm font-sans text-brand-black placeholder:text-brand-muted focus:outline-none bg-brand-white"
              {...register('phone')}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 font-sans">{errors.phone.message}</p>}
        </div>
        <Input
          label={t.email}
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      {/* Section 2: Delivery */}
      <div className="space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t.delivery}</h2>

        {/* Delivery service — Nova Post only for now */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">
            {locale === 'uk' ? 'Служба доставки' : 'Delivery service'}
          </label>
          <select
            disabled
            className="border border-brand-border px-4 py-3 text-sm font-sans bg-brand-gray text-brand-muted cursor-not-allowed"
          >
            <option>Nova Post</option>
          </select>
        </div>

        {/* Delivery type toggle: Branch / Courier */}
        <Controller
          name="delivery_type"
          control={control}
          render={({ field }) => (
            <div className="flex gap-0 border border-brand-border">
              {(['branch', 'courier'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    field.onChange(type)
                    // Clear opposite-mode fields
                    if (type === 'branch') {
                      setValue('delivery_street', '')
                      setValue('delivery_house', '')
                    } else {
                      setBranchInput('')
                      setValue('delivery_branch', '')
                      setValue('delivery_branch_ref', '')
                    }
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-sans transition-colors ${
                    field.value === type
                      ? 'bg-brand-black text-brand-white'
                      : 'bg-brand-white text-brand-black hover:bg-brand-gray'
                  }`}
                >
                  {type === 'branch' ? t.deliveryTypeBranch : t.deliveryTypeCourier}
                </button>
              ))}
            </div>
          )}
        />

        {/* Hidden fields for refs */}
        <input type="hidden" {...register('delivery_city_ref')} />
        <input type="hidden" {...register('delivery_branch_ref')} />

        <Autocomplete
          label={t.city}
          placeholder={t.cityPh}
          options={cityOptions}
          loading={cityLoading}
          value={cityInput}
          onChange={(v) => { setCityInput(v); setValue('delivery_city', '', { shouldValidate: false }); setValue('delivery_city_ref', '') }}
          onSelect={handleCitySelect}
          error={errors.delivery_city?.message || errors.delivery_city_ref?.message ? t.required : undefined}
        />

        {deliveryType === 'branch' ? (
          <Autocomplete
            label={t.branch}
            placeholder={!selectedCityRef ? (locale === 'uk' ? 'Спочатку оберіть місто' : 'Select city first') : t.branchPh}
            options={branchInput ? branchOptions.filter(o => o.label.toLowerCase().includes(branchInput.toLowerCase())) : branchOptions}
            loading={branchLoading}
            value={branchInput}
            onChange={(v) => { setBranchInput(v); setValue('delivery_branch', '', { shouldValidate: false }); setValue('delivery_branch_ref', '') }}
            onSelect={handleBranchSelect}
            disabled={!selectedCityRef}
            error={errors.delivery_branch?.message ? t.required : undefined}
          />
        ) : (
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t.street}</label>
              <input
                type="text"
                placeholder={t.streetPh}
                className={`border px-4 py-3 text-sm font-sans focus:outline-none transition-colors ${
                  errors.delivery_street ? 'border-red-400' : 'border-brand-border focus:border-brand-black'
                }`}
                {...register('delivery_street')}
              />
              {errors.delivery_street && <p className="text-xs text-red-500 font-sans">{t.required}</p>}
            </div>
            <div className="w-32 flex flex-col gap-1">
              <label className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t.house}</label>
              <input
                type="text"
                placeholder={t.housePh}
                className={`border px-4 py-3 text-sm font-sans focus:outline-none transition-colors ${
                  errors.delivery_house ? 'border-red-400' : 'border-brand-border focus:border-brand-black'
                }`}
                {...register('delivery_house')}
              />
              {errors.delivery_house && <p className="text-xs text-red-500 font-sans">{t.required}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Payment */}
      <div className="space-y-4">
        <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t.payment}</h2>
        <Controller
          name="payment_method"
          control={control}
          render={({ field }) => (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  field.value === 'invoice' ? 'border-brand-black' : 'border-brand-border group-hover:border-brand-muted'
                }`}>
                  {field.value === 'invoice' && <div className="w-2 h-2 rounded-full bg-brand-black" />}
                </div>
                <input type="radio" value="invoice" checked={field.value === 'invoice'} onChange={() => field.onChange('invoice')} className="sr-only" />
                <span className="text-sm font-sans">{t.invoice}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  field.value === 'cod' ? 'border-brand-black' : 'border-brand-border group-hover:border-brand-muted'
                }`}>
                  {field.value === 'cod' && <div className="w-2 h-2 rounded-full bg-brand-black" />}
                </div>
                <input type="radio" value="cod" checked={field.value === 'cod'} onChange={() => field.onChange('cod')} className="sr-only" />
                <span className="text-sm font-sans">{t.cod}</span>
              </label>

              <label className="flex items-center gap-3 cursor-not-allowed opacity-40">
                <div className="w-4 h-4 rounded-full border-2 border-brand-border" />
                <input type="radio" value="liqpay" disabled className="sr-only" />
                <span className="text-sm font-sans">{t.liqpay}</span>
                <span className="text-xs font-sans px-2 py-0.5 bg-brand-gray text-brand-muted">
                  {locale === 'uk' ? 'Скоро' : 'Soon'}
                </span>
              </label>
            </div>
          )}
        />
      </div>

      <div className="pt-4 border-t border-brand-border space-y-3">
        {submitError && (
          <p className="text-sm text-red-500 font-sans">{submitError}</p>
        )}
        <Button type="submit" size="lg" disabled={isSubmitting || items.length === 0} className="w-full">
          {isSubmitting ? '...' : t.submit}
        </Button>
      </div>
    </form>
  )
}
