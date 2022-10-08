import { IDatabase } from '../db';
import { IStorage } from './storage';
import UserStore from './user_store';

class AppStorage implements IStorage {
  userStore: UserStore;

  constructor(dbConn: IDatabase) {
    this.userStore = new UserStore(dbConn);
  }

  getUserStore(): UserStore {
    return this.userStore;
  }
}

export default AppStorage;
