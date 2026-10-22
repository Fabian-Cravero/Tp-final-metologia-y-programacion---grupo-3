import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgregarAColaUseCase } from './application/agregar-a-cola.use-case';
import { AtenderTurnoUseCase } from './application/atender-turno.use-case';
import { BuscarPacientesUseCase } from './application/buscar-pacientes.use-case';
import { CancelarTurnoUseCase } from './application/cancelar-turno.use-case';
import { ConfirmarTurnoUseCase } from './application/confirmar-turno.use-case';
import { ListarAgendaUseCase } from './application/listar-agenda.use-case';
import { ListarColaUseCase } from './application/listar-cola.use-case';
import { ListarMedicosUseCase } from './application/listar-medicos.use-case';
import { LlamarSiguienteUseCase } from './application/llamar-siguiente.use-case';
import { RegistrarLlegadaUseCase } from './application/registrar-llegada.use-case';
import { RegistrarMedicoUseCase } from './application/registrar-medico.use-case';
import { RegistrarPacienteUseCase } from './application/registrar-paciente.use-case';
import { ReservarTurnoUseCase } from './application/reservar-turno.use-case';
import { entidadesAdmisiones } from './domain/entities';
import { COLA_REPOSITORY } from './domain/repositories/cola-repository.interface';
import { MEDICO_REPOSITORY } from './domain/repositories/medico-repository.interface';
import { PACIENTE_REPOSITORY } from './domain/repositories/paciente-repository.interface';
import { TURNO_REPOSITORY } from './domain/repositories/turno-repository.interface';
import { TypeOrmColaRepository } from './infrastructure/repositories/typeorm-cola.repository';
import { TypeOrmMedicoRepository } from './infrastructure/repositories/typeorm-medico.repository';
import { TypeOrmPacienteRepository } from './infrastructure/repositories/typeorm-paciente.repository';
import { TypeOrmTurnoRepository } from './infrastructure/repositories/typeorm-turno.repository';
import { AdmisionesController } from './presentation/admisiones.controller';
import { ColaController } from './presentation/cola.controller';
import { MedicosController } from './presentation/medicos.controller';
import { PacientesController } from './presentation/pacientes.controller';
import { TurnosController } from './presentation/turnos.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entidadesAdmisiones)],
  controllers: [
    AdmisionesController,
    PacientesController,
    MedicosController,
    TurnosController,
    ColaController,
  ],
  providers: [
    { provide: PACIENTE_REPOSITORY, useClass: TypeOrmPacienteRepository },
    { provide: MEDICO_REPOSITORY, useClass: TypeOrmMedicoRepository },
    { provide: TURNO_REPOSITORY, useClass: TypeOrmTurnoRepository },
    { provide: COLA_REPOSITORY, useClass: TypeOrmColaRepository },
    RegistrarPacienteUseCase,
    BuscarPacientesUseCase,
    RegistrarMedicoUseCase,
    ListarMedicosUseCase,
    ReservarTurnoUseCase,
    ConfirmarTurnoUseCase,
    RegistrarLlegadaUseCase,
    AtenderTurnoUseCase,
    CancelarTurnoUseCase,
    ListarAgendaUseCase,
    AgregarAColaUseCase,
    ListarColaUseCase,
    LlamarSiguienteUseCase,
  ],
  exports: [PACIENTE_REPOSITORY, MEDICO_REPOSITORY, TURNO_REPOSITORY],
})
export class AdmisionesModule {}
