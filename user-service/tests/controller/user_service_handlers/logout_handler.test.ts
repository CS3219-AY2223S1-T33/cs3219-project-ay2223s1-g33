import { ApiRequest } from '../../../src/api_server/api_server_types';
import {
  makeMockAuthAgent,
} from '../test_util';
import { LogoutErrorCode, LogoutRequest } from '../../../src/proto/user-service';
import { TokenPair } from '../../../src/auth/authentication_agent_types';
import LogoutHandler from '../../../src/controller/user_service_handlers/logout_handler';
import GatewayConstants from '../../../src/utils/gateway_constants';

describe('Logout Handler', () => {
  const makeRequest = (sessionToken: string, refreshToken: string):
  ApiRequest<LogoutRequest> => {
    const req: ApiRequest<LogoutRequest> = {
      request: {},
      headers: {},
    };
    req.headers[GatewayConstants.GATEWAY_HEADER_SESSION_TOKEN] = [sessionToken];
    req.headers[GatewayConstants.GATEWAY_HEADER_REFRESH_TOKEN] = [refreshToken];
    return req;
  };

  const testSessionToken = 'aaa';
  const testRefreshToken = 'bbbb';

  test('Successful Logout', async () => {
    const authAgent = makeMockAuthAgent();

    const handler = new LogoutHandler(authAgent);
    authAgent.invalidateToken.mockImplementationOnce(
      (token: TokenPair): Promise<boolean> => {
        expect(token.sessionToken).toBe(testSessionToken);
        expect(token.refreshToken).toBe(testRefreshToken);
        return Promise.resolve(true);
      },
    );

    const request = makeRequest(testSessionToken, testRefreshToken);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.errorCode).toBe(LogoutErrorCode.LOGOUT_ERROR_NONE);
    expect('Set-Cookie' in response.headers).toBeTruthy();
    expect(authAgent.invalidateToken.mock.calls.length).toBe(1);
  });

  test('Bad Request', async () => {
    const authAgent = makeMockAuthAgent();

    const handler = new LogoutHandler(authAgent);

    let request = makeRequest('', testRefreshToken);
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LogoutErrorCode.LOGOUT_ERROR_INTERNAL_ERROR);

    request = makeRequest(testSessionToken, '');
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LogoutErrorCode.LOGOUT_ERROR_INTERNAL_ERROR);

    request = makeRequest('', '');
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LogoutErrorCode.LOGOUT_ERROR_INTERNAL_ERROR);
  });

  test('Bad Downstream Request', async () => {
    const authAgent = makeMockAuthAgent();

    const handler = new LogoutHandler(authAgent);
    authAgent.invalidateToken.mockImplementationOnce(
      (token: TokenPair): Promise<boolean> => {
        expect(token.sessionToken).toBe(testSessionToken);
        expect(token.refreshToken).toBe(testRefreshToken);
        return Promise.resolve(false);
      },
    ).mockImplementationOnce(() => { throw new Error('Test Errror'); });

    let request = makeRequest(testSessionToken, testRefreshToken);
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LogoutErrorCode.LOGOUT_ERROR_INTERNAL_ERROR);
    expect(authAgent.invalidateToken.mock.calls.length).toBe(1);

    request = makeRequest(testSessionToken, testRefreshToken);
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.errorCode).toBe(LogoutErrorCode.LOGOUT_ERROR_INTERNAL_ERROR);
    expect(authAgent.invalidateToken.mock.calls.length).toBe(2);
  });
});
