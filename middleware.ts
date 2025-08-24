import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Rutas que requieren autenticación
  const protectedRoutes = ['/profile', '/my-numbers', '/payment']
  
  // Rutas que requieren rol de admin
  const adminRoutes = ['/admin']

  const { pathname } = request.nextUrl

  // Verificar rutas de admin
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      const payload = await verifyToken(token)
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Verificar rutas protegidas generales
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      await verifyToken(token)
    } catch (error) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/my-numbers/:path*', '/payment/:path*']
}
