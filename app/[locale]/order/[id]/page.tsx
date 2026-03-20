import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { createServerSupabase } from '@/shared/api/supabaseServer'
import type { Order } from '@/entities/order/model/types'
import { Button } from '@/shared/ui/Button'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'order' })
  return { title: t('title') }
}

export default async function OrderConfirmPage({ params }: PageProps) {
  const { locale, id } = await params
  const supabase = createServerSupabase()
  const [{ data: order }, t] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single<Order>(),
    getTranslations({ locale, namespace: 'order' }),
  ])

  const iban = process.env.STORE_IBAN ?? ''

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-brand-black rounded-full flex items-center justify-center mx-auto">
          <span className="text-brand-white text-lg">✓</span>
        </div>
        <h1 className="font-serif text-3xl text-brand-black">{t('title')}</h1>
        {order && (
          <p className="font-sans text-xs tracking-widest uppercase text-brand-muted">
            {t('order_id')} #{order.order_number}
          </p>
        )}
      </div>

      {order && (
        <>
          {/* Order items */}
          <div className="space-y-4">
            <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t('items')}</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="relative w-14 bg-brand-gray flex-shrink-0 overflow-hidden" style={{ height: '4.5rem' }}>
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm truncate">{item.name}</p>
                    {item.size && (
                      <p className="text-xs font-sans text-brand-muted">{t('size')}: {item.size}</p>
                    )}
                    <p className="text-xs font-sans text-brand-muted">
                      {item.quantity} × {item.price.toLocaleString()} грн
                    </p>
                  </div>
                  <p className="font-sans text-sm flex-shrink-0">
                    {(item.price * item.quantity).toLocaleString()} грн
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-brand-border">
              <span className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t('total')}</span>
              <span className="font-serif text-xl">{order.total.toLocaleString()} грн</span>
            </div>
          </div>

          {/* Delivery */}
          <div className="space-y-3">
            <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t('delivery')}</h2>
            <div className="bg-brand-gray px-5 py-4 space-y-1">
              <p className="text-sm font-sans font-medium">{t('nova_post')}</p>
              {order.delivery_city && (
                <p className="text-sm font-sans text-brand-muted">{order.delivery_city}</p>
              )}
              {order.delivery_type === 'courier'
                ? (order.delivery_street || order.delivery_house) && (
                    <p className="text-sm font-sans text-brand-muted">
                      вул. {order.delivery_street}, {order.delivery_house}
                    </p>
                  )
                : order.delivery_branch && (
                    <p className="text-sm font-sans text-brand-muted">{order.delivery_branch}</p>
                  )
              }
            </div>
          </div>

          {/* Payment instructions — invoice */}
          {order.payment_method === 'invoice' && (
            <div className="space-y-3">
              <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t('payment')}</h2>
              <div className="border border-brand-border px-5 py-5 space-y-4">
                <p className="font-serif text-lg">{t('invoice_title')}</p>
                <p className="text-sm font-sans text-brand-muted leading-relaxed">{t('invoice_instructions')}</p>
                <div className="space-y-2 pt-2 border-t border-brand-gray-dark">
                  {iban && (
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-xs font-sans tracking-widest uppercase text-brand-muted flex-shrink-0">{t('iban')}</span>
                      <span className="font-mono text-sm text-right break-all">{iban}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs font-sans tracking-widest uppercase text-brand-muted flex-shrink-0">{t('payment_reference')}</span>
                    <span className="font-mono text-sm">Legacy #{order.order_number}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs font-sans tracking-widest uppercase text-brand-muted flex-shrink-0">{t('amount')}</span>
                    <span className="font-sans text-md">{order.total.toLocaleString()} грн</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment instructions — COD */}
          {order.payment_method === 'cod' && (() => {
            const codPrepayment = order.items.reduce((sum, item) => sum + item.quantity, 0) * 200
            return (
              <div className="space-y-3">
                <h2 className="text-xs font-sans tracking-widest uppercase text-brand-muted">{t('payment')}</h2>
                <div className="border border-brand-border px-5 py-5 space-y-4">
                  <p className="font-serif text-lg">{t('cod_title')}</p>
                  <p className="text-sm font-sans text-brand-muted leading-relaxed">{t('cod_instructions')}</p>
                  <div className="space-y-2 pt-2 border-t border-brand-gray-dark">
                    {iban && (
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs font-sans tracking-widest uppercase text-brand-muted flex-shrink-0">{t('iban')}</span>
                        <span className="font-mono text-sm text-right break-all">{iban}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs font-sans tracking-widest uppercase text-brand-muted flex-shrink-0">{t('payment_reference')}</span>
                      <span className="font-mono text-sm">Legacy #{order.order_number}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs font-sans tracking-widest uppercase text-brand-muted flex-shrink-0">{t('amount')}</span>
                      <span className="font-sans text-md">{codPrepayment.toLocaleString()} грн</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </>
      )}

      <div className="text-center pt-4">
        <Link href={`/${locale}/catalog`}>
          <Button variant="outline">{t('continue_shopping')}</Button>
        </Link>
      </div>
    </div>
  )
}
