import { ApiRequest } from '../../../src/api_server/api_server_types';
import {
  SetHistoryCompletionRequest,
  SetHistoryCompletionResponse,
} from '../../../src/proto/history-service';
import {
  ILoopbackServiceChannel,
  LoopbackServiceClient,
} from '../../../src/api_server/loopback_server_types';
import { IHistoryCrudService } from '../../../src/proto/history-crud-service.grpc-server';
import SetHistoryCompletionHandler
  from '../../../src/controller/history_service_handlers/create_completion_submission_handler';
import {
  makeMockLoopbackChannel,
  testCompletion,
  testQuestion,
  testUser,
} from '../test_util';

describe('Create Completion Submission Handler', () => {
  const makeRequest = (username: string, questionId: number):
  ApiRequest<SetHistoryCompletionRequest> => ({
    request: {
      completed: {
        username,
        questionId,
      },
    },
    headers: {},
  });

  let mockClient: any;
  let historyCrudClient: ILoopbackServiceChannel<IHistoryCrudService>;
  let handler: SetHistoryCompletionHandler;

  beforeEach(() => {
    const { client, mock } = makeMockLoopbackChannel();
    historyCrudClient = { client: client as LoopbackServiceClient<IHistoryCrudService> };
    mockClient = mock;
    handler = new SetHistoryCompletionHandler(historyCrudClient);
  });

  test('Successful Get Attempt History', async () => {
    mockClient.createCompletion.mockImplementationOnce(
      async (request: SetHistoryCompletionRequest):
      Promise<SetHistoryCompletionResponse> => {
        expect(request.completed)
          .toStrictEqual(testCompletion);

        return {
          completed: testCompletion,
          errorMessage: '',
        };
      },
    );

    const request = makeRequest(testUser.username, testQuestion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.completed)
      .toStrictEqual(testCompletion);
  });

  test('Bad Downstream Request', async () => {
    mockClient.createCompletion.mockImplementationOnce(
      () => {
        throw new Error();
      },
    );

    const request = makeRequest(testUser.username, testQuestion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });

  test('Bad Request', async () => {
    const makeUndefinedRequest = ():
    ApiRequest<SetHistoryCompletionRequest> => ({
      request: {
        completed: undefined,
      },
      headers: {},
    });
    const request = makeUndefinedRequest();
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });

  test('Internal Error Occurred', async () => {
    mockClient.createCompletion.mockImplementationOnce(
      () => ({
        completed: undefined,
        errorMessage: 'Internal Error',
      }),
    );

    const request = makeRequest(testUser.username, testQuestion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });
});
