import { StoredUser } from '../../src/model/user_store_model';
import { User } from '../../src/proto/types';

function makeMockUserStorage() {
  return {
    addUser: jest.fn(),
    removeUser: jest.fn(),
    replaceUser: jest.fn(),
    getUser: jest.fn(),
    getUserByUsername: jest.fn(),
    getAllUsers: jest.fn(),
  };
}

function makeTestUser(userId: number, username: string, nickname: string): User {
  return {
    userId,
    username,
    nickname,
  };
}

function makeStoredUser(
  userId: number,
  username: string,
  nickname: string,
  password: string,
): StoredUser {
  return {
    userId,
    username,
    nickname,
    password,
  };
}

const testData = {
  testUserId1: 10,
  testUsername1: 'User@email.com',
  testNickname1: 'Johnny Ong',
  testPassword1: 'password',

  testUserId2: 20,
  testUsername2: 'User2@email.com',
  testNickname2: 'Thomas Ong',
  testPassword2: 'Password2',
};

export {
  makeMockUserStorage,
  makeTestUser,
  makeStoredUser,
  testData,
};
