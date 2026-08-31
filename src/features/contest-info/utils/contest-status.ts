import type { Tables } from '@/shared/types/database'

export function isContestOpen(config: Tables<'contest_config'>, now = new Date()): boolean {
  if (config.modo_pruebas) return true
  if (config.fecha_apertura && now < new Date(config.fecha_apertura)) return false
  if (config.fecha_cierre && now > new Date(config.fecha_cierre)) return false
  return true
}
