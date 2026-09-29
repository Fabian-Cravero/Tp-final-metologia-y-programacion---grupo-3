import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Config de conexión a PostgreSQL para TypeORM.
 *
 * ConfigService.get() siempre devuelve las variables de entorno como string
 * (así las expone process.env), así que todo lo que no sea texto se castea
 * a mano acá en vez de confiar en el generic <T> de .get(), que NO convierte
 * el valor real - solo tipa el retorno para TypeScript.
 */
export function typeOrmConfig(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: Number(config.get<string>('DB_PORT', '5432')),
    username: config.get<string>('DB_USERNAME', 'postgres'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_NAME', 'HospitalHIS'),
    autoLoadEntities: true,
    // TEMPORAL: true mientras arrancamos (crea las tablas solas a partir de las entities).
    // Antes de trabajar en equipo / tener datos reales hay que pasar a migraciones y dejarlo en false
    // (ver sección 12 del informe) - si no, cualquiera puede borrar el trabajo de otro sin darse cuenta.
    synchronize: true,
    migrations: ['dist/migrations/*.js'],
  };
}
