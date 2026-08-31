import { SiteHeader } from '@/shared/components/SiteHeader'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
