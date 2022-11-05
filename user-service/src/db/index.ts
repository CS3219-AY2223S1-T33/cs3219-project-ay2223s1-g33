import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';

import UserEntity from './user_entity';
import PasswordResetEntity from './password_reset_token_entity';
import Logger from '../utils/logger';

type DataSourceConfig = {
  readonly DATABASE_DBHOST: string,
  readonly DATABASE_USERNAME: string,
  readonly DATABASE_PASSWORD: string,
  readonly DATABASE_NAME: string,
};

interface IDatabase {
  getDataSource(): DataSource;
  getUserRepo(): Repository<UserEntity>;
  getPasswordResetTokenRepo(): Repository<PasswordResetEntity>;
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

  getUserRepo(): Repository<UserEntity> {
    return this.dataSource.getRepository(UserEntity);
  }

  getPasswordResetTokenRepo(): Repository<PasswordResetEntity> {
    return this.dataSource.getRepository(PasswordResetEntity);
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
        UserEntity,
        PasswordResetEntity,
      ],
      subscribers: [],
      migrations: [],
      poolSize: 5,
      extra: {
        max: 5,
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
  UserEntity,
  PasswordResetEntity,
  DataSourceConfig,
  IDatabase,
  connectDatabase,
};
