const fechaHoraAr = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });
const fechaAr = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' });
const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function fechaHora(iso: string | null | undefined): string {
  return iso ? fechaHoraAr.format(new Date(iso)) : '—';
}

/** Una columna date ('1990-05-21') se muestra sin correrse de día por la zona horaria. */
export function fecha(valor: string | null | undefined): string {
  if (!valor) return '—';
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? fechaAr.format(new Date(`${valor}T00:00:00`)) : fechaAr.format(new Date(valor));
}

export function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

/** numeric de Postgres llega como texto: "1250.50" -> "$ 1.250,50". */
export function dinero(valor: string | number | null | undefined): string {
  return pesos.format(Number(valor ?? 0));
}

/** 'en_sala_espera' -> 'en sala espera' */
export function legible(valor: string): string {
  return valor.replaceAll('_', ' ');
}

/** Fecha de hoy como AAAA-MM-DD en hora local. */
export function hoyIso(): string {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}
