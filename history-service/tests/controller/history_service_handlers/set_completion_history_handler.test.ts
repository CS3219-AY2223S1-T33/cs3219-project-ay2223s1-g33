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
  from '../../../src/controller/history_service_handlers/set_completion_history_handler';
import {
  makeMockLoopbackChannel,
  testCompletion,
  testQuestion,
  testUser,
} from '../test_util';
import {
  CreateCompletionRequest,
  CreateCompletionResponse,
  DeleteCompletionRequest,
  DeleteCompletionResponse,
  GetCompletionRequest,
  GetCompletionResponse,
} from '../../../src/proto/history-crud-service';

describe('Set Completion Submission Handler', () => {
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

  test('Create: Successful Set Attempt History', async () => {
    mockClient.getCompletion.mockImplementationOnce(
      async (request: GetCompletionRequest):
      Promise<GetCompletionResponse> => {
        expect(request)
          .toStrictEqual(testCompletion);
        return {
          completed: undefined,
          errorMessage: '',
        };
      },
    );
    mockClient.createCompletion.mockImplementationOnce(
      async (request: CreateCompletionRequest):
      Promise<CreateCompletionResponse> => {
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

  test('Delete: Successful Set Attempt History', async () => {
    mockClient.getCompletion.mockImplementationOnce(
      async (request: GetCompletionRequest):
      Promise<SetHistoryCompletionResponse> => {
        expect(request)
          .toStrictEqual(testCompletion);
        return {
          completed: testCompletion,
          errorMessage: '',
        };
      },
    );
    mockClient.deleteCompletion.mockImplementationOnce(
      async (request: DeleteCompletionRequest):
      Promise<DeleteCompletionResponse> => {
        expect(request.completed)
          .toStrictEqual(testCompletion);
        return {
          errorMessage: '',
        };
      },
    );

    const request = makeRequest(testUser.username, testQuestion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });

  test('Get: Bad Downstream Request', async () => {
    mockClient.getCompletion.mockImplementationOnce(
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

  test('Create: Bad Downstream Request', async () => {
    mockClient.getCompletion.mockImplementationOnce(
      async (request: GetCompletionRequest):
      Promise<GetCompletionResponse> => {
        expect(request)
          .toStrictEqual(testCompletion);
        return {
          completed: undefined,
          errorMessage: '',
        };
      },
    );
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

  test('Delete: Bad Downstream Request', async () => {
    mockClient.getCompletion.mockImplementationOnce(
      async (request: GetCompletionRequest):
      Promise<GetCompletionResponse> => {
        expect(request)
          .toStrictEqual(testCompletion);
        return {
          completed: testCompletion,
          errorMessage: '',
        };
      },
    );
    mockClient.deleteCompletion.mockImplementationOnce(
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

  test('Bad Request - Missing username', async () => {
    const makeUndefinedRequest = ():
    ApiRequest<SetHistoryCompletionRequest> => ({
      request: {
        completed: {
          username: '',
          questionId: testCompletion.questionId,
        },
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

  test('Bad Request - Missing questionId', async () => {
    const makeUndefinedRequest = ():
    ApiRequest<SetHistoryCompletionRequest> => ({
      request: {
        completed: {
          username: testCompletion.username,
          questionId: 0,
        },
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

  test('Get: Internal Error Occurred', async () => {
    mockClient.getCompletion.mockImplementationOnce(
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

  test('Create: Internal Error Occurred', async () => {
    mockClient.getCompletion.mockImplementationOnce(
      async (request: GetCompletionRequest):
      Promise<GetCompletionResponse> => {
        expect(request)
          .toStrictEqual(testCompletion);
        return {
          completed: undefined,
          errorMessage: '',
        };
      },
    );
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

  test('Delete: Internal Error Occurred', async () => {
    mockClient.getCompletion.mockImplementationOnce(
      async (request: GetCompletionRequest):
      Promise<GetCompletionResponse> => {
        expect(request)
          .toStrictEqual(testCompletion);
        return {
          completed: testCompletion,
          errorMessage: '',
        };
      },
    );
    mockClient.deleteCompletion.mockImplementationOnce(
      () => ({
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
