import { JoinQueueErrorCode, JoinQueueRequest } from '../../src/proto/matching-service';
import { ApiRequest } from '../../src/api_server/api_server_types';
import { QuestionDifficulty } from '../../src/proto/types';
import { makeRedisAdapter } from './test_utils';
import JoinQueueHandler from '../../src/controller/matching_service_handlers/join_queue_handler';
import GatewayConstants from '../../src/utils/gateway_constants';

describe('Join Queue Handler', () => {
  const makeRequest = (username: (string | undefined), difficulties: QuestionDifficulty[]):
  ApiRequest<JoinQueueRequest> => {
    const request: ApiRequest<JoinQueueRequest> = {
      request: {
        difficulties,
      },
      headers: {},
    };

    if (username) {
      request.headers[GatewayConstants.GATEWAY_HEADER_USERNAME] = [username];
    }

    return request;
  };

  test('Successful Join Queue', async () => {
    const redisAdapter = makeRedisAdapter();
    const handler = new JoinQueueHandler(redisAdapter);

    redisAdapter.lockIfUnset.mockReturnValueOnce(true);
    redisAdapter.pushStream.mockReturnValueOnce('aaaa');

    const request = makeRequest('userA', [QuestionDifficulty.EASY]);
    const response = await handler.handle(request);
    expect(response.response.errorCode).toBe(JoinQueueErrorCode.JOIN_QUEUE_ERROR_NONE);
    expect(response.response.errorMessage).toBe('');
    expect(redisAdapter.setUserLock.mock.calls[0][0]).toBe('userA');
    expect(redisAdapter.setUserLock.mock.calls[0][1]).toBe('aaaa');
  });

  test('Bad Request Join Queue', async () => {
    const redisAdapter = makeRedisAdapter();
    const handler = new JoinQueueHandler(redisAdapter);

    let request = makeRequest('userA', []);
    let response = await handler.handle(request);
    expect(response.response.errorCode).toBe(JoinQueueErrorCode.JOIN_QUEUE_BAD_REQUEST);
    expect(response.response.errorMessage).toBeTruthy();

    request = makeRequest('', [QuestionDifficulty.EASY]);
    response = await handler.handle(request);
    expect(response.response.errorCode).toBe(JoinQueueErrorCode.JOIN_QUEUE_INTERNAL_ERROR);
    expect(response.response.errorMessage).toBeTruthy();

    request = makeRequest(undefined, [QuestionDifficulty.EASY]);
    response = await handler.handle(request);
    expect(response.response.errorCode).toBe(JoinQueueErrorCode.JOIN_QUEUE_INTERNAL_ERROR);
    expect(response.response.errorMessage).toBeTruthy();
  });

  test('Already in Queue', async () => {
    const redisAdapter = makeRedisAdapter();
    const handler = new JoinQueueHandler(redisAdapter);

    redisAdapter.lockIfUnset.mockReturnValueOnce(false);

    const request = makeRequest('userA', [QuestionDifficulty.EASY]);
    const response = await handler.handle(request);
    expect(response.response.errorCode).toBe(JoinQueueErrorCode.JOIN_QUEUE_ALREADY_IN_QUEUE);
    expect(response.response.errorMessage).toBeTruthy();
  });

  test('Internal Error', async () => {
    const redisAdapter = makeRedisAdapter();
    const handler = new JoinQueueHandler(redisAdapter);

    redisAdapter.lockIfUnset.mockReturnValueOnce(true);
    redisAdapter.pushStream.mockReturnValueOnce(undefined);

    const request = makeRequest('', [QuestionDifficulty.EASY]);
    const response = await handler.handle(request);
    expect(response.response.errorCode).toBe(JoinQueueErrorCode.JOIN_QUEUE_INTERNAL_ERROR);
    expect(response.response.errorMessage).toBeTruthy();
  });
});
