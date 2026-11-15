import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, Matches } from 'class-validator';

export class AgregarListaEsperaDto {
  @ApiProperty() @IsUUID() pacienteId: string;
  @ApiProperty() @IsUUID() medicoId: string;

  @ApiProperty({ example: '2026-11-20', description: 'Día buscado, AAAA-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dia tiene que tener el formato AAAA-MM-DD' })
  dia: string;
}
