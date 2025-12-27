import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from './env.config';
import { User } from '../modules/user/model';
import { Exercise } from '../modules/exercise/model';
import {
  Program,
  ProgramExercise,
  UserProgram,
} from '../modules/program/model';
import {
  WorkoutSession,
  SessionExercise,
  SessionSet,
} from '../modules/session/model';
import { FileEntity } from '../modules/files/model';
import { SystemLog } from '../modules/system-logs/model';
import {
  Tutorial,
  TutorialExercise,
  TutorialMuscleGroup,
  TutorialMedia,
} from '../modules/tutorial/model';

const envConfig = config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: envConfig.database.host,
  port: envConfig.database.port,
  username: envConfig.database.username,
  password: envConfig.database.password,
  database: envConfig.database.database,
  entities: [
    User,
    Exercise,
    Program,
    ProgramExercise,
    UserProgram,
    WorkoutSession,
    SessionExercise,
    SessionSet,
    FileEntity,
    SystemLog,
    Tutorial,
    TutorialExercise,
    TutorialMuscleGroup,
    TutorialMedia,
  ],
  synchronize: envConfig.nodeEnv === 'development', // Only for development
  logging: envConfig.nodeEnv === 'development',
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: false,
};
