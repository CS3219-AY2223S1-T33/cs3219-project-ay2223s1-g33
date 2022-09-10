import {
  CheckQueueStatusErrorCode,
  CheckQueueStatusRequest,
  CheckQueueStatusResponse,
  QueueStatus,
} from '../../proto/matching-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';

class CheckQueueStatusHandler implements
  IApiHandler<CheckQueueStatusRequest, CheckQueueStatusResponse> {
  authService: IAuthenticationAgent;

  constructor(authService: IAuthenticationAgent) {
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
    const roomToken = '';

    return {
      queueStatus,
      roomToken,
      errorMessage: '',
      errorCode: CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_ERROR_NONE,
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
      roomToken: '',
      errorCode: CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_ERROR_NONE,
    };
  }
}

export default CheckQueueStatusHandler;
