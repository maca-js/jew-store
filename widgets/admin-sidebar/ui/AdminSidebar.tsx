'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/cn'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-brand-black text-brand-white flex-shrink-0">
      <div className="p-6 border-b border-white/10">
        <span className="font-serif text-lg tracking-widest uppercase">Legacy</span>
        <p className="text-xs text-white/40 font-sans mt-1 tracking-wider">Admin</p>
      </div>
      <nav className="p-4 flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-4 py-2.5 text-xs font-sans tracking-widest uppercase transition-colors rounded',
              pathname === link.href
                ? 'bg-white/10 text-brand-white'
                : 'text-white/60 hover:text-white hover:bg-white/5',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-6 left-0 w-56 px-4">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="w-full px-4 py-2.5 text-xs font-sans tracking-widest uppercase text-white/40 hover:text-white transition-colors text-left"
          >
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
