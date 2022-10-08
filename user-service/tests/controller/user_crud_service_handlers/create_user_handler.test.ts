import CreateUserHandler from '../../../src/controller/user_crud_service_handlers/create_user_handler';
import { CreateUserRequest } from '../../../src/proto/user-crud-service';
import { IStorage } from '../../../src/storage/storage';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import { User } from '../../../src/proto/types';
import { StoredUser } from '../../../src/model/user_store_model';
import { makeMockUserStorage, makeTestUser, testData } from '../test_util';

describe('Create User Handler', () => {
  const { testUsername1, testNickname1, testPassword } = testData;

  test('Successful User Creation', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
    };

    const storedUserResult: StoredUser = {
      userId: 10,
      username: testUsername1,
      nickname: testNickname1,
      password: testPassword,
    };

    mockStore.addUser.mockReturnValue(Promise.resolve(storedUserResult));
    const handler = new CreateUserHandler(storage);

    const request: ApiRequest<CreateUserRequest> = {
      request: {
        user: {
          userInfo: makeTestUser(0, testUsername1, testNickname1),
          password: testPassword,
        },
      },
      headers: {},
    };

    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.user!.userInfo!.userId).toBe(10);
    expect(response.response.user!.userInfo!.nickname).toBe(testNickname1);
    expect(response.response.user!.userInfo!.username).toBe(testUsername1);
    expect(mockStore.addUser.mock.calls.length).toBe(1);
  });

  test('Bad Request', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
    };

    const storedUserResult: StoredUser = {
      userId: 10,
      username: testUsername1,
      nickname: testNickname1,
      password: testPassword,
    };

    mockStore.addUser.mockReturnValue(Promise.resolve(storedUserResult));
    const handler = new CreateUserHandler(storage);

    const request: ApiRequest<CreateUserRequest> = {
      request: {
        user: {
          userInfo: {
            userId: 0,
            username: testUsername1,
            nickname: testNickname1,
          } as User,
          password: testPassword,
        },
      },
      headers: {},
    };

    request.request.user!.userInfo!.nickname = '';
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(0);

    request.request.user!.userInfo!.nickname = testNickname1;
    request.request.user!.userInfo!.username = '';
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(0);

    request.request.user!.userInfo!.username = testUsername1;
    request.request.user!.password = '';
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(0);

    request.request.user!.password = testPassword;
    request.request.user!.userInfo = undefined;
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(0);

    request.request.user = undefined;
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(0);
  });

  const testErrorMessage = 'Test Error Message';
  test('Bad Database', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
    };

    mockStore.addUser.mockImplementationOnce(() => { throw new Error(testErrorMessage); });
    const handler = new CreateUserHandler(storage);

    const request: ApiRequest<CreateUserRequest> = {
      request: {
        user: {
          userInfo: makeTestUser(0, testUsername1, testNickname1),
          password: testPassword,
        },
      },
      headers: {},
    };

    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(1);
  });
});
