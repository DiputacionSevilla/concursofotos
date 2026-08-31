import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/shared/types/database'

const PARTICIPANT_ROUTES = ['/participar']
const ADMIN_ROUTES = ['/admin']
const AUTH_ONLY_ROUTES = ['/completar-perfil']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const needsParticipant = PARTICIPANT_ROUTES.some((route) => pathname.startsWith(route))
  const needsAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route))
  const needsAuthOnly = AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route))

  if ((needsParticipant || needsAdmin || needsAuthOnly) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (needsAdmin && user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  if (needsParticipant && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nombre, acepta_bases')
      .eq('id', user.id)
      .single()

    if (!profile?.nombre || !profile.acepta_bases) {
      const url = request.nextUrl.clone()
      url.pathname = '/completar-perfil'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  if ((pathname === '/login' || pathname === '/registro') && user) {
    const url = request.nextUrl.clone()
    url.pathname = request.nextUrl.searchParams.get('redirect') || '/participar'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
