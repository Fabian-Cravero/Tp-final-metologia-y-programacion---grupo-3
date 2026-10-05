import { RolUsuario } from './rol.enum';

describe('RolUsuario', () => {
  it('define los cinco roles del sistema con su valor en minúsculas', () => {
    expect(RolUsuario).toEqual({
      ADMIN: 'admin',
      MEDICO: 'medico',
      ENFERMERO: 'enfermero',
      RECEPCIONISTA: 'recepcionista',
      PACIENTE: 'paciente',
    });
  });
});
