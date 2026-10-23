import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AsignarCamaDto {
  @ApiProperty({ description: 'Id del paciente (módulo Admisiones)' })
  @IsUUID()
  pacienteId: string;
}
