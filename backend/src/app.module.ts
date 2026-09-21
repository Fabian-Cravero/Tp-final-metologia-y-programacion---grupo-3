import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './shared/config/typeorm.config';

import { IamModule } from './iam/iam.module';
import { AdmisionesModule } from './admisiones/admisiones.module';
import { HistoriaClinicaModule } from './historia-clinica/historia-clinica.module';
import { AtencionEnfermeriaModule } from './atencion-enfermeria/atencion-enfermeria.module';
import { CamasModule } from './camas/camas.module';
import { FacturacionModule } from './facturacion/facturacion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    IamModule,
    AdmisionesModule,
    HistoriaClinicaModule,
    AtencionEnfermeriaModule,
    CamasModule,
    FacturacionModule,
  ],
})
export class AppModule {}
