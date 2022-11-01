import { ApiRequest } from '../../../src/api_server/api_server_types';
import { GetAttemptsRequest } from '../../../src/proto/history-crud-service';
import {
  makeMockAttemptStorage,
  makeMockQuestionClient,
  makeMockUserClient,
  testAttemptResponse,
  testHistoryAttemptEntity,
  testPasswordUser,
  testQuestion,
  testUser,
} from '../test_util';
import { AttemptStoreSearchResult, IStorage } from '../../../src/storage/storage';
import BaseHandler from '../../../src/controller/history_crud_service_handlers/base_handler';
import GetAttemptsHandler
  from '../../../src/controller/history_crud_service_handlers/get_attempts_handler';
import { PasswordUser, Question } from '../../../src/proto/types';

describe('Get Attempts Handler', () => {
  const makeRequest = (
    limit: number,
    offset: number,
    questionId: number,
    username: string,
    userId: number,
    shouldOmitSubmission: boolean,
  ):
  ApiRequest<GetAttemptsRequest> => ({
    request: {
      limit,
      offset,
      questionId,
      username,
      userId,
      shouldOmitSubmission,
    },
    headers: {},
  });

  const userClient = makeMockUserClient();
  const questionClient = makeMockQuestionClient();

  let mockAttemptsStorage = makeMockAttemptStorage();
  let mockStorage: IStorage = {
    getAttemptStore: jest.fn(() => mockAttemptsStorage),
    getCompletionStore: jest.fn(),
  };
  let handler = new GetAttemptsHandler(mockStorage, userClient, questionClient);

  beforeEach(() => {
    jest.clearAllMocks();
    mockAttemptsStorage = makeMockAttemptStorage();
    mockStorage = {
      getAttemptStore: jest.fn(() => mockAttemptsStorage),
      getCompletionStore: jest.fn(),
    };
    handler = new GetAttemptsHandler(mockStorage, userClient, questionClient);

    jest.spyOn(BaseHandler.prototype, 'getQuestion')
      .mockImplementation(
        () => new Promise<Question | undefined>((resolve) => { resolve(testQuestion); }),
      );
    jest.spyOn(BaseHandler.prototype, 'getUser')
      .mockImplementation(
        () => new Promise<PasswordUser | undefined>((resolve) => { resolve(testPasswordUser); }),
      );
    mockAttemptsStorage.getAttemptsByUserIdAndQuestionId.mockImplementation(
      (): AttemptStoreSearchResult => ({
        attempts: [testHistoryAttemptEntity],
        totalCount: 1,
      }),
    );
    mockAttemptsStorage.getAttemptsByUserId.mockImplementation(
      (): AttemptStoreSearchResult => ({
        attempts: [testHistoryAttemptEntity, testHistoryAttemptEntity],
        totalCount: 2,
      }),
    );
  });

  test('Successful Get Attempts', async () => {
    const request = makeRequest(
      1,
      1,
      testQuestion.questionId,
      testUser.username,
      testUser.userId,
      false,
    );
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.totalCount)
      .toBe(1);
    expect(response.response.attempts)
      .toStrictEqual([testAttemptResponse]);
  });

  test('Successful Get Attempts - No username', async () => {
    const request = makeRequest(
      1,
      0,
      testQuestion.questionId,
      '',
      testUser.userId,
      false,
    );
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.totalCount)
      .toBe(1);
    expect(response.response.attempts)
      .toStrictEqual([testAttemptResponse]);
  });

  test('Successful Get Attempts - No question', async () => {
    const request = makeRequest(
      1,
      0,
      0,
      testUser.username,
      testUser.userId,
      false,
    );
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.totalCount)
      .toBe(2);
    expect(response.response.attempts)
      .toStrictEqual([testAttemptResponse, testAttemptResponse]);
  });

  test('Bad Request Attempts - Invalid UserId & Name', async () => {
    const request = makeRequest(
      1,
      0,
      testQuestion.questionId,
      '',
      0,
      false,
    );
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.totalCount)
      .toBe(0);
    expect(response.response.attempts)
      .toStrictEqual([]);
  });

  test('Bad Request Attempts - Invalid Username', async () => {
    const request = makeRequest(
      1,
      0,
      testQuestion.questionId,
      'FakeUsername',
      testUser.userId,
      false,
    );
    jest.spyOn(BaseHandler.prototype, 'getUser')
      .mockImplementation(
        () => new Promise<PasswordUser | undefined>((resolve) => { resolve(undefined); }),
      );

    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.totalCount)
      .toBe(0);
    expect(response.response.attempts)
      .toStrictEqual([]);
  });
});
