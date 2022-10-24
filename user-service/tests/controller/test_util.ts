import { handleUnaryCall } from '@grpc/grpc-js';
import { LoopbackRouteHandler, LoopbackServiceClient } from '../../src/api_server/loopback_server_types';
import { UserEntity } from '../../src/db';
import StoredResetToken from '../../src/model/reset_token_model';
import StoredUser from '../../src/model/user_store_model';
import { PasswordResetToken, PasswordUser, User } from '../../src/proto/types';
import {
  CreateResetTokenRequest,
  CreateResetTokenResponse,
  CreateUserRequest,
  CreateUserResponse,
  DeleteResetTokenRequest,
  DeleteResetTokenResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  EditUserRequest,
  EditUserResponse,
  GetResetTokensRequest,
  GetResetTokensResponse,
  GetUserRequest,
  GetUserResponse,
} from '../../src/proto/user-crud-service';
import { IUserCrudService } from '../../src/proto/user-crud-service.grpc-server';

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

function makeMockTokenStorage() {
  return {
    addResetToken: jest.fn(),
    removeResetToken: jest.fn(),
    getToken: jest.fn(),
    getTokensByUsername: jest.fn(),
  };
}

function makeMockAuthAgent() {
  return {
    createToken: jest.fn(),
    invalidateToken: jest.fn(),
    invalidateTokensBeforeTime: jest.fn(),
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

function forceCast<T extends object, U extends object>(object: any):
LoopbackRouteHandler<handleUnaryCall<T, U>> {
  return object as LoopbackRouteHandler<handleUnaryCall<T, U>>;
}

function makeMockUserCrudLoopbackChannel() {
  const mock = {
    getUser: jest.fn(),
    editUser: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    getResetTokens: jest.fn(),
    deleteResetToken: jest.fn(),
    createResetToken: jest.fn(),
  };

  return {
    userCrudClient: {
      client: {
        getUser: forceCast<GetUserRequest, GetUserResponse>(mock.getUser),
        editUser: forceCast<EditUserRequest, EditUserResponse>(mock.editUser),
        createUser: forceCast<CreateUserRequest, CreateUserResponse>(mock.createUser),
        deleteUser: forceCast<DeleteUserRequest, DeleteUserResponse>(mock.deleteUser),
        getResetTokens: forceCast<GetResetTokensRequest, GetResetTokensResponse>(
          mock.getResetTokens,
        ),
        deleteResetToken: forceCast<DeleteResetTokenRequest, DeleteResetTokenResponse>(
          mock.deleteResetToken,
        ),
        createResetToken: forceCast<CreateResetTokenRequest, CreateResetTokenResponse>(
          mock.createResetToken,
        ),
      } as LoopbackServiceClient<IUserCrudService>,
    },
    mockCrudLoopback: mock,
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

function makeTestResetToken(token: string, userId: number, expiresAt: number): PasswordResetToken {
  return {
    token,
    userId,
    expiresAt,
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

function makeStoredToken(
  token: string,
  user: StoredUser,
  expiresAt: Date,
): StoredResetToken {
  const userEntity: UserEntity = {
    isActive: true,
    ...user,
  };

  return {
    token,
    user: userEntity,
    expiresAt,
  };
}

function makeMockEmailSender() {
  return {
    sendResetEmail: jest.fn(),
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

  testTokenString1: 'TOKENA',
  testTokenString2: 'TOKENB',
  testTokenString3: 'TOKENC',
};

function makeRedisStreamProducer() {
  return {
    pushMessage: jest.fn(),
  };
}

export {
  makeMockUserStorage,
  makeMockTokenStorage,
  makeMockAuthAgent,
  makeMockHashAgent,
  makeMockUserCrudService,
  makeMockUserCrudLoopbackChannel,
  makeTestUser,
  makeTestPasswordUser,
  makeStoredUser,
  makeRedisStreamProducer,
  testData,
  makeStoredToken,
  makeMockEmailSender,
  makeTestResetToken,
};
