import { IStorage } from './storage';
import UserStore from './user_store';

class AppStorage implements IStorage {
  userStore: UserStore;

  constructor() {
    this.userStore = new UserStore();
  }

  getUserStore(): UserStore {
    return this.userStore;
  }
}

export default AppStorage;
