import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TIPOS_INDICACION } from '../../application/indicar.use-case';
import { MotivoIngreso } from '../../domain/protocolos/protocolo.director';
import { TIPOS_SIGNO_VITAL } from '../../domain/umbrales-signos-vitales';

export class RegistrarSignoVitalDto {
  @ApiProperty({ enum: TIPOS_SIGNO_VITAL, example: 'frecuencia_cardiaca' })
  @IsIn(TIPOS_SIGNO_VITAL)
  tipo: string;

  @ApiProperty({ example: 75 })
  @IsNumber()
  valor: number;
}

export class CrearIndicacionDto {
  @ApiProperty({ enum: TIPOS_INDICACION, example: 'medicacion' })
  @IsIn(TIPOS_INDICACION)
  tipo: string;

  @ApiProperty({ example: 'Paracetamol 1 g cada 8 horas' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiPropertyOptional({ description: 'Solo para medicación: insumo del inventario (módulo Camas)' })
  @IsOptional()
  @IsUUID()
  insumoId?: string;

  @ApiPropertyOptional({ example: 2, description: 'Solo para medicación: unidades a descontar' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;
}

export class IniciarProtocoloDto {
  @ApiProperty({ enum: MotivoIngreso, example: MotivoIngreso.PRE_OPERATORIO })
  @IsEnum(MotivoIngreso)
  motivoIngreso: MotivoIngreso;
}
