import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'I Concurso Fotográfico de Mairena del Alcor | Día Internacional del Turismo',
  description:
    'Participa en el I Concurso Fotográfico de Mairena del Alcor con motivo del Día Internacional del Turismo. Sube tu foto, descubre las bases y consulta la galería de resultados.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
