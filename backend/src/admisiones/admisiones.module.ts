import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgregarAColaUseCase } from './application/agregar-a-cola.use-case';
import { AgregarAListaEsperaUseCase } from './application/agregar-a-lista-espera.use-case';
import { AtenderTurnoUseCase } from './application/atender-turno.use-case';
import { BuscarPacientesUseCase } from './application/buscar-pacientes.use-case';
import { CancelarTurnoUseCase } from './application/cancelar-turno.use-case';
import { ConfirmarTurnoUseCase } from './application/confirmar-turno.use-case';
import { InsertarEntreturnoUseCase } from './application/insertar-entreturno.use-case';
import { ListarAgendaUseCase } from './application/listar-agenda.use-case';
import { ListarColaUseCase } from './application/listar-cola.use-case';
import { ListarListaEsperaUseCase } from './application/listar-lista-espera.use-case';
import { ListarMedicosUseCase } from './application/listar-medicos.use-case';
import { LlamarSiguienteUseCase } from './application/llamar-siguiente.use-case';
import { MarcarAvisadoUseCase } from './application/marcar-avisado.use-case';
import { PromoverDesdeListaEsperaUseCase } from './application/promover-desde-lista-espera.use-case';
import { RegistrarLlegadaUseCase } from './application/registrar-llegada.use-case';
import { RegistrarMedicoUseCase } from './application/registrar-medico.use-case';
import { RegistrarPacienteUseCase } from './application/registrar-paciente.use-case';
import { ReservarTurnoUseCase } from './application/reservar-turno.use-case';
import { entidadesAdmisiones } from './domain/entities';
import { COLA_REPOSITORY } from './domain/repositories/cola-repository.interface';
import { LISTA_ESPERA_REPOSITORY } from './domain/repositories/lista-espera-repository.interface';
import { MEDICO_REPOSITORY } from './domain/repositories/medico-repository.interface';
import { PACIENTE_REPOSITORY } from './domain/repositories/paciente-repository.interface';
import { TURNO_REPOSITORY } from './domain/repositories/turno-repository.interface';
import { TurnoCanceladoListener } from './infrastructure/listeners/turno-cancelado.listener';
import { TypeOrmColaRepository } from './infrastructure/repositories/typeorm-cola.repository';
import { TypeOrmListaEsperaRepository } from './infrastructure/repositories/typeorm-lista-espera.repository';
import { TypeOrmMedicoRepository } from './infrastructure/repositories/typeorm-medico.repository';
import { TypeOrmPacienteRepository } from './infrastructure/repositories/typeorm-paciente.repository';
import { TypeOrmTurnoRepository } from './infrastructure/repositories/typeorm-turno.repository';
import { AdmisionesController } from './presentation/admisiones.controller';
import { ColaController } from './presentation/cola.controller';
import { ListaEsperaController } from './presentation/lista-espera.controller';
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
    ListaEsperaController,
  ],
  providers: [
    { provide: PACIENTE_REPOSITORY, useClass: TypeOrmPacienteRepository },
    { provide: MEDICO_REPOSITORY, useClass: TypeOrmMedicoRepository },
    { provide: TURNO_REPOSITORY, useClass: TypeOrmTurnoRepository },
    { provide: COLA_REPOSITORY, useClass: TypeOrmColaRepository },
    { provide: LISTA_ESPERA_REPOSITORY, useClass: TypeOrmListaEsperaRepository },
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
    // HU 1.2 y HU 1.3
    InsertarEntreturnoUseCase,
    AgregarAListaEsperaUseCase,
    ListarListaEsperaUseCase,
    MarcarAvisadoUseCase,
    PromoverDesdeListaEsperaUseCase,
    TurnoCanceladoListener,
  ],
  exports: [PACIENTE_REPOSITORY, MEDICO_REPOSITORY, TURNO_REPOSITORY],
})
export class AdmisionesModule {}
