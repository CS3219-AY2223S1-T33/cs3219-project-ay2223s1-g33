import { IDatabase } from '../db';
import ResetTokenStore from './reset_token_store';
import { IStorage } from './storage';
import UserStore from './user_store';

class AppStorage implements IStorage {
  userStore: UserStore;

  resetTokenStore: ResetTokenStore;

  constructor(dbConn: IDatabase) {
    this.userStore = new UserStore(dbConn);
    this.resetTokenStore = new ResetTokenStore(dbConn);
  }

  getUserStore(): UserStore {
    return this.userStore;
  }

  getResetTokenStore(): ResetTokenStore {
    return this.resetTokenStore;
  }
}

export default AppStorage;
