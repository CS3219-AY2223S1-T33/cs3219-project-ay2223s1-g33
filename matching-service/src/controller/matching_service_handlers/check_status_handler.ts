import {
  CheckQueueStatusErrorCode,
  CheckQueueStatusRequest,
  CheckQueueStatusResponse,
  QueueStatus,
} from '../../proto/matching-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';
import { IRoomSessionAgent } from '../../room_auth/room_session_agent_types';
import { IRedisAdapter } from '../../redis/redis_adapter';

class CheckQueueStatusHandler
implements IApiHandler<CheckQueueStatusRequest, CheckQueueStatusResponse> {
  userAuthService: IAuthenticationAgent;

  roomAuthService: IRoomSessionAgent;

  redisClient: IRedisAdapter;

  constructor(
    userAuthService: IAuthenticationAgent,
    roomAuthService: IRoomSessionAgent,
    redisClient: IRedisAdapter,
  ) {
    this.userAuthService = userAuthService;
    this.roomAuthService = roomAuthService;
    this.redisClient = redisClient;
  }

  async handle(request: CheckQueueStatusRequest): Promise<CheckQueueStatusResponse> {
    const validatedRequest = CheckQueueStatusHandler.validateRequest(request);
    if (validatedRequest instanceof Error) {
      return CheckQueueStatusHandler.buildErrorResponse(
        CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_BAD_REQUEST,
        validatedRequest.message,
      );
    }

    const tokenData = await this.userAuthService.verifyToken(validatedRequest.sessionToken);
    if (tokenData === undefined) {
      return CheckQueueStatusHandler.buildErrorResponse(
        CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_UNAUTHORIZED,
        'Invalid token',
      );
    }

    // Get Queue Status
    let queueStatus = QueueStatus.PENDING;
    let roomToken = '';

    const queueToken = await this.redisClient.getUserLock(tokenData.username);
    if (queueToken === null) {
      return CheckQueueStatusHandler.buildErrorResponse(
        CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_ERROR_NOT_IN_QUEUE,
        'User not currently in queue',
      );
    }

    if (queueToken !== '') {
      await this.redisClient.deleteUserLock(tokenData.username);
      roomToken = this.roomAuthService.createToken(queueToken);
      queueStatus = QueueStatus.MATCHED;
    }

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

  static buildErrorResponse(
    errorCode: CheckQueueStatusErrorCode,
    errorMessage: string,
  ): CheckQueueStatusResponse {
    return {
      errorMessage,
      queueStatus: QueueStatus.INVALID,
      roomToken: '',
      errorCode,
    };
  }
}

export default CheckQueueStatusHandler;
