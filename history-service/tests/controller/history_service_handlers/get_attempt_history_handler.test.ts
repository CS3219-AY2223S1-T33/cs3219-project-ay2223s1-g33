import {
  gatewayHeaderUsername,
  makeMockLoopbackChannel,
  testAttempt,
  testQuestion,
} from '../test_util';
import { GetAttemptHistoryRequest } from '../../../src/proto/history-service';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import GetAttemptHistoryHandler
  from '../../../src/controller/history_service_handlers/get_attempt_history_handler';
import {
  GetAttemptsRequest,
  GetAttemptsResponse,
} from '../../../src/proto/history-crud-service';

describe('Get Attempt History Handler', () => {
  const makeRequest = (limit: number, offset: number, questionId: number, username: string):
  ApiRequest<GetAttemptHistoryRequest> => {
    const req: ApiRequest<GetAttemptHistoryRequest> = {
      request: { limit, offset, questionId },
      headers: {},
    };
    req.headers[gatewayHeaderUsername] = [username];
    return req;
  };

  let historyCrudClient = makeMockLoopbackChannel();
  let handler = new GetAttemptHistoryHandler(historyCrudClient);

  beforeEach(() => {
    historyCrudClient = makeMockLoopbackChannel();
    handler = new GetAttemptHistoryHandler(historyCrudClient);
  });

  test('Successful Get Attempt History', async () => {
    historyCrudClient.callRoute.mockImplementationOnce((route: string, request: GetAttemptsRequest):
    GetAttemptsResponse => {
      expect(route).toBe('getAttempts');
      expect(request.questionId).toBe(testQuestion.questionId);
      expect(request.username).toBe(testAttempt.users[0]);

      return {
        attempts: [testAttempt],
        totalCount: 1,
        errorMessage: '',
      };
    });

    const request = makeRequest(1, 1, testQuestion.questionId, testAttempt.users[0]);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.attempts.length).toBe(1);
    expect(response.response.attempts[0]).toStrictEqual(testAttempt);
  });

  test('Bad Request', async () => {
    historyCrudClient.callRoute.mockImplementationOnce((route: string, request: GetAttemptsRequest):
    GetAttemptsResponse => {
      expect(route).toBe('getAttempts');
      expect(request.questionId).toBe(testQuestion.questionId);
      expect(request.username).toBe('');
      throw new Error();
    });

    const request = makeRequest(1, 1, testQuestion.questionId, '');
    const response = await handler.handle(request);
    expect(response.response.errorMessage).not.toBe('');
    expect(response.response.totalCount).toBe(0);
    expect(response.response.attempts).toStrictEqual([]);
  });

  test('Bad Downstream Request', async () => {
    historyCrudClient.callRoute.mockImplementationOnce(() => {
      throw new Error('Cannot connect downstream');
    });

    const request = makeRequest(1, 1, testQuestion.questionId, testAttempt.users[0]);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).not.toBe('');
    expect(response.response.totalCount).toBe(0);
    expect(response.response.attempts).toStrictEqual([]);
  });
});
