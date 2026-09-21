import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Config de conexión a SQL Server para TypeORM.
 *
 * ConfigService.get() siempre devuelve las variables de entorno como string
 * (así las expone process.env), así que todo lo que no sea texto se castea
 * a mano acá en vez de confiar en el generic <T> de .get(), que NO convierte
 * el valor real - solo tipa el retorno para TypeScript.
 *
 * encrypt/trustServerCertificate: el contenedor local de SQL Server
 * (docker-compose.yml en la raíz) no tiene un certificado válido, así que sin
 * esto la conexión falla con un error de TLS. En un ambiente real con un
 * certificado propio, esto se ajusta.
 */
export function typeOrmConfig(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mssql',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: Number(config.get<string>('DB_PORT', '1433')),
    username: config.get<string>('DB_USERNAME', 'sa'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_NAME', 'HospitalHIS'),
    options: {
      // OJO: .get<boolean>() no convierte el string "false" a boolean false,
      // solo le miente al tipo. Por eso la comparación explícita con 'true'.
      encrypt: config.get<string>('DB_ENCRYPT', 'false') === 'true',
      trustServerCertificate: true,
    },
    autoLoadEntities: true,
    // NUNCA true en equipo: ver sección 12 del informe (migraciones vs. synchronize).
    synchronize: false,
    migrations: ['dist/migrations/*.js'],
  };
}
