import Image from 'next/image'
import Link from 'next/link'

export function ContestHero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative overflow-hidden bg-azulejo-900 px-4 py-20 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 0 L80 40 L40 80 L0 40 Z' fill='none' stroke='white' stroke-width='1.5'/%3E%3Ccircle cx='40' cy='40' r='14' fill='none' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E\")",
          backgroundSize: '80px 80px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-terracotta-500/30 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <Image
          src="/escudo-mairena.png"
          alt="Escudo del Ayuntamiento de Mairena del Alcor"
          width={92}
          height={110}
          priority
          className="mb-6 h-[110px] w-[92px] drop-shadow-lg"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-azulejo-200">
          Ayuntamiento de Mairena del Alcor · Delegación de Turismo
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          I Concurso Fotográfico
          <span className="block text-terracotta-300">Día Internacional del Turismo</span>
        </h1>
        <p className="mt-5 max-w-xl text-balance text-azulejo-100">
          Redescubre Mairena del Alcor a través de tu mirada: paisajes, patrimonio y rincones por
          descubrir. Sube tu foto desde el móvil y forma parte de la galería del concurso.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={isAuthenticated ? '/participar' : '/login'} className="btn-primary px-6 py-3 text-sm">
            {isAuthenticated ? 'Ir a mi foto' : 'Participar ahora'}
          </Link>
          <Link
            href="/galeria"
            className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Ver galería
          </Link>
        </div>
      </div>
    </section>
  )
}
