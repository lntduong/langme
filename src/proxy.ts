import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  const publicPaths = ['/auth/login', '/auth/register', '/api/auth', '/api/register']
  const isPublic = publicPaths.some(path => pathname.startsWith(path))

  if (isPublic) {
    return NextResponse.next()
  }

  // Check for session token cookie (NextAuth sets this)
  const token = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token')

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|auth).*)'],
}
