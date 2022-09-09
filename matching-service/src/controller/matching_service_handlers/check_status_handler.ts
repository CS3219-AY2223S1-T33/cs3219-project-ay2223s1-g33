import {
  CheckQueueStatusRequest,
  CheckQueueStatusResponse,
  QueueStatus,
} from '../../proto/matching-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { QueueServiceClient } from '../../proto/matching-service.grpc-client';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';

class CheckQueueStatusHandler implements
  IApiHandler<CheckQueueStatusRequest, CheckQueueStatusResponse> {
  rpcClient: QueueServiceClient;

  authService: IAuthenticationAgent;

  constructor(rpcClient: QueueServiceClient, authService: IAuthenticationAgent) {
    this.rpcClient = rpcClient;
    this.authService = authService;
  }

  async handle(request: CheckQueueStatusRequest): Promise<CheckQueueStatusResponse> {
    const validatedRequest = CheckQueueStatusHandler.validateRequest(request);
    if (validatedRequest instanceof Error) {
      return CheckQueueStatusHandler.buildErrorResponse(
        validatedRequest.message,
      );
    }

    const tokenData = await this.authService.verifyToken(validatedRequest.sessionToken);
    if (tokenData === undefined) {
      return CheckQueueStatusHandler.buildErrorResponse(
        'Invalid token',
      );
    }

    // Get Queue Status
    const queueStatus = QueueStatus.PENDING;
    const roomId = '';

    return {
      queueStatus,
      roomId,
      errorMessage: '',
    };
  }

  static validateRequest(request: CheckQueueStatusRequest): (CheckQueueStatusRequest | Error) {
    if (!request.sessionToken) {
      return new Error('No token provided');
    }

    const sessionToken = request.sessionToken.trim();

    return {
      sessionToken,
    };
  }

  static buildErrorResponse(errorMessage: string): CheckQueueStatusResponse {
    return {
      errorMessage,
      queueStatus: QueueStatus.INVALID,
      roomId: '',
    };
  }
}

export default CheckQueueStatusHandler;
