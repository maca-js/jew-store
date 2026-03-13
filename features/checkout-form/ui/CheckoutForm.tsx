'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { useCart } from '@/entities/cart/model/cartStore'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'

const schema = z.object({
  customer_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  delivery_address: z.string().min(5),
})

type FormData = z.infer<typeof schema>

interface CheckoutFormProps {
  locale: string
}

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const t = useTranslations('checkout')
  const { items, total, clearCart } = useCart()
  const liqpayFormRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        items,
        total,
        locale,
      }),
    })

    if (!res.ok) return

    const { data: liqpayData, signature } = await res.json()

    // Inject values and submit hidden LiqPay form
    const form = liqpayFormRef.current!
    ;(form.querySelector('[name=data]') as HTMLInputElement).value = liqpayData
    ;(form.querySelector('[name=signature]') as HTMLInputElement).value = signature
    clearCart()
    form.submit()
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label={t('name')}
          error={errors.customer_name?.message}
          {...register('customer_name')}
        />
        <Input
          label={t('email')}
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('phone')}
          type="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label={t('address')}
          error={errors.delivery_address?.message}
          {...register('delivery_address')}
        />

        <div className="pt-4 border-t border-brand-border flex items-center justify-between">
          <span className="font-serif text-lg">{total.toLocaleString()} грн</span>
          <Button type="submit" size="lg" disabled={isSubmitting || items.length === 0}>
            {isSubmitting ? '...' : t('submit')}
          </Button>
        </div>
      </form>

      {/* Hidden LiqPay form — auto-submitted after order creation */}
      <form
        ref={liqpayFormRef}
        method="POST"
        action="https://www.liqpay.ua/api/3/checkout"
        acceptCharset="utf-8"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="data" />
        <input type="hidden" name="signature" />
      </form>
    </>
  )
}
