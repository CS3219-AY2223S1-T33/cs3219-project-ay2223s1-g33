import { CheckQueueStatusRequest, CheckQueueStatusErrorCode, QueueStatus } from '../../src/proto/matching-service';
import { ApiRequest } from '../../src/api_server/api_server_types';
import { QuestionDifficulty } from '../../src/proto/types';
import { makeRedisAdapter, makeRoomSessionAgent } from './test_utils';
import CheckStatusHandler from '../../src/controller/matching_service_handlers/check_status_handler';
import GatewayConstants from '../../src/utils/gateway_constants';

describe('Check Status Handler', () => {
  const makeRequest = (username: (string | undefined)):
  ApiRequest<CheckQueueStatusRequest> => {
    const request: ApiRequest<CheckQueueStatusRequest> = {
      request: {},
      headers: {},
    };

    if (username) {
      request.headers[GatewayConstants.GATEWAY_HEADER_USERNAME] = [username];
    }

    return request;
  };

  test('Check Still In Queue', async () => {
    const redisAdapter = makeRedisAdapter();
    const roomSessionAgent = makeRoomSessionAgent();
    const handler = new CheckStatusHandler(roomSessionAgent, redisAdapter);

    redisAdapter.getUserLock.mockReturnValueOnce({
      matched: false,
      queueId: 'asdf',
      difficulty: QuestionDifficulty.UNUSED,
      roomId: '',
    });

    const request = makeRequest('userA');
    const response = await handler.handle(request);
    expect(response.response.errorCode)
      .toBe(CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_ERROR_NONE);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.queueStatus).toBe(QueueStatus.PENDING);
    expect(redisAdapter.getUserLock.mock.calls[0][0]).toBe('userA');
  });

  test('Check Matched', async () => {
    const redisAdapter = makeRedisAdapter();
    const roomSessionAgent = makeRoomSessionAgent();
    const handler = new CheckStatusHandler(roomSessionAgent, redisAdapter);

    redisAdapter.getUserLock.mockReturnValueOnce({
      matched: true,
      queueId: 'asdf',
      difficulty: QuestionDifficulty.EASY,
      roomId: 'aaaaaaa',
    });

    const request = makeRequest('userA');
    const response = await handler.handle(request);
    expect(response.response.errorCode)
      .toBe(CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_ERROR_NONE);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.queueStatus).toBe(QueueStatus.MATCHED);
    expect(redisAdapter.getUserLock.mock.calls[0][0]).toBe('userA');
    expect(redisAdapter.deleteUserLock.mock.calls.length).toBe(1);
  });

  test('Check Not in Queue', async () => {
    const redisAdapter = makeRedisAdapter();
    const roomSessionAgent = makeRoomSessionAgent();
    const handler = new CheckStatusHandler(roomSessionAgent, redisAdapter);

    redisAdapter.getUserLock.mockReturnValueOnce(null);

    const request = makeRequest('userA');
    const response = await handler.handle(request);
    expect(response.response.errorCode)
      .toBe(CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_ERROR_NOT_IN_QUEUE);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.queueStatus).toBe(QueueStatus.INVALID);
    expect(redisAdapter.getUserLock.mock.calls[0][0]).toBe('userA');
  });

  test('Bad Request Join Queue', async () => {
    const redisAdapter = makeRedisAdapter();
    const roomSessionAgent = makeRoomSessionAgent();
    const handler = new CheckStatusHandler(roomSessionAgent, redisAdapter);

    let request = makeRequest('');
    let response = await handler.handle(request);
    expect(response.response.errorCode)
      .toBe(CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_INTERNAL_ERROR);
    expect(response.response.errorMessage).toBeTruthy();

    request = makeRequest(undefined);
    response = await handler.handle(request);
    expect(response.response.errorCode)
      .toBe(CheckQueueStatusErrorCode.CHECK_QUEUE_STATUS_INTERNAL_ERROR);
    expect(response.response.errorMessage).toBeTruthy();
  });
});
