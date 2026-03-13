import { Inter, Cormorant_Garamond } from 'next/font/google'
import { AdminSidebar } from '@/widgets/admin-sidebar/ui/AdminSidebar'
import '../globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
})

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="flex min-h-screen bg-brand-gray">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-8">{children}</div>
        </div>
      </body>
    </html>
  )
}
