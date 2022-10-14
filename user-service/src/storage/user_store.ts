/* eslint class-methods-use-this: 0 */
import { IDatabase, UserEntity } from '../db';
import StoredUser from '../model/user_store_model';
import { IUserStore } from './storage';

const returnValues = ['username', 'password', 'nickname'];
class UserStore implements IUserStore {
  private dbConn: IDatabase;

  constructor(dbConn: IDatabase) {
    this.dbConn = dbConn;
  }

  async addUser(user: StoredUser): Promise<StoredUser> {
    const { username, password, nickname } = user;

    const isExist = await this.dbConn
      .getUserRepo()
      .findOneBy({ username });

    if (isExist) {
      throw new Error('User with same username already exists');
    }

    const insertResult: UserEntity = (
      await this.dbConn
        .getDataSource()
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values([{ username, password, nickname }])
        .returning(returnValues)
        .execute()
    ).raw[0];
    const newUser: StoredUser = {
      ...insertResult,
    };

    return newUser;
  }

  async removeUser(userId: number): Promise<void> {
    await this.dbConn
      .getDataSource()
      .createQueryBuilder()
      .delete()
      .from(UserEntity)
      .where('userId = :userId', { userId })
      .execute();
  }

  async replaceUser(user: StoredUser): Promise<void> {
    const {
      userId, username, password, nickname,
    } = user;

    const isExist = await this.dbConn
      .getUserRepo()
      .findOneBy({ username });

    if (isExist) {
      throw new Error('User with same username already exists');
    }

    await this.dbConn
      .getDataSource()
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        username,
        password,
        nickname,
      })
      .where('userId = :userId', { userId })
      .execute();
  }

  async getUser(userId: number): Promise<StoredUser | undefined> {
    const selectResult: UserEntity | null = await this.dbConn
      .getUserRepo()
      .createQueryBuilder('user')
      .where('user.userId = :userId', { userId })
      .getOne();

    if (!selectResult) {
      return undefined;
    }
    const user: StoredUser = {
      ...selectResult,
    };
    return user;
  }

  async getUserByUsername(username: string): Promise<StoredUser | undefined> {
    const selectResult: UserEntity | null = await this.dbConn
      .getUserRepo()
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .getOne();

    if (!selectResult) {
      return undefined;
    }
    const user: StoredUser = {
      ...selectResult,
    };
    return user;
  }

  async getAllUsers(): Promise<StoredUser[]> {
    const selectResult: UserEntity[] = await this.dbConn
      .getUserRepo()
      .createQueryBuilder('user')
      .getMany();

    const storedUser: StoredUser[] = selectResult.map((user) => ({
      ...user,
    }));
    return storedUser;
  }
}

export default UserStore;
