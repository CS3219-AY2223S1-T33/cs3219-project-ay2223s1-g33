import { ApiRequest } from '../../../src/api_server/api_server_types';
import {
  GetAttemptSubmissionRequest,
  GetAttemptSubmissionResponse,
} from '../../../src/proto/history-service';
import { gatewayHeaderUsername, makeMockLoopbackChannel, testAttempt } from '../test_util';
import GetAttemptSubmissionHandler
  from '../../../src/controller/history_service_handlers/get_attempt_submission_handler';
import { IHistoryCrudService } from '../../../src/proto/history-crud-service.grpc-server';
import { ILoopbackServiceChannel, LoopbackServiceClient } from '../../../src/api_server/loopback_server_types';

describe('Get Attempt Submission Handler', () => {
  const makeRequest = (attemptId: number, username: string):
  ApiRequest<GetAttemptSubmissionRequest> => {
    const req: ApiRequest<GetAttemptSubmissionRequest> = {
      request: { attemptId },
      headers: {},
    };
    req.headers[gatewayHeaderUsername] = [username];
    return req;
  };

  let mockClient: any;
  let historyCrudClient: ILoopbackServiceChannel<IHistoryCrudService>;
  let handler: GetAttemptSubmissionHandler;

  beforeEach(() => {
    const { client, mock } = makeMockLoopbackChannel();
    historyCrudClient = { client: client as LoopbackServiceClient<IHistoryCrudService> };
    mockClient = mock;
    handler = new GetAttemptSubmissionHandler(historyCrudClient);
  });

  test('Successful Get Attempt Submission', async () => {
    mockClient.getAttempt.mockImplementationOnce(
      (request: GetAttemptSubmissionRequest):
      GetAttemptSubmissionResponse => {
        expect(request.attemptId)
          .toBe(testAttempt.attemptId);

        return {
          attempt: testAttempt,
          errorMessage: '',
        };
      },
    );

    const request = makeRequest(testAttempt.attemptId, testAttempt.users[0]);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.attempt)
      .toBe(testAttempt);
  });

  test('Bad Request', async () => {
    const badId = -1;
    mockClient.getAttempt.mockImplementationOnce(
      (request: GetAttemptSubmissionRequest):
      GetAttemptSubmissionResponse => {
        expect(request.attemptId)
          .toBe(badId);
        throw new Error();
      },
    );

    const request = makeRequest(badId, testAttempt.users[0]);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.attempt)
      .toBeUndefined();
  });

  test('Bad Request - W/O Header', async () => {
    const badId = -1;
    const makeNoHeaderRequest = (attemptId: number):
    ApiRequest<GetAttemptSubmissionRequest> => ({
      request: { attemptId },
      headers: {},
    });

    const request = makeNoHeaderRequest(badId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.attempt)
      .toBeUndefined();
  });

  test('Bad Downstream Request', async () => {
    mockClient.getAttempt.mockImplementationOnce(() => ({
      attempt: undefined,
      errorMessage: '',
    }))
      .mockImplementationOnce(() => ({
        attempt: testAttempt,
        errorMessage: undefined,
      }))
      .mockImplementationOnce(() => {
        throw new Error('Cannot connect downstream');
      });

    const request = makeRequest(testAttempt.attemptId, testAttempt.users[0]);
    const response1 = await handler.handle(request);
    expect(response1.response.errorMessage)
      .not
      .toBe('');
    expect(response1.response.attempt)
      .toBeUndefined();

    const response2 = await handler.handle(request);
    expect(response2.response.errorMessage)
      .not
      .toBe('');
    expect(response2.response.attempt)
      .toBeUndefined();

    const response3 = await handler.handle(request);
    expect(response3.response.errorMessage)
      .not
      .toBe('');
    expect(response3.response.attempt)
      .toBeUndefined();
  });
});
