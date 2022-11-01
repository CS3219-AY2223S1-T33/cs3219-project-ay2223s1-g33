import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';

import QuestionEntity from './question_entity';
import Logger from '../utils/logger';

type DataSourceConfig = {
  readonly DATABASE_DBHOST: string,
  readonly DATABASE_USERNAME: string,
  readonly DATABASE_PASSWORD: string,
  readonly DATABASE_NAME: string,
};

interface IDatabase {
  getDataSource(): DataSource;
  getQuestionRepo(): Repository<QuestionEntity>;
}

class Database implements IDatabase {
  dbConfig: DataSourceConfig;

  dataSource: DataSource;

  static instance: Database;

  constructor(dbConfig: DataSourceConfig) {
    this.dbConfig = dbConfig;
    this.dataSource = this.createDataSource();
  }

  getDataSource(): DataSource {
    return this.dataSource;
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
      entities: [
        QuestionEntity,
      ],
      subscribers: [],
      migrations: [],
      extra: {
        max: 2,
        idleTimeoutMillis: 60 * 60 * 1000,
        connectionTimeoutMillis: 30 * 1000,
      },
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

      Logger.info('[Database] Data Source has been initialized!');
      return dataSource;
    }
    return this.dataSource;
  }
}

async function connectDatabase(config: DataSourceConfig): Promise<IDatabase> {
  const db = new Database(config);
  await db.initializeDataSource();
  return db;
}

export {
  QuestionEntity,
  DataSourceConfig,
  IDatabase,
  connectDatabase,
};
