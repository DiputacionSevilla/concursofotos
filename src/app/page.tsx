import { createClient } from '@/lib/supabase/server'
import { getContestConfig } from '@/features/contest-info/services/get-contest-config'
import { ContestHero } from '@/features/contest-info/components/ContestHero'
import { BasesSection } from '@/features/contest-info/components/BasesSection'
import { CronogramaSection } from '@/features/contest-info/components/CronogramaSection'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const config = await getContestConfig()

  return (
    <main className="min-h-screen">
      <ContestHero isAuthenticated={!!user} />
      <BasesSection config={config} />
      <CronogramaSection config={config} />
    </main>
  )
}
