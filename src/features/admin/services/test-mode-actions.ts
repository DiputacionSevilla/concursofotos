'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Interruptor de "modo pruebas": desactiva TODOS los controles de fecha del
// concurso (ventana de subida, visibilidad de galeria, visibilidad de ganadores)
// para poder probar el flujo publico completo sin esperar a las fechas reales.
// La RLS (contest_config_write_admin) es la barrera real; esto solo evita
// llamar la accion sin sesion.
export async function setModoPruebas(enabled: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase.from('contest_config').update({ modo_pruebas: enabled }).eq('id', 1)
  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/participar')
  revalidatePath('/galeria')
  revalidatePath('/ganadores')
}
