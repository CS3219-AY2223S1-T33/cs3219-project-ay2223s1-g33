import { JoinQueueErrorCode, JoinQueueRequest, JoinQueueResponse } from '../../proto/matching-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';
import { IRedisMatchingAdapter } from '../../redis_adapter/redis_matching_adapter';

class JoinQueueHandler implements IApiHandler<JoinQueueRequest, JoinQueueResponse> {
  authService: IAuthenticationAgent;

  redisAdapter: IRedisMatchingAdapter;

  constructor(authService: IAuthenticationAgent, redisClient: IRedisMatchingAdapter) {
    this.authService = authService;
    this.redisAdapter = redisClient;
  }

  async handle(request: JoinQueueRequest): Promise<JoinQueueResponse> {
    const validatedRequest = JoinQueueHandler.validateRequest(request);
    if (validatedRequest instanceof Error) {
      return JoinQueueHandler.buildErrorResponse(
        JoinQueueErrorCode.JOIN_QUEUE_BAD_REQUEST,
        validatedRequest.message,
      );
    }

    const tokenData = await this.authService.verifyToken(validatedRequest.sessionToken);
    if (tokenData === undefined) {
      return JoinQueueHandler.buildErrorResponse(
        JoinQueueErrorCode.JOIN_QUEUE_UNAUTHORIZED,
        'Invalid token',
      );
    }

    const isQueueable = await this.redisAdapter.lockIfUnset(tokenData.username);
    if (!isQueueable) {
      return {
        errorMessage: 'User already in queue',
        errorCode: JoinQueueErrorCode.JOIN_QUEUE_ALREADY_IN_QUEUE,
      };
    }

    const isQueueingSuccessful = await this.redisAdapter
      .pushStream(tokenData.username, request.difficulty);

    if (!isQueueingSuccessful) {
      return {
        errorMessage: 'Unable to queue',
        errorCode: JoinQueueErrorCode.JOIN_QUEUE_INTERNAL_ERROR,
      };
    }

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

  static buildErrorResponse(
    errorCode: JoinQueueErrorCode,
    errorMessage: string,
  ): JoinQueueResponse {
    return {
      errorMessage,
      errorCode,
    };
  }
}

export default JoinQueueHandler;
