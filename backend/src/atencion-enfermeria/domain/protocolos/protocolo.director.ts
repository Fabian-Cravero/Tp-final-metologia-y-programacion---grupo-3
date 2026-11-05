import { DomainException } from '../../../shared/exceptions/domain.exception';
import { type PlanProtocolo, ProtocoloBuilder } from './protocolo.builder';

export enum MotivoIngreso {
  PRE_OPERATORIO = 'pre_operatorio',
  RESPIRATORIO = 'respiratorio',
}

/** Director: una receta por motivo. Agregar un motivo nuevo es agregar un método. Contenido de ejemplo para el TP. */
export class ProtocoloDirector {
  preOperatorio(): PlanProtocolo {
    return new ProtocoloBuilder()
      .conMotivo(MotivoIngreso.PRE_OPERATORIO)
      .agregarTarea('Verificar ayuno de al menos 8 horas')
      .agregarTarea('Confirmar consentimiento informado firmado')
      .agregarTarea('Controlar signos vitales basales')
      .agregarTarea('Retirar prótesis, joyas y esmalte de uñas')
      .agregarTarea('Realizar higiene y preparación de la zona quirúrgica')
      .agregarTarea('Canalizar vía periférica')
      .agregarTarea('Administrar la premedicación indicada')
      .build();
  }

  respiratorio(): PlanProtocolo {
    return new ProtocoloBuilder()
      .conMotivo(MotivoIngreso.RESPIRATORIO)
      .agregarTarea('Controlar saturación de oxígeno y frecuencia respiratoria')
      .agregarTarea('Colocar al paciente en posición semisentada')
      .agregarTarea('Administrar oxigenoterapia según indicación')
      .agregarTarea('Realizar nebulización indicada')
      .agregarTarea('Enseñar técnica de tos asistida')
      .agregarTarea('Registrar la evolución respiratoria cada 4 horas')
      .build();
  }

  construir(motivo: string): PlanProtocolo {
    switch (motivo) {
      case MotivoIngreso.PRE_OPERATORIO: return this.preOperatorio();
      case MotivoIngreso.RESPIRATORIO: return this.respiratorio();
      default: throw new DomainException(`No hay protocolo definido para "${motivo}"`);
    }
  }
}
