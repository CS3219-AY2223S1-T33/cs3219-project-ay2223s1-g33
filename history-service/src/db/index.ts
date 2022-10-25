import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';

import HistoryEntity from './history_entity';
import HistoryOwnerEntity from './history_owner_entity';
import Logger from '../utils/logger';
import HistoryCompletionEntity from './history_completion_entity';

type DataSourceConfig = {
  readonly DATABASE_DBHOST: string,
  readonly DATABASE_USERNAME: string,
  readonly DATABASE_PASSWORD: string,
  readonly DATABASE_NAME: string,
};

interface IDatabase {
  getDataSource(): DataSource;
  getHistoryRepo(): Repository<HistoryEntity>;
  getHistoryOwnerRepo(): Repository<HistoryOwnerEntity>;
  getHistoryCompletionRepo(): Repository<HistoryCompletionEntity>;
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

  getHistoryRepo(): Repository<HistoryEntity> {
    return this.dataSource.getRepository(HistoryEntity);
  }

  getHistoryOwnerRepo(): Repository<HistoryOwnerEntity> {
    return this.dataSource.getRepository(HistoryOwnerEntity);
  }

  getHistoryCompletionRepo(): Repository<HistoryCompletionEntity> {
    return this.dataSource.getRepository(HistoryCompletionEntity);
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
        HistoryEntity,
        HistoryOwnerEntity,
        HistoryCompletionEntity,
      ],
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
  DataSourceConfig,
  IDatabase,
  connectDatabase,
};
