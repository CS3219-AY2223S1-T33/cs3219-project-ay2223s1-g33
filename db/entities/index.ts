import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import { config } from 'dotenv';

import UserEntity from './User';
import QuestionEntity from './Question';
import HistoryEntity  from './History';
import PasswordResetEntity  from './PasswordReset';

type DataSourceConfig = {
  DATABASE_DBHOST: string,
  DATABASE_USERNAME: string,
  DATABASE_PASSWORD: string,
  DATABASE_NAME: string,
};

interface IDatabase {
  getDataSource(): DataSource;
  getUserRepo(): Repository<UserEntity>;
  getHistoryRepo(): Repository<HistoryEntity>;
  getPasswordRepo(): Repository<PasswordResetEntity>;
  getQuestionRepo(): Repository<QuestionEntity>;
}

function loadEnvironmentConfig(): DataSourceConfig {
  config();
  return {
    DATABASE_DBHOST: process.env.DATABASE_DBHOST!,
    DATABASE_USERNAME: process.env.DATABASE_USERNAME!,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD!,
    DATABASE_NAME: process.env.DATABASE_NAME!,
  };
}

class Database implements IDatabase {
  dbConfig: DataSourceConfig;

  dataSource: DataSource;

  static instance: Database;

  private constructor(dbConfig: DataSourceConfig) {
    this.dbConfig = dbConfig;
    this.dataSource = this.createDataSource();
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  getUserRepo(): Repository<UserEntity> {
    return this.dataSource.getRepository(UserEntity);
  }

  getHistoryRepo(): Repository<HistoryEntity> {
    return this.dataSource.getRepository(HistoryEntity);
  }

  getPasswordRepo(): Repository<PasswordResetEntity> {
    return this.dataSource.getRepository(PasswordResetEntity);
  }

  getQuestionRepo(): Repository<QuestionEntity> {
    return this.dataSource.getRepository(QuestionEntity);
  }

  private createDataSource(): DataSource {
    return new DataSource({
      type: 'postgres',
      host: this.dbConfig.DATABASE_DBHOST,
      port: 5432,
      username: this.dbConfig.DATABASE_USERNAME,
      password: this.dbConfig.DATABASE_PASSWORD,
      database: this.dbConfig.DATABASE_NAME,
      synchronize: false,
      logging: false,
      entities: [UserEntity, QuestionEntity, HistoryEntity, PasswordResetEntity],
      subscribers: [],
      migrations: [],
    });
  }

  async initializeDataSource(): Promise<DataSource> {
    if (!this.dataSource.isInitialized) {
      let dataSource: DataSource;
      try {
        dataSource = await this.dataSource.initialize();
      } catch (err) {
        throw new Error(`[Database] Error during Data Source initialization: ${err}`);
      }

      console.log('[Database] Data Source has been initialized!');
      return dataSource;
    }
    return this.dataSource;
  }

  static getInstance(): Database {
    if (!Database.instance) {
      const dbConfig = loadEnvironmentConfig();
      Database.instance = new Database(dbConfig);
    }
    return Database.instance;
  }
}

Database.getInstance().initializeDataSource();

function getDatabase(): IDatabase {
  return Database.getInstance();
}

export {
  getDatabase,
  UserEntity,
  HistoryEntity,
  QuestionEntity,
  PasswordResetEntity,
};
