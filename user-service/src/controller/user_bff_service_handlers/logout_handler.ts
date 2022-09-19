import { LogoutErrorCode, LogoutRequest, LogoutResponse } from '../../proto/user-bff-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';

const sessionCookieName = 'AUTH-SESSION';
const gatewayHeaderToken = 'grpc-x-bearer-session-token';

class LogoutHandler implements IApiHandler<LogoutRequest, LogoutResponse> {
  authService: IAuthenticationAgent;

  constructor(authService: IAuthenticationAgent) {
    this.authService = authService;
  }

  async handle(request: ApiRequest<LogoutRequest>): Promise<ApiResponse<LogoutResponse>> {
    if (!(gatewayHeaderToken in request.headers)) {
      return LogoutHandler.buildErrorResponse(
        LogoutErrorCode.LOGOUT_ERROR_INTERNAL_ERROR,
        'Bad request from gateway',
      );
    }
    const token = request.headers[gatewayHeaderToken][0];

    const success = await this.authService.invalidateToken(token);
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
        'Set-Cookie': [`${sessionCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`],
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
