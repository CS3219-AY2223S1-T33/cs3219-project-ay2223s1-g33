import { StoredUser } from '../../src/model/user_store_model';
import { PasswordUser, User } from '../../src/proto/types';

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

function makeMockAuthAgent() {
  return {
    createToken: jest.fn(),
    invalidateToken: jest.fn(),
  };
}

function makeMockHashAgent() {
  return {
    validatePassword: jest.fn(),
    hashPassword: jest.fn(),
  };
}

function makeMockUserCrudService() {
  return {
    getUser: jest.fn(),
    createUser: jest.fn(),
    editUser: jest.fn(),
    deleteUser: jest.fn(),
  };
}

function makeMockLoopbackChannel() {
  return {
    registerServiceRoutes: jest.fn(),
    callRoute: jest.fn(),
  };
}

function makeTestUser(userId: number, username: string, nickname: string): User {
  return {
    userId,
    username,
    nickname,
  };
}

function makeTestPasswordUser(
  userId: number,
  username: string,
  nickname: string,
  password: string,
): PasswordUser {
  return {
    userInfo: makeTestUser(userId, username, nickname),
    password,
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

function makeRedisStreamProducer() {
  return {
    pushStream: jest.fn(),
  };
}

export {
  makeMockUserStorage,
  makeMockAuthAgent,
  makeMockHashAgent,
  makeMockUserCrudService,
  makeMockLoopbackChannel,
  makeTestUser,
  makeTestPasswordUser,
  makeStoredUser,
  makeRedisStreamProducer,
  testData,
};
