import CreateUserHandler from '../../../src/controller/user_crud_service_handlers/create_user_handler';
import { CreateUserRequest } from '../../../src/proto/user-crud-service';
import { IStorage } from '../../../src/storage/storage';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import { User } from '../../../src/proto/types';
import {
  makeMockUserStorage,
  makeStoredUser,
  makeTestUser,
  testData,
} from '../test_util';

describe('Create User Handler', () => {
  const { testUsername1, testNickname1, testPassword1 } = testData;

  const makeRequest = (user: (User | undefined), password: string):
  ApiRequest<CreateUserRequest> => ({
    request: {
      user: {
        userInfo: user,
        password,
      },
    },
    headers: {},
  });

  test('Successful User Creation', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
    };

    const storedUserResult = makeStoredUser(10, testUsername1, testNickname1, testPassword1);

    mockStore.addUser.mockReturnValue(Promise.resolve(storedUserResult));
    const handler = new CreateUserHandler(storage);

    const request = makeRequest(makeTestUser(0, testUsername1, testNickname1), testPassword1);
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

    const storedUserResult = makeStoredUser(10, testUsername1, testNickname1, testPassword1);
    mockStore.addUser.mockReturnValue(Promise.resolve(storedUserResult));
    const handler = new CreateUserHandler(storage);

    let request = makeRequest(makeTestUser(0, testUsername1, ''), testPassword1);
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(0);

    request = makeRequest(makeTestUser(0, '', testNickname1), testPassword1);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(0);

    request = makeRequest(makeTestUser(0, testUsername1, testNickname1), '');
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(0);

    request.request.user!.password = testPassword1;
    request.request.user!.userInfo = undefined;
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(0);

    request = makeRequest(undefined, testPassword1);
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

    const request = makeRequest(makeTestUser(0, testUsername1, testNickname1), testPassword1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.addUser.mock.calls.length).toBe(1);
  });
});
