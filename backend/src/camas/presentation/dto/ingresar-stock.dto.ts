import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class IngresarStockDto {
  @ApiProperty({ example: 10 }) @IsInt() @Min(1) cantidad: number;
  @ApiPropertyOptional({ example: 'Depósito central' }) @IsOptional() @IsString() ubicacion?: string;
}
