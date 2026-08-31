import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/features/auth/components/LogoutButton'

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/escudo-mairena.png"
            alt="Escudo de Mairena del Alcor"
            width={33}
            height={40}
            className="h-[40px] w-[33px]"
          />
          <span className="font-display text-sm font-semibold leading-tight text-stone-900 sm:text-base">
            Concurso Fotográfico
            <span className="block text-xs font-normal text-terracotta-600">Mairena del Alcor</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          <Link href="/#bases" className="hidden text-stone-600 hover:text-terracotta-700 sm:inline">
            Bases
          </Link>
          <Link href="/galeria" className="text-stone-600 hover:text-terracotta-700">
            Galería
          </Link>
          <Link href="/ganadores" className="text-stone-600 hover:text-terracotta-700">
            Ganadores
          </Link>
          {user && (
            <Link href="/participar" className="text-stone-600 hover:text-terracotta-700">
              Mi foto
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-stone-600 hover:text-terracotta-700">
              Admin
            </Link>
          )}
          {user ? (
            <LogoutButton />
          ) : (
            <Link href="/login" className="btn-primary px-3.5 py-2 text-xs sm:text-sm">
              Acceder
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
