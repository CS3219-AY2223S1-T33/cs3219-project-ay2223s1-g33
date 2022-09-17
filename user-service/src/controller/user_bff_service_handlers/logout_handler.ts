import { LogoutErrorCode, LogoutRequest, LogoutResponse } from '../../proto/user-bff-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';

class LogoutHandler implements IApiHandler<LogoutRequest, LogoutResponse> {
  authService: IAuthenticationAgent;

  constructor(authService: IAuthenticationAgent) {
    this.authService = authService;
  }

  async handle(request: ApiRequest<LogoutRequest>): Promise<ApiResponse<LogoutResponse>> {
    const requestObject = request.request;

    const validatedRequest = LogoutHandler.validateRequest(requestObject);
    if (validatedRequest instanceof Error) {
      return LogoutHandler.buildErrorResponse(
        LogoutErrorCode.LOGOUT_ERROR_BAD_REQUEST,
        validatedRequest.message,
      );
    }

    const isTokenValid = (
      await this.authService
        .verifyToken(validatedRequest.sessionToken)
    ) !== undefined;

    if (!isTokenValid) {
      return LogoutHandler.buildErrorResponse(
        LogoutErrorCode.LOGOUT_ERROR_BAD_REQUEST,
        'Invalid token',
      );
    }

    const success = await this.authService.invalidateToken(validatedRequest.sessionToken);
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
        'Set-Cookie': 'AUTH_SESSION=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      },
    };
  }

  static validateRequest(request: LogoutRequest): (LogoutRequest | Error) {
    if (!request.sessionToken) {
      return new Error('No token provided');
    }

    const sessionToken = request.sessionToken.trim();

    return {
      sessionToken,
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
