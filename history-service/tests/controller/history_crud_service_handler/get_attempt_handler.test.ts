import { ApiRequest } from '../../../src/api_server/api_server_types';
import { GetAttemptRequest } from '../../../src/proto/history-crud-service';
import {
  makeMockAttemptStorage,
  makeMockQuestionClient,
  makeMockUserClient,
  testAttempt,
  testAttemptResponse,
  testHistoryAttemptEntity,
  testPasswordUser,
  testQuestion,
  testUser,
} from '../test_util';
import { IStorage } from '../../../src/storage/storage';
import BaseHandler from '../../../src/controller/history_crud_service_handlers/base_handler';
import HistoryAttemptEntity from '../../../src/db/history_entity';
import GetAttemptHandler
  from '../../../src/controller/history_crud_service_handlers/get_attempt_handler';
import { PasswordUser, Question } from '../../../src/proto/types';

describe('Get Attempt Handler', () => {
  const makeRequest = (attemptId: number, username: string):
  ApiRequest<GetAttemptRequest> => ({
    request: { attemptId, username },
    headers: {},
  });

  const userClient = makeMockUserClient();
  const questionClient = makeMockQuestionClient();

  let mockAttemptStorage = makeMockAttemptStorage();
  let mockStorage: IStorage = {
    getAttemptStore: jest.fn(() => mockAttemptStorage),
    getCompletionStore: jest.fn(),
  };
  let handler = new GetAttemptHandler(mockStorage, userClient, questionClient);

  beforeEach(() => {
    jest.clearAllMocks();
    mockAttemptStorage = makeMockAttemptStorage();
    mockStorage = {
      getAttemptStore: jest.fn(() => mockAttemptStorage),
      getCompletionStore: jest.fn(),
    };
    handler = new GetAttemptHandler(mockStorage, userClient, questionClient);

    jest.spyOn(BaseHandler.prototype, 'getQuestion')
      .mockImplementation(
        () => new Promise<Question | undefined>((resolve) => { resolve(testQuestion); }),
      );
    jest.spyOn(BaseHandler.prototype, 'getUser')
      .mockImplementation(
        () => new Promise<PasswordUser | undefined>((resolve) => { resolve(testPasswordUser); }),
      );
    mockAttemptStorage.getAttempt.mockImplementation(
      (): HistoryAttemptEntity => testHistoryAttemptEntity,
    );
  });

  test('Successful Get Attempt', async () => {
    const request = makeRequest(testAttempt.attemptId, testUser.username);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.attempt)
      .toStrictEqual(testAttemptResponse);
  });

  test('Bad Request', async () => {
    const request = makeRequest(0, testUser.username);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.attempt)
      .toBeUndefined();
  });

  test('Bad Downstream Request', async () => {
    mockAttemptStorage.getAttempt.mockImplementationOnce(
      () => undefined,
    );

    const request = makeRequest(testAttempt.attemptId, testUser.username);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.attempt)
      .toBeUndefined();
  });

  test('Empty Username', async () => {
    const request = makeRequest(testAttempt.attemptId, '');
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.attempt)
      .toStrictEqual(testAttemptResponse);
  });

  test('No Matching Username', async () => {
    const request = makeRequest(testAttempt.attemptId, 'FakeUsername');
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.attempt)
      .toBeUndefined();
  });

  test('Bad Downstream - Undefined User', async () => {
    jest.spyOn(BaseHandler.prototype, 'fetchUsersFor')
      .mockImplementation(
        async () => [undefined],
      );
    const request = makeRequest(testAttempt.attemptId, testUser.username);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.attempt)
      .toBeUndefined();
  });
});
