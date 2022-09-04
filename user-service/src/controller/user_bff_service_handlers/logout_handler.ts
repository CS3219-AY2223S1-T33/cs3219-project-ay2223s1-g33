import { LogoutErrorCode, LogoutRequest, LogoutResponse } from '../../proto/user-bff-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';

class LogoutHandler implements IApiHandler<LogoutRequest, LogoutResponse> {
  authService: IAuthenticationAgent;

  constructor(authService: IAuthenticationAgent) {
    this.authService = authService;
  }

  async handle(request: LogoutRequest): Promise<LogoutResponse> {
    const validatedRequest = LogoutHandler.validateRequest(request);
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
      errorCode: LogoutErrorCode.LOGOUT_ERROR_NONE,
      errorMessage: '',
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

  static buildErrorResponse(errorCode: LogoutErrorCode, errorMessage: string): LogoutResponse {
    return {
      errorCode,
      errorMessage,
    };
  }
}

export default LogoutHandler;
