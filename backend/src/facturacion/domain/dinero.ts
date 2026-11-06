/**
 * El dinero se maneja en centavos enteros: 0.1 + 0.2 no da 0.3 en JavaScript.
 * Las columnas numeric de Postgres llegan como texto ("1250.50").
 */

/** "1250.50" (o 1250.5) -> 125050 centavos. */
export function aCentavos(valor: string | number): number {
  return Math.round(Number(valor) * 100);
}

/** 125050 centavos -> "1250.50", listo para una columna numeric. */
export function deCentavos(centavos: number): string {
  return (centavos / 100).toFixed(2);
}
