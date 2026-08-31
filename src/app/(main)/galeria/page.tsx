import { getGallery } from '@/features/gallery/services/get-gallery'
import { GalleryGrid } from '@/features/gallery/components/GalleryGrid'

export default async function GaleriaPage() {
  const { items, visible } = await getGallery()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-stone-900">Galería del concurso</h1>

      {!visible ? (
        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          La galería se publicará cuando el Ayuntamiento cierre el plazo de participación y
          revise las fotos recibidas. ¡Vuelve pronto!
        </p>
      ) : (
        <div className="mt-6">
          <GalleryGrid items={items} />
        </div>
      )}
    </div>
  )
}
