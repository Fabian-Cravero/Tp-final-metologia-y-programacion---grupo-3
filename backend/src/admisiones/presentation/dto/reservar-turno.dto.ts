import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ReservarTurnoDto {
  @ApiProperty() @IsUUID() pacienteId: string;
  @ApiProperty() @IsUUID() medicoId: string;

  @ApiProperty({ example: '2026-11-03T10:30:00-03:00' })
  @Type(() => Date)
  @IsDate()
  fechaHora: Date;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) motivo?: string;
}
