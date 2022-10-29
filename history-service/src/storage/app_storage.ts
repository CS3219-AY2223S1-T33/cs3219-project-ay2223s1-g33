import { IStorage, IAttemptStore, ICompletionStore } from './storage';
import AttemptStore from './attempt_store';
import { IDatabase } from '../db';
import CompletionStore from './completion_store';

class AppStorage implements IStorage {
  attemptStore: AttemptStore;

  completionStore: CompletionStore;

  constructor(dbConn: IDatabase) {
    this.attemptStore = new AttemptStore(dbConn);
    this.completionStore = new CompletionStore(dbConn);
  }

  getAttemptStore(): IAttemptStore {
    return this.attemptStore;
  }

  getCompletionStore(): ICompletionStore {
    return this.completionStore;
  }
}

export default AppStorage;
