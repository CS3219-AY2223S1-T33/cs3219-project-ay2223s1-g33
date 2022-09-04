import 'reflect-metadata';
import { DataSource } from 'typeorm';
import User from './User';
import Question from './Question';
import History from './History';
import PasswordReset from './PasswordReset';

require('dotenv').config();

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_DBHOST!,
  port: 5432,
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  synchronize: true,
  logging: true,
  entities: [User, Question, History, PasswordReset],
  subscribers: [],
  migrations: [],
});

const DB = async () => {
  if (!ds.isInitialized) {
    return ds.initialize();
  }
  return ds;
};

DB()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

const userRepo = () => ds.getRepository(User);
const historyRepo = () => ds.getRepository(History);
const passwordResetRepo = () => ds.getRepository(PasswordReset);
const questionRepo = () => ds.getRepository(Question);

export {
  ds, DB, userRepo, historyRepo, passwordResetRepo, questionRepo,
  User,
  History,
  Question,
  PasswordReset,
};

export * from './Question';
