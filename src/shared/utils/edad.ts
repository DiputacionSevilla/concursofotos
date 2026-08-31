export function calcularEdad(fechaNacimiento: string, hoy = new Date()): number {
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const aunNoCumplida =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())
  if (aunNoCumplida) edad -= 1
  return edad
}

export function esMenorDeEdad(fechaNacimiento: string): boolean {
  return calcularEdad(fechaNacimiento) < 18
}

export function grupoEdadLabel(fechaNacimiento: string | null): string {
  if (!fechaNacimiento) return 'Sin especificar'
  return esMenorDeEdad(fechaNacimiento) ? 'Infantil / Juvenil' : 'Adultos'
}
