import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from './env.config';

const envConfig = config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: envConfig.database.host,
  port: envConfig.database.port,
  username: envConfig.database.username,
  password: envConfig.database.password,
  database: envConfig.database.database,
  entities: [__dirname + '/../**/*.model{.ts,.js}'],
  synchronize: envConfig.nodeEnv === 'development', // Only for development
  logging: envConfig.nodeEnv === 'development',
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: false,
};
