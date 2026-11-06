/** Los mismos valores que RolUsuario del backend. */
export type Rol = 'admin' | 'medico' | 'enfermero' | 'recepcionista' | 'paciente';

export const ROLES = {
  ADMIN: 'admin',
  MEDICO: 'medico',
  ENFERMERO: 'enfermero',
  RECEPCIONISTA: 'recepcionista',
  PACIENTE: 'paciente',
} as const satisfies Record<string, Rol>;

export const NOMBRE_ROL: Record<Rol, string> = {
  admin: 'Administración',
  medico: 'Médico',
  enfermero: 'Enfermería',
  recepcionista: 'Recepción',
  paciente: 'Paciente',
};

/** Personal del hospital: todos menos el paciente. */
export const PERSONAL: Rol[] = [ROLES.ADMIN, ROLES.MEDICO, ROLES.ENFERMERO, ROLES.RECEPCIONISTA];
