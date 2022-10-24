import {
  DeleteResetTokenRequest,
  DeleteResetTokenResponse,
  EditUserRequest,
  EditUserResponse,
  GetResetTokensRequest,
  GetResetTokensResponse,
  GetUserRequest,
  GetUserResponse,
} from '../../../src/proto/user-crud-service';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import {
  makeMockAuthAgent,
  makeMockHashAgent,
  makeMockUserCrudLoopbackChannel,
  makeTestPasswordUser,
  makeTestResetToken,
  testData,
} from '../test_util';
import { ConsumeResetTokenErrorCode, ConsumeResetTokenRequest } from '../../../src/proto/user-service';
import ConsumeResetTokenHandler from '../../../src/controller/user_service_handlers/consume_reset_token_handler';

describe('Consume Password Token Handler', () => {
  const {
    testUserId1,
    testUsername1,
    testNickname1,
    testPassword1,
    testPassword2,
    testTokenString1,
  } = testData;

  const makeRequest = (token: string, newPassword: string):
  ApiRequest<ConsumeResetTokenRequest> => {
    const req: ApiRequest<ConsumeResetTokenRequest> = {
      request: {
        token,
        newPassword,
      },
      headers: {},
    };
    return req;
  };

  test('Successful Consume Token', async () => {
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();

    const handler = new ConsumeResetTokenHandler(userCrudClient, authAgent, hashAgent);
    mockCrudLoopback.getResetTokens.mockImplementationOnce((request: GetResetTokensRequest):
    GetResetTokensResponse => {
      expect(request.tokenString).toBe(testTokenString1);
      expect(request.username).toBe('');
      const afterNow = Math.floor(new Date().getTime() / 1000) + 3600;

      return {
        tokens: [makeTestResetToken(testTokenString1, testUserId1, afterNow)],
        errorMessage: '',
      };
    });

    mockCrudLoopback.getUser.mockImplementationOnce(
      (request: GetUserRequest): GetUserResponse => {
        expect(request.user!.userId).toBe(testUserId1);

        return {
          user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
          errorMessage: '',
        };
      },
    );

    mockCrudLoopback.deleteResetToken.mockImplementationOnce(
      (request: DeleteResetTokenRequest): DeleteResetTokenResponse => {
        expect(request.tokenString).toBe(testTokenString1);

        return {
          errorMessage: '',
        };
      },
    );

    mockCrudLoopback.editUser.mockImplementationOnce(
      (request: EditUserRequest): EditUserResponse => {
        expect(request.user!.userInfo!.nickname).toBe(testNickname1);
        expect(request.user!.userInfo!.userId).toBe(testUserId1);
        expect(request.user!.userInfo!.username).toBe(testUsername1);
        expect(request.user!.password).toBe(testPassword2);

        return {
          user: request.user,
          errorMessage: '',
        };
      },
    );

    hashAgent.hashPassword.mockImplementationOnce(() => testPassword2);
    const request = makeRequest(testTokenString1, testPassword2);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.errorCode).toBe(
      ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_NONE,
    );
    expect(mockCrudLoopback.deleteResetToken.mock.calls.length).toBe(1);
    expect(mockCrudLoopback.editUser.mock.calls.length).toBe(1);
  });

  test('No Such Token', async () => {
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();

    const handler = new ConsumeResetTokenHandler(userCrudClient, authAgent, hashAgent);
    mockCrudLoopback.getResetTokens.mockImplementationOnce(
      (): GetResetTokensResponse => ({
        tokens: [],
        errorMessage: '',
      }),
    );

    const request = makeRequest(testTokenString1, testPassword2);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_BAD_REQUEST,
    );
  });

  test('Failed to delete token', async () => {
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();

    const handler = new ConsumeResetTokenHandler(userCrudClient, authAgent, hashAgent);
    mockCrudLoopback.getResetTokens.mockImplementationOnce((): GetResetTokensResponse => {
      const afterNow = Math.floor(new Date().getTime() / 1000) + 3600;

      return {
        tokens: [makeTestResetToken(testTokenString1, testUserId1, afterNow)],
        errorMessage: '',
      };
    });

    mockCrudLoopback.deleteResetToken.mockImplementationOnce(
      (): DeleteResetTokenResponse => ({
        errorMessage: 'error',
      }),
    );

    const request = makeRequest(testTokenString1, testPassword2);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_INTERNAL_ERROR,
    );
  });

  test('No such user', async () => {
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();

    const handler = new ConsumeResetTokenHandler(userCrudClient, authAgent, hashAgent);
    mockCrudLoopback.getResetTokens.mockImplementationOnce(
      (): GetResetTokensResponse => {
        const afterNow = Math.floor(new Date().getTime() / 1000) + 3600;

        return {
          tokens: [makeTestResetToken(testTokenString1, testUserId1, afterNow)],
          errorMessage: '',
        };
      },
    );

    mockCrudLoopback.getUser.mockImplementationOnce(
      (): GetUserResponse => ({
        user: undefined,
        errorMessage: '',
      }),
    );

    mockCrudLoopback.deleteResetToken.mockImplementationOnce(
      (): DeleteResetTokenResponse => ({
        errorMessage: '',
      }),
    );

    const request = makeRequest(testTokenString1, testPassword2);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_INTERNAL_ERROR,
    );
  });

  test('Failed to change password', async () => {
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();

    const handler = new ConsumeResetTokenHandler(userCrudClient, authAgent, hashAgent);
    mockCrudLoopback.getResetTokens.mockImplementationOnce(
      (): GetResetTokensResponse => {
        const afterNow = Math.floor(new Date().getTime() / 1000) + 3600;

        return {
          tokens: [makeTestResetToken(testTokenString1, testUserId1, afterNow)],
          errorMessage: '',
        };
      },
    );

    mockCrudLoopback.getUser.mockImplementationOnce(
      (): GetUserResponse => ({
        user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
        errorMessage: '',
      }),
    );

    mockCrudLoopback.deleteResetToken.mockImplementationOnce(
      (): DeleteResetTokenResponse => ({
        errorMessage: '',
      }),
    );

    mockCrudLoopback.editUser.mockImplementationOnce(
      (): EditUserResponse => ({
        user: undefined,
        errorMessage: 'Test Error',
      }),
    );

    hashAgent.hashPassword.mockImplementationOnce(() => testPassword2);
    const request = makeRequest(testTokenString1, testPassword2);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_INTERNAL_ERROR,
    );
  });

  test('Bad Request', async () => {
    const { userCrudClient } = makeMockUserCrudLoopbackChannel();
    const authAgent = makeMockAuthAgent();
    const hashAgent = makeMockHashAgent();

    const handler = new ConsumeResetTokenHandler(userCrudClient, authAgent, hashAgent);
    let request = makeRequest('', testPassword2);
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_BAD_REQUEST,
    );

    request = makeRequest(testTokenString1, '');
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_BAD_REQUEST,
    );
  });
});
