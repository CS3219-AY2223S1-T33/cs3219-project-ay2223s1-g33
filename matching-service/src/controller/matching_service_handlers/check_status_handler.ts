import {
  CheckQueueStatusErrorCode,
  CheckQueueStatusRequest,
  CheckQueueStatusResponse,
  QueueStatus,
} from '../../proto/matching-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IRedisMatchingAdapter } from '../../redis_adapter/redis_matching_adapter';
import { IRoomSessionAgent } from '../../room_auth/room_session_agent_types';

const gatewayHeaderUsername = 'grpc-x-bearer-username';

class CheckQueueStatusHandler
implements IApiHandler<CheckQueueStatusRequest, CheckQueueStatusResponse> {
  roomAuthService: IRoomSessionAgent;

  redisClient: IRedisMatchingAdapter;

  constructor(
    roomAuthService: IRoomSessionAgent,
    redisClient: IRedisMatchingAdapter,
  ) {
    this.roomAuthService = roomAuthService;
    this.redisClient = redisClient;
  }

  async handle(request: ApiRequest<CheckQueueStatusRequest>) :
  Promise<ApiResponse<CheckQueueStatusResponse>> {
    if (!(gatewayHeaderUsername in request.headers)) {
      return CheckQueueStatusHandler.buildErrorResponse(
        CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_INTERNAL_ERROR,
        'Bad request from gateway',
      );
    }

    const username = request.headers[gatewayHeaderUsername][0];

    // Get Queue Status
    let queueStatus = QueueStatus.PENDING;
    let roomToken = '';

    const queueToken = await this.redisClient.getUserLock(username);
    if (queueToken === null) {
      return CheckQueueStatusHandler.buildErrorResponse(
        CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_ERROR_NOT_IN_QUEUE,
        'User not currently in queue',
      );
    }

    if (queueToken.matched) {
      await this.redisClient.deleteUserLock(username);
      roomToken = this.roomAuthService.createToken(
        queueToken.roomId,
        queueToken.difficulty,
      );
      queueStatus = QueueStatus.MATCHED;
    }

    return {
      headers: {},
      response: {
        queueStatus,
        roomToken,
        errorMessage: '',
        errorCode: CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_ERROR_NONE,
      },
    };
  }

  static buildErrorResponse(
    errorCode: CheckQueueStatusErrorCode,
    errorMessage: string,
  ): ApiResponse<CheckQueueStatusResponse> {
    return {
      headers: {},
      response: {
        errorMessage,
        queueStatus: QueueStatus.INVALID,
        roomToken: '',
        errorCode,
      },
    };
  }
}

export default CheckQueueStatusHandler;
