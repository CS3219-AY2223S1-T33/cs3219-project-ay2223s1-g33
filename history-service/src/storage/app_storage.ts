import { IStorage, IAttemptStore } from './storage';
import AttemptStore from './attempt_store';
import { IDatabase } from '../db';

class AppStorage implements IStorage {
  attemptStore: AttemptStore;

  constructor(dbConn: IDatabase) {
    this.attemptStore = new AttemptStore(dbConn);
  }

  getAttemptStore(): IAttemptStore {
    return this.attemptStore;
  }
}

export default AppStorage;
