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

const testData = {
  testUserId1: 10,
  testUsername1: 'User@email.com',
  testNickname1: 'Johnny Ong',
  testPassword: 'password',
};

export {
  makeMockUserStorage,
  makeTestUser,
  testData,
};
