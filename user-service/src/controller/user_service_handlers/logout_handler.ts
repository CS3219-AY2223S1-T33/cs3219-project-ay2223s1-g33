import { LogoutErrorCode, LogoutRequest, LogoutResponse } from '../../proto/user-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';
import GatewayConstants from '../../utils/gateway_constants';
import { safeReadFirstHeader } from '../controller_utils';
import Logger from '../../utils/logger';

class LogoutHandler implements IApiHandler<LogoutRequest, LogoutResponse> {
  authService: IAuthenticationAgent;

  constructor(authService: IAuthenticationAgent) {
    this.authService = authService;
  }

  async handle(request: ApiRequest<LogoutRequest>): Promise<ApiResponse<LogoutResponse>> {
    const refreshToken = safeReadFirstHeader(
      request.headers,
      GatewayConstants.GATEWAY_HEADER_REFRESH_TOKEN,
    );

    const sessionToken = safeReadFirstHeader(
      request.headers,
      GatewayConstants.GATEWAY_HEADER_SESSION_TOKEN,
    );

    if (!refreshToken || !sessionToken || refreshToken.length === 0 || sessionToken.length === 0) {
      return LogoutHandler.buildErrorResponse(
        LogoutErrorCode.LOGOUT_ERROR_BAD_REQUEST,
        'Bad request from gateway',
      );
    }

    const username = safeReadFirstHeader(
      request.headers,
      GatewayConstants.GATEWAY_HEADER_USERNAME,
    );

    let success = false;
    try {
      success = await this.authService.invalidateToken({
        sessionToken,
        refreshToken,
      });
    } catch {
      success = false;
    }

    if (!success) {
      return LogoutHandler.buildErrorResponse(
        LogoutErrorCode.LOGOUT_ERROR_INTERNAL_ERROR,
        'An internal server error occurred',
      );
    }

    Logger.info(`Logout: ${username}`);
    return {
      response: {
        errorCode: LogoutErrorCode.LOGOUT_ERROR_NONE,
        errorMessage: '',
      },
      headers: {
        'Set-Cookie': [
          `${GatewayConstants.COOKIE_SESSION_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`,
          `${GatewayConstants.COOKIE_REFRESH_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly`,
        ],
      },
    };
  }

  static buildErrorResponse(errorCode: LogoutErrorCode, errorMessage: string)
    : ApiResponse<LogoutResponse> {
    return {
      response: {
        errorCode,
        errorMessage,
      },
      headers: {},
    };
  }
}

export default LogoutHandler;
