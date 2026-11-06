import { isAxiosError } from 'axios';

/**
 * Texto para mostrar al usuario. El backend responde { statusCode, message } y,
 * cuando falla la validación de un DTO, message es una lista.
 */
export function mensajeDeError(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor. ¿Está levantado el backend?';
    const mensaje = (error.response.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(mensaje)) return mensaje.join('. ');
    if (mensaje) return mensaje;
    if (error.response.status === 403) return 'Tu usuario no tiene permiso para esta acción.';
    return `Error ${error.response.status}`;
  }
  return error instanceof Error ? error.message : 'Error inesperado';
}
