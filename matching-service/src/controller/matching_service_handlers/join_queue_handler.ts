import { JoinQueueRequest, JoinQueueResponse } from '../../proto/matching-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { QueueServiceClient } from '../../proto/matching-service.grpc-client';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';

class JoinQueueHandler implements IApiHandler<JoinQueueRequest, JoinQueueResponse> {
  rpcClient: QueueServiceClient;

  authService: IAuthenticationAgent;

  constructor(rpcClient: QueueServiceClient, authService: IAuthenticationAgent) {
    this.rpcClient = rpcClient;
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
    };
  }
}

export default JoinQueueHandler;
