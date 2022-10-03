import { JoinQueueErrorCode, JoinQueueRequest, JoinQueueResponse } from '../../proto/matching-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IRedisMatchingAdapter } from '../../redis_adapter/redis_matching_adapter';

const gatewayHeaderUsername = 'grpc-x-bearer-username';

class JoinQueueHandler implements IApiHandler<JoinQueueRequest, JoinQueueResponse> {
  redisAdapter: IRedisMatchingAdapter;

  constructor(redisClient: IRedisMatchingAdapter) {
    this.redisAdapter = redisClient;
  }

  async handle(request: ApiRequest<JoinQueueRequest>): Promise<ApiResponse<JoinQueueResponse>> {
    const validatedRequest = JoinQueueHandler.validateRequest(request.request);
    if (validatedRequest instanceof Error) {
      return JoinQueueHandler.buildResponse(
        JoinQueueErrorCode.JOIN_QUEUE_BAD_REQUEST,
        validatedRequest.message,
      );
    }

    if (!(gatewayHeaderUsername in request.headers)) {
      return JoinQueueHandler.buildResponse(
        JoinQueueErrorCode.JOIN_QUEUE_INTERNAL_ERROR,
        'Bad request from gateway',
      );
    }

    const username = request.headers[gatewayHeaderUsername][0];

    const isQueueable = await this.redisAdapter.lockIfUnset(username);
    if (!isQueueable) {
      return JoinQueueHandler.buildResponse(
        JoinQueueErrorCode.JOIN_QUEUE_ALREADY_IN_QUEUE,
        'User already in queue',
      );
    }

    const isQueueingSuccessful = await this.redisAdapter
      .pushStream(username, validatedRequest.difficulties);

    if (!isQueueingSuccessful) {
      return JoinQueueHandler.buildResponse(
        JoinQueueErrorCode.JOIN_QUEUE_INTERNAL_ERROR,
        'Unable to queue',
      );
    }

    return JoinQueueHandler.buildResponse(
      JoinQueueErrorCode.JOIN_QUEUE_ERROR_NONE,
      '',
    );
  }

  static validateRequest(request: JoinQueueRequest): (JoinQueueRequest | Error) {
    if (!request.difficulties || request.difficulties.length === 0) {
      return new Error('Diffculty not provided');
    }

    const { difficulties } = request;

    return {
      difficulties,
    };
  }

  static buildResponse(
    errorCode: JoinQueueErrorCode,
    errorMessage: string,
  ): ApiResponse<JoinQueueResponse> {
    return {
      headers: {},
      response: {
        errorMessage,
        errorCode,
      },
    };
  }
}

export default JoinQueueHandler;
