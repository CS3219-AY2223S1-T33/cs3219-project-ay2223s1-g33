import { GetUserRequest } from '../../../src/proto/user-crud-service';
import { IStorage } from '../../../src/storage/storage';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import { makeMockUserStorage, makeTestUser, testData } from '../test_util';
import GetUserHandler from '../../../src/controller/user_crud_service_handlers/get_user_handler';
import { StoredUser } from '../../../src/model/user_store_model';

describe('Get User Handler', () => {
  const {
    testUserId1,
    testUsername1,
    testNickname1,
    testPassword,
  } = testData;

  test('Successful User GET', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
    };

    const storedUserResult: StoredUser = {
      userId: testUserId1,
      username: testUsername1,
      nickname: testNickname1,
      password: testPassword,
    };

    mockStore.getUser.mockReturnValue(storedUserResult);
    mockStore.getUserByUsername.mockReturnValue(storedUserResult);

    const handler = new GetUserHandler(storage);
    const request: ApiRequest<GetUserRequest> = {
      request: {
        user: makeTestUser(testUserId1, '', ''),
      },
      headers: {},
    };

    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.user!.userInfo?.username).toBe(testUsername1);
    expect(mockStore.getUser.mock.calls.length).toBe(1);
    expect(mockStore.getUserByUsername.mock.calls.length).toBe(0);
    expect(mockStore.getUser.mock.lastCall![0]).toBe(testUserId1);

    request.request.user = makeTestUser(0, testUsername1, '');
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.user!.userInfo?.userId).toBe(testUserId1);
    expect(mockStore.getUser.mock.calls.length).toBe(1);
    expect(mockStore.getUserByUsername.mock.calls.length).toBe(1);
    expect(mockStore.getUserByUsername.mock.lastCall![0]).toBe(testUsername1);
  });

  test('Bad Request', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
    };

    const handler = new GetUserHandler(storage);
    const request: ApiRequest<GetUserRequest> = {
      request: {
        user: makeTestUser(0, '', ''),
      },
      headers: {},
    };

    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();

    request.request.user = makeTestUser(testUserId1, testUsername1, '');
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
  });

  const testErrorMessage = 'Test Error Message';
  test('Bad Database', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
    };

    mockStore.getUser.mockImplementationOnce(() => { throw new Error(testErrorMessage); });
    mockStore.getUserByUsername
      .mockImplementationOnce(() => { throw new Error(testErrorMessage); });

    const handler = new GetUserHandler(storage);
    const request: ApiRequest<GetUserRequest> = {
      request: {
        user: makeTestUser(testUserId1, '', ''),
      },
      headers: {},
    };

    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(mockStore.getUser.mock.calls.length).toBe(1);
    expect(mockStore.getUser.mock.lastCall![0]).toBe(testUserId1);

    request.request.user = makeTestUser(0, testUsername1, '');
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(mockStore.getUserByUsername.mock.calls.length).toBe(1);
    expect(mockStore.getUserByUsername.mock.lastCall![0]).toBe(testUsername1);
  });
});
