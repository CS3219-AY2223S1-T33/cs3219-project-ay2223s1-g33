import { LogoutErrorCode, LogoutRequest, LogoutResponse } from '../../proto/user-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';
import GatewayConstants from '../../utils/gateway_constants';

class LogoutHandler implements IApiHandler<LogoutRequest, LogoutResponse> {
  authService: IAuthenticationAgent;

  constructor(authService: IAuthenticationAgent) {
    this.authService = authService;
  }

  async handle(request: ApiRequest<LogoutRequest>): Promise<ApiResponse<LogoutResponse>> {
    if (!(GatewayConstants.GATEWAY_HEADER_REFRESH_TOKEN in request.headers)
      || !(GatewayConstants.GATEWAY_HEADER_SESSION_TOKEN in request.headers)) {
      return LogoutHandler.buildErrorResponse(
        LogoutErrorCode.LOGOUT_ERROR_INTERNAL_ERROR,
        'Bad request from gateway',
      );
    }
    const sessionToken = request.headers[GatewayConstants.GATEWAY_HEADER_SESSION_TOKEN][0];
    const refreshToken = request.headers[GatewayConstants.GATEWAY_HEADER_REFRESH_TOKEN][0];

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
