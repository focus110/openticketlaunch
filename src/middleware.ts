import { createSupabaseMiddlewareClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await createSupabaseMiddlewareClient(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

