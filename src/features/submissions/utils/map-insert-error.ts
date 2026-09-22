export function mapInsertError(message: string): string {
  if (message.includes('maximo de')) return message.replace('maximo', 'máximo')
  if (message.includes('no ha comenzado')) return 'El concurso aún no ha comenzado.'
  if (message.includes('ha finalizado')) return 'El plazo de participación ha finalizado.'
  return message
}
