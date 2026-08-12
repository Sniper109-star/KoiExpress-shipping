import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  if (!isAdminRoute || pathname === '/admin') return NextResponse.next()

  const session = request.cookies.get('admin_session')?.value
  if (session !== 'authenticated-admin') {
    if (pathname.startsWith('/api/admin')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] }
