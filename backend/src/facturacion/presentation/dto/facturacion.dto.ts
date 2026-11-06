import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsNumberString, IsString, IsUUID, Max, Min } from 'class-validator';

export class AgregarCargoDto {
  @ApiProperty({ example: 'Consulta de guardia' }) @IsString() @IsNotEmpty() concepto: string;
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) cantidad: number;

  @ApiProperty({ example: '15000.00', description: 'Se envía como texto, con hasta 2 decimales' })
  @IsNumberString()
  precioUnitario: string;
}

export class CrearCoberturaDto {
  @ApiProperty({ example: 'ART Ejemplo' }) @IsString() @IsNotEmpty() nombre: string;

  @ApiProperty({ example: 'prepaga', description: 'publica | prepaga | particular (otro tipo necesita su estrategia)' })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({ example: 80, description: 'Porcentaje que cubre, de 0 a 100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeCobertura: number;
}

export class AsignarCoberturaDto {
  @ApiProperty({ description: 'Id de una cobertura de GET /facturacion/coberturas' })
  @IsUUID()
  coberturaId: string;
}
