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
import { GetAttemptsRequest, GetAttemptsResponse } from '../../../src/proto/history-crud-service';
import { ILoopbackServiceChannel, LoopbackServiceClient } from '../../../src/api_server/loopback_server_types';
import { IHistoryCrudService } from '../../../src/proto/history-crud-service.grpc-server';

describe('Get Attempt History Handler', () => {
  const makeRequest = (limit: number, offset: number, questionId: number, username: string):
  ApiRequest<GetAttemptHistoryRequest> => {
    const req: ApiRequest<GetAttemptHistoryRequest> = {
      request: {
        limit,
        offset,
        questionId,
      },
      headers: {},
    };
    req.headers[gatewayHeaderUsername] = [username];
    return req;
  };

  let mockClient: any;
  let historyCrudClient: ILoopbackServiceChannel<IHistoryCrudService>;
  let handler: GetAttemptHistoryHandler;

  beforeEach(() => {
    const { client, mock } = makeMockLoopbackChannel();
    historyCrudClient = { client: client as LoopbackServiceClient<IHistoryCrudService> };
    mockClient = mock;
    handler = new GetAttemptHistoryHandler(historyCrudClient);
  });

  test('Successful Get Attempt History', async () => {
    mockClient.getAttempts.mockImplementationOnce(async (request: GetAttemptsRequest):
    Promise<GetAttemptsResponse> => {
      expect(request.questionId)
        .toBe(testQuestion.questionId);
      expect(request.username)
        .toBe(testAttempt.users[0]);

      return {
        attempts: [testAttempt],
        totalCount: 1,
        errorMessage: '',
      };
    });

    const request = makeRequest(1, 1, testQuestion.questionId, testAttempt.users[0]);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.attempts.length)
      .toBe(1);
    expect(response.response.attempts[0])
      .toStrictEqual(testAttempt);
  });

  test('Bad Request', async () => {
    mockClient.getAttempts.mockImplementationOnce(async (request: GetAttemptsRequest):
    Promise<GetAttemptsResponse> => {
      expect(request.questionId)
        .toBe(testQuestion.questionId);
      expect(request.username)
        .toBe('');
      throw new Error();
    });

    const request = makeRequest(1, 1, testQuestion.questionId, '');
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.totalCount)
      .toBe(0);
    expect(response.response.attempts)
      .toStrictEqual([]);
  });

  test('Bad Request - W/O Header', async () => {
    const makeNoHeaderRequest = (limit: number, offset: number, questionId: number):
    ApiRequest<GetAttemptHistoryRequest> => ({
      request: {
        limit,
        offset,
        questionId,
      },
      headers: {},
    });

    const request = makeNoHeaderRequest(1, 1, testQuestion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.totalCount)
      .toBe(0);
    expect(response.response.attempts)
      .toStrictEqual([]);
  });

  test('Bad Downstream Request', async () => {
    mockClient.getAttempts.mockImplementationOnce(() => (
      { errorMessage: undefined }
    )).mockImplementationOnce(() => {
      throw new Error('Cannot connect downstream');
    });

    const request = makeRequest(1, 1, testQuestion.questionId, testAttempt.users[0]);
    const response1 = await handler.handle(request);
    expect(response1.response.errorMessage)
      .not
      .toBe('');
    expect(response1.response.totalCount)
      .toBe(0);
    expect(response1.response.attempts)
      .toStrictEqual([]);

    const response2 = await handler.handle(request);
    expect(response2.response.errorMessage)
      .not
      .toBe('');
    expect(response2.response.totalCount)
      .toBe(0);
    expect(response2.response.attempts)
      .toStrictEqual([]);
  });
});
