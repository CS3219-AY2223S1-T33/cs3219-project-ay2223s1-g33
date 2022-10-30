import { EditUserRequest } from '../../../src/proto/user-crud-service';
import { IStorage } from '../../../src/storage/storage';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import { User } from '../../../src/proto/types';
import { makeMockUserStorage, makeStoredUser, makeTestUser, testData } from '../test_util';
import EditUserHandler from '../../../src/controller/user_crud_service_handlers/edit_user_handler';

describe('Edit User Handler', () => {
  const { testUsername2, testPassword2, testNickname2 } = testData;

  const makeRequest = (user: User | undefined, password: string): ApiRequest<EditUserRequest> => ({
    request: {
      user: {
        userInfo: user,
        password,
      },
    },
    headers: {},
  });

  test('Successful User Modification', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
      getResetTokenStore: jest.fn(),
    };

    const userId = 10;
    const storedUserResult = makeStoredUser(userId, testUsername2, testNickname2, testPassword2);
    mockStore.replaceUser.mockReturnValue(Promise.resolve(storedUserResult));
    const handler = new EditUserHandler(storage);

    const request = makeRequest(makeTestUser(userId, testUsername2, testNickname2), testPassword2);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.user!.userInfo!.userId).toBe(userId);
    expect(response.response.user!.userInfo!.nickname).toBe(testNickname2);
    expect(response.response.user!.userInfo!.username).toBe(testUsername2);
    expect(response.response.user!.password).toBe(testPassword2);

    expect(mockStore.replaceUser.mock.calls.length).toBe(1);
    expect(mockStore.replaceUser.mock.calls[0][0]).toStrictEqual(storedUserResult);
  });

  test('Bad Request', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
      getResetTokenStore: jest.fn(),
    };

    const userId = 10;
    const storedUserResult = makeStoredUser(userId, testUsername2, testNickname2, testPassword2);
    mockStore.replaceUser.mockReturnValue(Promise.resolve(storedUserResult));
    const handler = new EditUserHandler(storage);

    let request = makeRequest(makeTestUser(0, testUsername2, testNickname2), testPassword2);
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.replaceUser.mock.calls.length).toBe(0);

    request = makeRequest(makeTestUser(userId, '', testNickname2), testPassword2);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.replaceUser.mock.calls.length).toBe(0);

    request = makeRequest(makeTestUser(userId, testUsername2, ''), testPassword2);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.replaceUser.mock.calls.length).toBe(0);

    request = makeRequest(makeTestUser(userId, testUsername2, testNickname2), '');
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.replaceUser.mock.calls.length).toBe(0);

    request = makeRequest(undefined, testPassword2);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.replaceUser.mock.calls.length).toBe(0);
  });

  const testErrorMessage = 'Test Error Message';
  test('Bad Database', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
      getResetTokenStore: jest.fn(),
    };

    mockStore.replaceUser.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });
    const handler = new EditUserHandler(storage);

    const request = makeRequest(makeTestUser(10, testUsername2, testNickname2), testPassword2);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(mockStore.replaceUser.mock.calls.length).toBe(1);
  });
});
