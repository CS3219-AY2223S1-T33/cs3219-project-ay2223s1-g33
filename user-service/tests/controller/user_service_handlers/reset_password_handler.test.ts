import {
  CreateResetTokenRequest,
  CreateResetTokenResponse,
  DeleteResetTokenRequest,
  DeleteResetTokenResponse,
  GetResetTokensRequest,
  GetResetTokensResponse,
  GetUserRequest,
  GetUserResponse,
} from '../../../src/proto/user-crud-service';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import {
  makeMockEmailSender,
  makeMockUserCrudLoopbackChannel,
  makeTestPasswordUser,
  makeTestResetToken,
  testData,
} from '../test_util';
import { ResetPasswordErrorCode, ResetPasswordRequest } from '../../../src/proto/user-service';
import ResetPasswordHandler from '../../../src/controller/user_service_handlers/reset_password_handler';

describe('Reset Password Handler', () => {
  const {
    testUserId1,
    testUsername1,
    testNickname1,
    testPassword1,
    testTokenString1,
    testTokenString2,
    testTokenString3,
  } = testData;

  const makeRequest = (username: string):
  ApiRequest<ResetPasswordRequest> => {
    const req: ApiRequest<ResetPasswordRequest> = {
      request: {
        username,
      },
      headers: {},
    };
    return req;
  };

  test('Successful Reset Password', async () => {
    const emailSender = makeMockEmailSender();
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();

    const handler = new ResetPasswordHandler(userCrudClient, emailSender);
    mockCrudLoopback.getUser.mockImplementationOnce((request: GetUserRequest):
    GetUserResponse => {
      expect(request.user!.username).toBe(testUsername1.toLowerCase());

      return {
        user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
        errorMessage: '',
      };
    });

    mockCrudLoopback.getResetTokens.mockImplementationOnce((request: GetResetTokensRequest):
    GetResetTokensResponse => {
      expect(request.username).toBe(testUsername1.toLowerCase());

      return {
        tokens: [],
        errorMessage: '',
      };
    });

    mockCrudLoopback.createResetToken.mockImplementationOnce(
      (request: CreateResetTokenRequest): CreateResetTokenResponse => {
        expect(request.token!.userId).toBe(testUserId1);
        expect(request.token!.token.length).toBeGreaterThan(0);
        expect(request.token!.expiresAt).toBeGreaterThan(0);

        return {
          token: request.token,
          errorMessage: '',
        };
      },
    );

    emailSender.sendResetEmail.mockImplementationOnce(
      async (username: string, nickname: string, token: string) => {
        expect(username).toBe(testUsername1.toLowerCase());
        expect(nickname).toBe(testNickname1);
        expect(token.length).toBeGreaterThan(0);
      },
    );

    const request = makeRequest(testUsername1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.errorCode).toBe(ResetPasswordErrorCode.RESET_PASSWORD_ERROR_NONE);
    expect(mockCrudLoopback.createResetToken.mock.calls.length).toBe(1);
    expect(emailSender.sendResetEmail.mock.calls.length).toBe(1);
  });

  test('Successful With Clear Old Tokens', async () => {
    const emailSender = makeMockEmailSender();
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();

    const handler = new ResetPasswordHandler(userCrudClient, emailSender);
    mockCrudLoopback.getUser.mockImplementationOnce((request: GetUserRequest):
    GetUserResponse => {
      expect(request.user!.username).toBe(testUsername1.toLowerCase());

      return {
        user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
        errorMessage: '',
      };
    });

    const token1 = makeTestResetToken(testTokenString1, testUserId1, 1);
    const token2 = makeTestResetToken(testTokenString2, testUserId1, 2);
    const token3 = makeTestResetToken(testTokenString3, testUserId1, 3);
    mockCrudLoopback.getResetTokens.mockImplementationOnce((request: GetResetTokensRequest):
    GetResetTokensResponse => {
      expect(request.username).toBe(testUsername1.toLowerCase());

      return {
        tokens: [token1, token2, token3],
        errorMessage: '',
      };
    });

    mockCrudLoopback.deleteResetToken.mockImplementationOnce(
      (request: DeleteResetTokenRequest): DeleteResetTokenResponse => {
        expect(request.tokenString).toBe(testTokenString1);

        return {
          errorMessage: '',
        };
      },
    );

    mockCrudLoopback.createResetToken.mockImplementationOnce(
      (request: CreateResetTokenRequest): CreateResetTokenResponse => {
        expect(request.token!.userId).toBe(testUserId1);
        expect(request.token!.token.length).toBeGreaterThan(0);
        expect(request.token!.expiresAt).toBeGreaterThan(0);

        return {
          token: request.token,
          errorMessage: '',
        };
      },
    );

    emailSender.sendResetEmail.mockImplementationOnce(
      async (username: string, nickname: string, token: string) => {
        expect(username).toBe(testUsername1.toLowerCase());
        expect(nickname).toBe(testNickname1);
        expect(token.length).toBeGreaterThan(0);
      },
    );

    const request = makeRequest(testUsername1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.errorCode).toBe(ResetPasswordErrorCode.RESET_PASSWORD_ERROR_NONE);
    expect(mockCrudLoopback.deleteResetToken.mock.calls.length).toBe(1);
    expect(mockCrudLoopback.createResetToken.mock.calls.length).toBe(1);
    expect(emailSender.sendResetEmail.mock.calls.length).toBe(1);
  });

  test('Bad Request', async () => {
    const emailSender = makeMockEmailSender();
    const { userCrudClient } = makeMockUserCrudLoopbackChannel();

    const handler = new ResetPasswordHandler(userCrudClient, emailSender);
    const request = makeRequest('');
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ResetPasswordErrorCode.RESET_PASSWORD_ERROR_BAD_REQUEST,
    );
  });

  test('Bad Username', async () => {
    const emailSender = makeMockEmailSender();
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();

    const handler = new ResetPasswordHandler(userCrudClient, emailSender);
    mockCrudLoopback.getUser.mockImplementationOnce((): GetUserResponse => ({
      user: undefined,
      errorMessage: '',
    }));

    const request = makeRequest(testUsername1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ResetPasswordErrorCode.RESET_PASSWORD_ERROR_BAD_REQUEST,
    );
  });

  test('Cannot Get Current Tokens', async () => {
    const emailSender = makeMockEmailSender();
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();

    const handler = new ResetPasswordHandler(userCrudClient, emailSender);
    mockCrudLoopback.getUser.mockImplementationOnce((): GetUserResponse => ({
      user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
      errorMessage: '',
    }));

    mockCrudLoopback.getResetTokens.mockImplementationOnce(
      (): GetResetTokensResponse => { throw new Error('Test Error'); },
    );

    const request = makeRequest(testUsername1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ResetPasswordErrorCode.RESET_PASSWORD_ERROR_INTERNAL_ERROR,
    );
  });

  test('Cannot Clear Old Tokens', async () => {
    const emailSender = makeMockEmailSender();
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();

    const handler = new ResetPasswordHandler(userCrudClient, emailSender);
    mockCrudLoopback.getUser.mockImplementationOnce((): GetUserResponse => ({
      user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
      errorMessage: '',
    }));

    const token1 = makeTestResetToken(testTokenString1, testUserId1, 1);
    const token2 = makeTestResetToken(testTokenString2, testUserId1, 2);
    const token3 = makeTestResetToken(testTokenString3, testUserId1, 3);
    mockCrudLoopback.getResetTokens.mockImplementationOnce((): GetResetTokensResponse => ({
      tokens: [token1, token2, token3],
      errorMessage: '',
    }));

    mockCrudLoopback.deleteResetToken.mockImplementationOnce(
      (): DeleteResetTokenResponse => {
        throw new Error('Test Error');
      },
    );

    const request = makeRequest(testUsername1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ResetPasswordErrorCode.RESET_PASSWORD_ERROR_INTERNAL_ERROR,
    );
  });

  test('Cannot create token', async () => {
    const emailSender = makeMockEmailSender();
    const { userCrudClient, mockCrudLoopback } = makeMockUserCrudLoopbackChannel();

    const handler = new ResetPasswordHandler(userCrudClient, emailSender);
    mockCrudLoopback.getUser.mockImplementationOnce((): GetUserResponse => ({
      user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
      errorMessage: '',
    }));

    mockCrudLoopback.getResetTokens.mockImplementationOnce(
      (): GetResetTokensResponse => ({
        tokens: [],
        errorMessage: '',
      }),
    );

    mockCrudLoopback.createResetToken.mockImplementationOnce(
      (): CreateResetTokenResponse => {
        throw new Error('Test Error');
      },
    );

    const request = makeRequest(testUsername1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(
      ResetPasswordErrorCode.RESET_PASSWORD_ERROR_INTERNAL_ERROR,
    );
  });
});
