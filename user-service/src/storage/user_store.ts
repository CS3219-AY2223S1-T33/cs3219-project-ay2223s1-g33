import { User } from '../proto/types';
import { IUserStore } from './storage';

class UserStore implements IUserStore {
  idStore: Map<number, User>;

  usernameStore: Map<string, User>;

  nextId: number;

  constructor() {
    this.idStore = new Map<number, User>();
    this.usernameStore = new Map<string, User>();
    this.nextId = 1;
  }

  addUser(user: User): User {
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
      const user: User = <User> this.idStore.get(id);
      this.idStore.delete(id);
      this.usernameStore.delete(user.username);
    }
  }

  replaceUser(user: User) {
    if (this.usernameStore.has(user.username)) {
      throw new Error('User with same username already exists');
    }

    if (this.idStore.has(user.userId)) {
      const oldUser: User = <User> this.idStore.get(user.userId);
      this.usernameStore.delete(oldUser.username);
      this.idStore.set(user.userId, user);
      this.usernameStore.set(user.username, user);
    }
  }

  getUser(id: number): (User | undefined) {
    if (!this.idStore.has(id)) {
      return undefined;
    }
    return this.idStore.get(id);
  }

  getUserByUsername(username: string): (User | undefined) {
    if (!this.usernameStore.has(username)) {
      return undefined;
    }
    return this.usernameStore.get(username);
  }

  getAllUsers(): User[] {
    return Array.from(this.idStore.values());
  }
}

export default UserStore;
