import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PrioridadTriaje } from '../../domain/cola-prioridad';

export class AgregarColaDto {
  @ApiProperty() @IsUUID() pacienteId: string;
  @ApiProperty() @IsUUID() medicoId: string;

  @ApiPropertyOptional({ enum: PrioridadTriaje, default: PrioridadTriaje.NORMAL })
  @IsOptional()
  @IsEnum(PrioridadTriaje)
  prioridad?: PrioridadTriaje;
}
