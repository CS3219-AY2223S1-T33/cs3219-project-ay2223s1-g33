import { GetUserRequest, GetUserResponse } from '../../../src/proto/user-crud-service';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import {
  makeMockAuthAgent,
  makeMockHashAgent,
  makeMockLoopbackChannel,
  makeTestPasswordUser,
  makeTestUser,
  testData,
} from '../test_util';
import { LoginErrorCode, LoginRequest } from '../../../src/proto/user-service';
import LoginHandler from '../../../src/controller/user_service_handlers/login_handler';
import { TokenPair } from '../../../src/auth/authentication_agent_types';

describe('Login Handler', () => {
  const {
    testUserId1,
    testUsername1,
    testNickname1,
    testPassword1,
  } = testData;

  const makeRequest = (username: string, password: string):
  ApiRequest<LoginRequest> => {
    const req: ApiRequest<LoginRequest> = {
      request: {
        credentials: {
          username,
          password,
        },
      },
      headers: {},
    };
    return req;
  };

  test('Successful Login', async () => {
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();
    const userCrudClient = makeMockLoopbackChannel();

    const handler = new LoginHandler(userCrudClient, authAgent, hashAgent);
    userCrudClient.callRoute.mockImplementationOnce((route: string, request: GetUserRequest):
    GetUserResponse => {
      expect(route).toBe('getUser');
      expect(request.user!.username).toBe(testUsername1.toLowerCase());

      return {
        user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
        errorMessage: '',
      };
    });
    hashAgent.validatePassword.mockImplementationOnce(() => Promise.resolve(true));
    authAgent.createToken.mockImplementationOnce((): Promise<TokenPair> => Promise.resolve({
      sessionToken: 'aa',
      refreshToken: 'b',
    }));

    const request = makeRequest(testUsername1, testPassword1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.errorCode).toBe(LoginErrorCode.LOGIN_ERROR_NONE);
    expect(response.response.user).toStrictEqual(
      makeTestUser(testUserId1, testUsername1, testNickname1),
    );
    expect('Set-Cookie' in response.headers).toBeTruthy();
    expect(hashAgent.validatePassword.mock.calls.length).toBe(1);
  });

  test('Failed Login', async () => {
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();
    const userCrudClient = makeMockLoopbackChannel();

    const handler = new LoginHandler(userCrudClient, authAgent, hashAgent);
    userCrudClient.callRoute.mockImplementationOnce((route: string, request: GetUserRequest):
    GetUserResponse => {
      expect(route).toBe('getUser');
      expect(request.user!.username).toBe(testUsername1.toLowerCase());

      return {
        user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
        errorMessage: '',
      };
    }).mockImplementationOnce((route: string, request: GetUserRequest):
    GetUserResponse => {
      expect(route).toBe('getUser');
      expect(request.user!.username).toBe(testUsername1.toLowerCase());

      return {
        user: undefined,
        errorMessage: '',
      };
    });
    hashAgent.validatePassword.mockImplementationOnce(() => Promise.resolve(false));

    let request = makeRequest(testUsername1, testPassword1);
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LoginErrorCode.LOGIN_ERROR_INVALID_CREDENTIALS);
    expect(response.response.user).toBeUndefined();
    expect(hashAgent.validatePassword.mock.calls.length).toBe(1);

    request = makeRequest(testUsername1, testPassword1);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LoginErrorCode.LOGIN_ERROR_INVALID_CREDENTIALS);
    expect(response.response.user).toBeUndefined();
    expect(hashAgent.validatePassword.mock.calls.length).toBe(1);
  });

  test('Bad Request', async () => {
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();
    const userCrudClient = makeMockLoopbackChannel();

    const handler = new LoginHandler(userCrudClient, authAgent, hashAgent);

    let request = makeRequest(testUsername1, '');
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LoginErrorCode.LOGIN_ERROR_BAD_REQUEST);
    expect(response.response.user).toBeUndefined();

    request = makeRequest('', testPassword1);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LoginErrorCode.LOGIN_ERROR_BAD_REQUEST);
    expect(response.response.user).toBeUndefined();

    request = makeRequest('notemail', testPassword1);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LoginErrorCode.LOGIN_ERROR_BAD_REQUEST);
    expect(response.response.user).toBeUndefined();
  });

  test('Bad Downstream Request', async () => {
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();
    const userCrudClient = makeMockLoopbackChannel();

    const handler = new LoginHandler(userCrudClient, authAgent, hashAgent);
    userCrudClient.callRoute.mockImplementationOnce((route: string, request: GetUserRequest):
    GetUserResponse => {
      expect(route).toBe('getUser');
      expect(request.user!.username).toBe(testUsername1.toLowerCase());

      return {
        user: undefined,
        errorMessage: 'Error',
      };
    }).mockImplementationOnce(() => {
      throw new Error('Cannot connect downstream');
    });

    const request = makeRequest(testUsername1, testPassword1);
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LoginErrorCode.LOGIN_ERROR_INTERNAL_ERROR);
    expect(response.response.user).toBeUndefined();

    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LoginErrorCode.LOGIN_ERROR_INTERNAL_ERROR);
    expect(response.response.user).toBeUndefined();

    expect(hashAgent.validatePassword.mock.calls.length).toBe(0);
  });

  test('Bad downstream session', async () => {
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();
    const userCrudClient = makeMockLoopbackChannel();

    const handler = new LoginHandler(userCrudClient, authAgent, hashAgent);
    userCrudClient.callRoute.mockImplementationOnce((route: string, request: GetUserRequest):
    GetUserResponse => {
      expect(route).toBe('getUser');
      expect(request.user!.username).toBe(testUsername1.toLowerCase());

      return {
        user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
        errorMessage: '',
      };
    });
    hashAgent.validatePassword.mockImplementationOnce(() => Promise.resolve(true));
    authAgent.createToken.mockImplementationOnce((): Promise<TokenPair> => { throw new Error('Test Error'); });

    const request = makeRequest(testUsername1, testPassword1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LoginErrorCode.LOGIN_ERROR_INTERNAL_ERROR);
  });
});
