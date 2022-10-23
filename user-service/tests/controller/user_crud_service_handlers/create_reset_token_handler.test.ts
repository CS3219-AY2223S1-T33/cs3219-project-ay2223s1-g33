import CreateResetTokenHandler from '../../../src/controller/user_crud_service_handlers/create_reset_token_handler';
import { CreateResetTokenRequest } from '../../../src/proto/user-crud-service';
import { IStorage } from '../../../src/storage/storage';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import { PasswordResetToken } from '../../../src/proto/types';
import {
  makeMockTokenStorage,
  makeStoredToken,
  makeStoredUser,
  testData,
} from '../test_util';
import { convertStoredResetTokenToResetToken } from '../../../src/model/reset_token_helper';

describe('Create Reset Token Handler', () => {
  const {
    testUsername1,
    testNickname1,
    testPassword1,
    testTokenString1,
  } = testData;

  const makeRequest = (token: (PasswordResetToken | undefined)):
  ApiRequest<CreateResetTokenRequest> => ({
    request: {
      token,
    },
    headers: {},
  });

  const makeResetToken = (token: string, userId: number, expiresAt: number):
  PasswordResetToken => ({
    token,
    userId,
    expiresAt,
  });

  test('Successful Token Creation', async () => {
    const mockStore = makeMockTokenStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(),
      getResetTokenStore: jest.fn(() => mockStore),
    };

    const testDate = new Date();
    const storedUserResult = makeStoredUser(123, testUsername1, testNickname1, testPassword1);
    const storedTokenResult = makeStoredToken(testTokenString1, storedUserResult, testDate);

    mockStore.addResetToken.mockReturnValue(Promise.resolve(storedTokenResult));
    const handler = new CreateResetTokenHandler(storage);

    const request = makeRequest(convertStoredResetTokenToResetToken(storedTokenResult));
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.token!.token).toBe(testTokenString1);
    expect(response.response.token!.userId).toBe(123);
    expect(response.response.token!.expiresAt).toBe(Math.floor(testDate.getTime() / 1000));
    expect(mockStore.addResetToken.mock.calls.length).toBe(1);
  });

  test('Bad Request', async () => {
    const mockStore = makeMockTokenStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(),
      getResetTokenStore: jest.fn(() => mockStore),
    };

    const handler = new CreateResetTokenHandler(storage);
    let request = makeRequest(makeResetToken('', 1, 123));
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.token).toBeUndefined();
    expect(mockStore.addResetToken.mock.calls.length).toBe(0);

    request = makeRequest(makeResetToken(testTokenString1, 0, 123));
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.token).toBeUndefined();
    expect(mockStore.addResetToken.mock.calls.length).toBe(0);

    request = makeRequest(makeResetToken(testTokenString1, 1, 0));
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.token).toBeUndefined();
    expect(mockStore.addResetToken.mock.calls.length).toBe(0);

    request = makeRequest(undefined);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.token).toBeUndefined();
    expect(mockStore.addResetToken.mock.calls.length).toBe(0);
  });

  const testErrorMessage = 'Test Error Message';
  test('Bad Database', async () => {
    const mockStore = makeMockTokenStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(),
      getResetTokenStore: jest.fn(() => mockStore),
    };

    mockStore.addResetToken.mockImplementationOnce(() => { throw new Error(testErrorMessage); });
    const handler = new CreateResetTokenHandler(storage);

    const request = makeRequest(makeResetToken(testTokenString1, 1, 123));
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.token).toBeUndefined();
    expect(mockStore.addResetToken.mock.calls.length).toBe(1);
  });
});
