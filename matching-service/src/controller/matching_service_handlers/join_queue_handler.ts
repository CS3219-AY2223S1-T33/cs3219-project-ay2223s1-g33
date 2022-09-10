import { JoinQueueErrorCode, JoinQueueRequest, JoinQueueResponse } from '../../proto/matching-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';

class JoinQueueHandler implements IApiHandler<JoinQueueRequest, JoinQueueResponse> {
  authService: IAuthenticationAgent;

  constructor(authService: IAuthenticationAgent) {
    this.authService = authService;
  }

  async handle(request: JoinQueueRequest): Promise<JoinQueueResponse> {
    const validatedRequest = JoinQueueHandler.validateRequest(request);
    if (validatedRequest instanceof Error) {
      return JoinQueueHandler.buildErrorResponse(
        validatedRequest.message,
      );
    }

    const tokenData = await this.authService.verifyToken(validatedRequest.sessionToken);
    if (tokenData === undefined) {
      return JoinQueueHandler.buildErrorResponse(
        'Invalid token',
      );
    }

    // JoinQueue Implmenetation

    return {
      errorMessage: '',
      errorCode: JoinQueueErrorCode.JOIN_QUEUE_ERROR_NONE,
    };
  }

  static validateRequest(request: JoinQueueRequest): (JoinQueueRequest | Error) {
    if (!request.sessionToken) {
      return new Error('No token provided');
    }

    if (!request.difficulty) {
      return new Error('Diffculty not provided');
    }

    const sessionToken = request.sessionToken.trim();

    const { difficulty } = request;

    return {
      difficulty,
      sessionToken,
    };
  }

  static buildErrorResponse(errorMessage: string): JoinQueueResponse {
    return {
      errorMessage,
      errorCode: JoinQueueErrorCode.JOIN_QUEUE_ERROR_NONE,
    };
  }
}

export default JoinQueueHandler;
