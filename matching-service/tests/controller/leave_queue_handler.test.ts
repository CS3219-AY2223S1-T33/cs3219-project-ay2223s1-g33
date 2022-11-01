import { LeaveQueueErrorCode, LeaveQueueRequest } from '../../src/proto/matching-service';
import { ApiRequest } from '../../src/api_server/api_server_types';
import { makeRedisAdapter } from './test_utils';
import LeaveQueueHandler from '../../src/controller/matching_service_handlers/leave_queue_handler';
import GatewayConstants from '../../src/utils/gateway_constants';
import { MatchResult } from '../../src/redis_adapter/redis_matching_adapter';
import { QuestionDifficulty } from '../../src/proto/types';

describe('Leave Queue Handler', () => {
  const makeRequest = (username: (string | undefined)):
  ApiRequest<LeaveQueueRequest> => {
    const request: ApiRequest<LeaveQueueRequest> = {
      request: {},
      headers: {},
    };

    if (username) {
      request.headers[GatewayConstants.GATEWAY_HEADER_USERNAME] = [username];
    }

    return request;
  };

  test('Successful Leave Queue', async () => {
    const redisAdapter = makeRedisAdapter();
    const handler = new LeaveQueueHandler(redisAdapter);

    const matchResult: MatchResult = {
      matched: false,
      queueId: 'asdf',
      difficulty: QuestionDifficulty.UNUSED,
      roomId: '',
    };

    redisAdapter.getUserLock.mockReturnValueOnce(matchResult);
    redisAdapter.removeFromSteam.mockReturnValueOnce(true);
    redisAdapter.deleteUserLock.mockReturnValueOnce(true);

    const request = makeRequest('userA');
    const response = await handler.handle(request);
    expect(response.response.errorCode).toBe(LeaveQueueErrorCode.LEAVE_QUEUE_ERROR_NONE);
    expect(response.response.errorMessage).toBe('');
    expect(redisAdapter.removeFromSteam.mock.calls[0][0]).toBe('asdf');
    expect(redisAdapter.deleteUserLock.mock.calls[0][0]).toBe('userA');
  });

  test('Bad Request Join Queue', async () => {
    const redisAdapter = makeRedisAdapter();
    const handler = new LeaveQueueHandler(redisAdapter);

    let request = makeRequest('');
    let response = await handler.handle(request);
    expect(response.response.errorCode).toBe(LeaveQueueErrorCode.LEAVE_QUEUE_INTERNAL_ERROR);
    expect(response.response.errorMessage).toBeTruthy();

    request = makeRequest(undefined);
    response = await handler.handle(request);
    expect(response.response.errorCode).toBe(LeaveQueueErrorCode.LEAVE_QUEUE_INTERNAL_ERROR);
    expect(response.response.errorMessage).toBeTruthy();
  });

  test('Not in Queue', async () => {
    const redisAdapter = makeRedisAdapter();
    const handler = new LeaveQueueHandler(redisAdapter);

    // Flow 1
    redisAdapter.getUserLock.mockReturnValueOnce(null);

    // Flow 2
    redisAdapter.getUserLock.mockReturnValueOnce({
      matched: true,
      queueId: 'asdf',
      difficulty: QuestionDifficulty.EASY,
      roomId: 'aaaaaaa',
    });

    // Flow 3
    redisAdapter.getUserLock.mockReturnValueOnce({
      matched: false,
      queueId: 'asdf',
      difficulty: QuestionDifficulty.UNUSED,
      roomId: '',
    });
    redisAdapter.removeFromSteam.mockReturnValueOnce(false);

    // Flow 4
    redisAdapter.getUserLock.mockReturnValueOnce({
      matched: false,
      queueId: 'asdf',
      difficulty: QuestionDifficulty.UNUSED,
      roomId: '',
    });
    redisAdapter.removeFromSteam.mockReturnValueOnce(true);
    redisAdapter.deleteUserLock.mockReturnValueOnce(false);

    let request = makeRequest('userA');
    let response = await handler.handle(request);
    expect(response.response.errorCode).toBe(LeaveQueueErrorCode.LEAVE_QUEUE_NOT_IN_QUEUE);
    expect(response.response.errorMessage).toBeTruthy();

    request = makeRequest('userA');
    response = await handler.handle(request);
    expect(response.response.errorCode).toBe(LeaveQueueErrorCode.LEAVE_QUEUE_NOT_IN_QUEUE);
    expect(response.response.errorMessage).toBeTruthy();

    request = makeRequest('userA');
    response = await handler.handle(request);
    expect(response.response.errorCode).toBe(LeaveQueueErrorCode.LEAVE_QUEUE_NOT_IN_QUEUE);
    expect(response.response.errorMessage).toBeTruthy();

    request = makeRequest('userA');
    response = await handler.handle(request);
    expect(response.response.errorCode).toBe(LeaveQueueErrorCode.LEAVE_QUEUE_NOT_IN_QUEUE);
    expect(response.response.errorMessage).toBeTruthy();
  });
});
