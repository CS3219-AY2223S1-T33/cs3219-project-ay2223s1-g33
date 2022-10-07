import { IStorage, IAttemptStore } from './storage';
import AttemptStore from './attempt_store';

class AppStorage implements IStorage {
  attemptStore: AttemptStore;

  constructor() {
    this.attemptStore = new AttemptStore();
  }

  getAttemptStore(): IAttemptStore {
    return this.attemptStore;
  }
}

export default AppStorage;
