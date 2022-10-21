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
    const isQueueable = await this.redisAdapter.lockIfUnset(username);
    if (!isQueueable) {
      return LeaveQueueHandler.buildResponse(
        LeaveQueueErrorCode.LEAVE_QUEUE_BAD_REQUEST,
        'User already in queue',
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
