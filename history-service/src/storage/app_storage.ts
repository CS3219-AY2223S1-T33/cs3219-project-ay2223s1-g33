import { IStorage, IAttemptStore, ICompletedStore } from './storage';
import AttemptStore from './attempt_store';
import { IDatabase } from '../db';
import CompletedStore from './completed_store';

class AppStorage implements IStorage {
  attemptStore: AttemptStore;

  completionStore: CompletedStore;

  constructor(dbConn: IDatabase) {
    this.attemptStore = new AttemptStore(dbConn);
    this.completionStore = new CompletedStore(dbConn);
  }

  getAttemptStore(): IAttemptStore {
    return this.attemptStore;
  }

  getCompletionStore(): ICompletedStore {
    return this.completionStore;
  }
}

export default AppStorage;
