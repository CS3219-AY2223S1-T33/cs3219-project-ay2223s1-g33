import { GetResetTokensRequest } from '../../../src/proto/user-crud-service';
import { IStorage } from '../../../src/storage/storage';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import {
  makeMockTokenStorage,
  makeStoredToken,
  makeStoredUser,
  testData,
} from '../test_util';
import GetResetTokensHandler from '../../../src/controller/user_crud_service_handlers/get_reset_tokens_handler';
import { convertStoredResetTokenToResetToken } from '../../../src/model/reset_token_helper';

describe('Get Reset Token Handler', () => {
  const {
    testUserId1,
    testUsername1,
    testNickname1,
    testPassword1,
    testTokenString1,
  } = testData;

  const makeRequest = (tokenString: string, username: string):
  ApiRequest<GetResetTokensRequest> => ({
    request: {
      tokenString,
      username,
    },
    headers: {},
  });

  test('Successful Token GET', async () => {
    const mockStore = makeMockTokenStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(),
      getResetTokenStore: jest.fn(() => mockStore),
    };

    const testUser = makeStoredUser(
      testUserId1,
      testUsername1,
      testNickname1,
      testPassword1,
    );
    const testDate = new Date();

    const storedToken = makeStoredToken(testTokenString1, testUser, testDate);
    mockStore.getToken.mockReturnValue(storedToken);
    mockStore.getTokensByUsername.mockReturnValue([storedToken, storedToken]);
    const token = convertStoredResetTokenToResetToken(storedToken);

    const handler = new GetResetTokensHandler(storage);
    let request = makeRequest(testTokenString1, '');
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.tokens.length).toBe(1);
    expect(response.response.tokens[0]).toStrictEqual(token);
    expect(mockStore.getToken.mock.calls.length).toBe(1);
    expect(mockStore.getTokensByUsername.mock.calls.length).toBe(0);
    expect(mockStore.getToken.mock.lastCall![0]).toBe(testTokenString1);

    request = makeRequest('', testUsername1);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.tokens.length).toBe(2);
    expect(response.response.tokens[0]).toStrictEqual(token);
    expect(response.response.tokens[1]).toStrictEqual(token);
    expect(mockStore.getToken.mock.calls.length).toBe(1);
    expect(mockStore.getTokensByUsername.mock.calls.length).toBe(1);
    expect(mockStore.getTokensByUsername.mock.lastCall![0]).toBe(testUsername1);
  });

  test('Bad Request', async () => {
    const mockStore = makeMockTokenStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(),
      getResetTokenStore: jest.fn(() => mockStore),
    };

    const handler = new GetResetTokensHandler(storage);
    let request = makeRequest('', '');
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.tokens.length).toBe(0);

    request = makeRequest(testTokenString1, testUsername1);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.tokens.length).toBe(0);
  });

  const testErrorMessage = 'Test Error Message';
  test('Bad Database', async () => {
    const mockStore = makeMockTokenStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(),
      getResetTokenStore: jest.fn(() => mockStore),
    };

    mockStore.getToken.mockImplementationOnce(() => { throw new Error(testErrorMessage); });
    mockStore.getTokensByUsername
      .mockImplementationOnce(() => { throw new Error(testErrorMessage); });

    const handler = new GetResetTokensHandler(storage);
    let request = makeRequest(testTokenString1, '');
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(mockStore.getToken.mock.calls.length).toBe(1);
    expect(mockStore.getToken.mock.lastCall![0]).toBe(testTokenString1);

    request = makeRequest('', testUsername1);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(mockStore.getTokensByUsername.mock.calls.length).toBe(1);
    expect(mockStore.getTokensByUsername.mock.lastCall![0]).toBe(testUsername1);
  });
});
