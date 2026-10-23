import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CrearCamaDto {
  @ApiProperty({ example: 'A-101' }) @IsString() @IsNotEmpty() codigo: string;
  @ApiProperty({ example: 'Clínica médica' }) @IsString() @IsNotEmpty() sector: string;
}
