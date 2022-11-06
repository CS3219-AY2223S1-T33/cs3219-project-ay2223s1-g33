import { LeaveQueueErrorCode, LeaveQueueRequest, LeaveQueueResponse } from '../../proto/matching-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IRedisMatchingAdapter } from '../../redis_adapter/redis_matching_adapter';
import GatewayConstants from '../../utils/gateway_constants';
import { safeReadFirstHeader } from '../controller_utils';
import Logger from '../../utils/logger';

class LeaveQueueHandler implements IApiHandler<LeaveQueueRequest, LeaveQueueResponse> {
  redisAdapter: IRedisMatchingAdapter;

  constructor(redisClient: IRedisMatchingAdapter) {
    this.redisAdapter = redisClient;
  }

  async handle(request: ApiRequest<LeaveQueueRequest>): Promise<ApiResponse<LeaveQueueResponse>> {
    const username = safeReadFirstHeader(
      request.headers,
      GatewayConstants.GATEWAY_HEADER_USERNAME,
    );

    if (!username || username.length === 0) {
      return LeaveQueueHandler.buildResponse(
        LeaveQueueErrorCode.LEAVE_QUEUE_INTERNAL_ERROR,
        'Bad request from gateway',
      );
    }

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

    Logger.info(`Left Queue: ${username}`);
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
