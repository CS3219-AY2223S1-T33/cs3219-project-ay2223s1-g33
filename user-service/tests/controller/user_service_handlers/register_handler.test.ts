import { CreateUserRequest, CreateUserResponse } from '../../../src/proto/user-crud-service';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import {
  makeMockHashAgent,
  makeMockLoopbackChannel,
  makeTestPasswordUser,
  testData,
} from '../test_util';
import { RegisterErrorCode, RegisterRequest } from '../../../src/proto/user-service';
import RegisterHandler from '../../../src/controller/user_service_handlers/register_handler';

describe('Register Handler', () => {
  const {
    testUserId1,
    testUsername1,
    testNickname1,
    testPassword1,
  } = testData;

  const makeRequest = (username: string, password: string, nickname: string):
  ApiRequest<RegisterRequest> => {
    const req: ApiRequest<RegisterRequest> = {
      request: {
        credentials: {
          username,
          password,
        },
        nickname,
      },
      headers: {},
    };
    return req;
  };

  const testHash1 = 'asdf';

  test('Successful Register', async () => {
    const hashAgent = makeMockHashAgent();
    const userCrudClient = makeMockLoopbackChannel();

    const handler = new RegisterHandler(userCrudClient, hashAgent);
    userCrudClient.callRoute.mockImplementationOnce((route: string, request: CreateUserRequest):
    CreateUserResponse => {
      expect(route).toBe('createUser');
      expect(request.user!.userInfo!.username).toBe(testUsername1.toLowerCase());
      expect(request.user!.userInfo!.nickname).toBe(testNickname1);
      expect(request.user!.password).toBe(testHash1);

      return {
        user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testHash1),
        errorMessage: '',
      };
    });
    hashAgent.hashPassword.mockImplementationOnce(() => Promise.resolve(testHash1));

    const request = makeRequest(testUsername1, testPassword1, testNickname1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.errorCode).toBe(RegisterErrorCode.REGISTER_ERROR_NONE);
  });

  test('Bad Request', async () => {
    const hashAgent = makeMockHashAgent();
    const userCrudClient = makeMockLoopbackChannel();

    const handler = new RegisterHandler(userCrudClient, hashAgent);
    hashAgent.hashPassword.mockImplementationOnce(() => Promise.resolve(testHash1));

    let request = makeRequest('', testPassword1, testNickname1);
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(RegisterErrorCode.REGISTER_ERROR_BAD_REQUEST);
    expect(userCrudClient.callRoute.mock.calls.length).toBe(0);

    request = makeRequest('notemail', testPassword1, testNickname1);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(RegisterErrorCode.REGISTER_ERROR_BAD_REQUEST);
    expect(userCrudClient.callRoute.mock.calls.length).toBe(0);

    request = makeRequest(testUsername1, '', testNickname1);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(RegisterErrorCode.REGISTER_ERROR_BAD_REQUEST);
    expect(userCrudClient.callRoute.mock.calls.length).toBe(0);

    request = makeRequest(testUsername1, testPassword1, '');
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(RegisterErrorCode.REGISTER_ERROR_BAD_REQUEST);
    expect(userCrudClient.callRoute.mock.calls.length).toBe(0);
  });

  test('Username already Exists', async () => {
    const hashAgent = makeMockHashAgent();
    const userCrudClient = makeMockLoopbackChannel();

    const handler = new RegisterHandler(userCrudClient, hashAgent);
    userCrudClient.callRoute.mockImplementationOnce((route: string, request: CreateUserRequest):
    CreateUserResponse => {
      expect(route).toBe('createUser');
      expect(request.user!.userInfo!.username).toBe(testUsername1.toLowerCase());
      expect(request.user!.userInfo!.nickname).toBe(testNickname1);
      expect(request.user!.password).toBe(testHash1);

      return {
        user: undefined,
        errorMessage: '',
      };
    });
    hashAgent.hashPassword.mockImplementationOnce(() => Promise.resolve(testHash1));

    const request = makeRequest(testUsername1, testPassword1, testNickname1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(RegisterErrorCode.REGISTER_ERROR_USERNAME_EXISTS);
  });

  test('Bad Downstream Request', async () => {
    const hashAgent = makeMockHashAgent();
    const userCrudClient = makeMockLoopbackChannel();

    const handler = new RegisterHandler(userCrudClient, hashAgent);
    userCrudClient.callRoute.mockImplementationOnce(() => { throw new Error('Test Error'); });
    hashAgent.hashPassword.mockImplementationOnce(() => Promise.resolve(testHash1));

    const request = makeRequest(testUsername1, testPassword1, testNickname1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(RegisterErrorCode.REGISTER_ERROR_INTERNAL_ERROR);
  });
});
