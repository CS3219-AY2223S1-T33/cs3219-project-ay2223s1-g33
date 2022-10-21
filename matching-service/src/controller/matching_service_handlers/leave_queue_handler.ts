import { LeaveQueueErrorCode, LeaveQueueRequest, LeaveQueueResponse } from '../../proto/matching-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IRedisMatchingAdapter } from '../../redis_adapter/redis_matching_adapter';

const gatewayHeaderUsername = 'grpc-x-bearer-username';

class LeaveQueueHandler implements IApiHandler<LeaveQueueRequest, LeaveQueueResponse> {
  redisAdapter: IRedisMatchingAdapter;

  constructor(redisClient: IRedisMatchingAdapter) {
    this.redisAdapter = redisClient;
  }

  async handle(request: ApiRequest<LeaveQueueRequest>): Promise<ApiResponse<LeaveQueueResponse>> {
    if (!(gatewayHeaderUsername in request.headers)) {
      return LeaveQueueHandler.buildResponse(
        LeaveQueueErrorCode.LEAVE_QUEUE_BAD_REQUEST,
        'Bad request from gateway',
      );
    }

    const username = request.headers[gatewayHeaderUsername][0];
    const queueToken = await this.redisAdapter.getUserLock(username);
    if (queueToken === null) {
      return LeaveQueueHandler.buildResponse(
        LeaveQueueErrorCode.LEAVE_QUEUE_NOT_IN_QUEUE,
        'User not currently in queue',
      );
    }

    if (queueToken.matched) {
      return LeaveQueueHandler.buildResponse(
        LeaveQueueErrorCode.LEAVE_QUEUE_NOT_IN_QUEUE,
        'User not currently in queue',
      );
    }

    const isDeletedFromQueue = await this.redisAdapter.removeFromSteam(queueToken.queueId);
    if (!isDeletedFromQueue) {
      return LeaveQueueHandler.buildResponse(
        LeaveQueueErrorCode.LEAVE_QUEUE_NOT_IN_QUEUE,
        'User not currently in queue',
      );
    }

    const isDeleteSuccessful = await this.redisAdapter.deleteUserLock(username);
    if (!isDeleteSuccessful) {
      return LeaveQueueHandler.buildResponse(
        LeaveQueueErrorCode.LEAVE_QUEUE_NOT_IN_QUEUE,
        'Failed leave queue',
      );
    }

    return LeaveQueueHandler.buildResponse(
      LeaveQueueErrorCode.LEAVE_QUEUE_ERROR_NONE,
      '',
    );
  }

  static buildResponse(
    errorCode: LeaveQueueErrorCode,
    errorMessage: string,
  ): ApiResponse<LeaveQueueResponse> {
    return {
      headers: {},
      response: {
        errorMessage,
        errorCode,
      },
    };
  }
}

export default LeaveQueueHandler;
