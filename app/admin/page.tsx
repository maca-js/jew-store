import { createServerSupabase } from '@/shared/api/supabaseServer'

export default async function AdminDashboard() {
  const supabase = createServerSupabase()

  const [{ count: productCount }, { count: orderCount }, { count: categoryCount }] =
    await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
    ])

  const stats = [
    { label: 'Products', value: productCount ?? 0, href: '/admin/products' },
    { label: 'Orders', value: orderCount ?? 0, href: '/admin/orders' },
    { label: 'Categories', value: categoryCount ?? 0, href: '/admin/categories' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl text-brand-black">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="bg-brand-white p-6 hover:shadow-md transition-shadow block"
          >
            <p className="text-3xl font-serif text-brand-black">{stat.value}</p>
            <p className="text-xs font-sans tracking-widest uppercase text-brand-muted mt-2">
              {stat.label}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
