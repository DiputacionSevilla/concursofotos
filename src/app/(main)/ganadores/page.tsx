import { getWinners } from '@/features/gallery/services/get-winners'
import { WinnersGrid } from '@/features/gallery/components/WinnersGrid'

export default async function GanadoresPage() {
  const { items, visible } = await getWinners()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-stone-900">Ganadores del concurso</h1>
      <p className="mt-1 text-sm text-stone-600">
        Primer premio, y finalistas, de cada categoría y grupo de edad.
      </p>

      {!visible ? (
        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Los ganadores se anunciarán próximamente en esta página y en las redes sociales del
          Ayuntamiento. ¡Vuelve pronto!
        </p>
      ) : (
        <div className="mt-6">
          <WinnersGrid items={items} />
        </div>
      )}
    </div>
  )
}
