import createMiddleware from 'next-intl/middleware'
import { routing } from '@/shared/config/i18n'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyAdminToken } from '@/shared/lib/adminAuth'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes: check auth cookie, skip i18n
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()

    const token = request.cookies.get('admin_token')?.value ?? ''
    if (!(await verifyAdminToken(token, process.env.ADMIN_SECRET!))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
