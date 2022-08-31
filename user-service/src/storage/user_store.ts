import { StoredUser } from '../model/user_store_model';
import { IUserStore } from './storage';

class UserStore implements IUserStore {
  idStore: Map<number, StoredUser>;

  usernameStore: Map<string, StoredUser>;

  nextId: number;

  constructor() {
    this.idStore = new Map<number, StoredUser>();
    this.usernameStore = new Map<string, StoredUser>();
    this.nextId = 1;
  }

  addUser(user: StoredUser): StoredUser {
    if (this.usernameStore.has(user.username)) {
      throw new Error('User with same username already exists');
    }

    const userClone = user;

    userClone.userId = this.nextId;
    this.idStore.set(userClone.userId, userClone);
    this.usernameStore.set(userClone.username, userClone);
    this.nextId += 1;

    return userClone;
  }

  removeUser(id: number) {
    if (this.idStore.has(id)) {
      const user: StoredUser = <StoredUser> this.idStore.get(id);
      this.idStore.delete(id);
      this.usernameStore.delete(user.username);
    }
  }

  replaceUser(user: StoredUser) {
    if (user.userId === 0) {
      return;
    }

    if (this.idStore.has(user.userId)) {
      const oldUser: StoredUser = <StoredUser> this.idStore.get(user.userId);
      if (this.usernameStore.has(user.username)
        && this.usernameStore.get(user.username) !== oldUser) {
        throw new Error('User with same username already exists');
      }

      this.usernameStore.delete(oldUser.username);
      this.idStore.set(user.userId, user);
      this.usernameStore.set(user.username, user);
    }
  }

  getUser(id: number): (StoredUser | undefined) {
    if (!this.idStore.has(id)) {
      return undefined;
    }
    return this.idStore.get(id);
  }

  getUserByUsername(username: string): (StoredUser | undefined) {
    if (!this.usernameStore.has(username)) {
      return undefined;
    }
    return this.usernameStore.get(username);
  }

  getAllUsers(): StoredUser[] {
    return Array.from(this.idStore.values());
  }
}

export default UserStore;
