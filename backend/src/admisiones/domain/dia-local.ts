/** Devuelve el día de una fecha en hora local, con formato 'AAAA-MM-DD' (sin pasar por UTC). */
export function diaLocal(fecha: Date): string {
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}
