import { ApiRequest } from '../../../src/api_server/api_server_types';
import { CreateAttemptRequest } from '../../../src/proto/history-crud-service';
import {
  makeMockAttemptStorage, makeMockQuestionClient, makeMockUserClient,
  testAttempt, testDateSeconds,
  testHistoryAttemptEntity,
  testPasswordUser,
  testQuestion, testUser,
} from '../test_util';
import { IStorage } from '../../../src/storage/storage';
import CreateAttemptHandler
  from '../../../src/controller/history_crud_service_handlers/create_attempt_handler';
import { HistoryAttempt, PasswordUser, Question } from '../../../src/proto/types';
import BaseHandler from '../../../src/controller/history_crud_service_handlers/base_handler';

describe('Create Attempt Handler', () => {
  const makeRequest = (attempt: HistoryAttempt | undefined):
  ApiRequest<CreateAttemptRequest> => ({
    request: { attempt },
    headers: {},
  });

  const userClient = makeMockUserClient();
  const questionClient = makeMockQuestionClient();

  let mockAttemptStorage = makeMockAttemptStorage();
  let mockStorage: IStorage = {
    getAttemptStore: jest.fn(() => mockAttemptStorage),
    getCompletionStore: jest.fn(),
  };
  let handler = new CreateAttemptHandler(mockStorage, userClient, questionClient);

  beforeEach(() => {
    jest.clearAllMocks();
    mockAttemptStorage = makeMockAttemptStorage();
    mockStorage = {
      getAttemptStore: jest.fn(() => mockAttemptStorage),
      getCompletionStore: jest.fn(),
    };
    handler = new CreateAttemptHandler(mockStorage, userClient, questionClient);

    jest.spyOn(BaseHandler.prototype, 'getQuestion')
      .mockImplementation(
        () => new Promise<Question | undefined>((resolve) => { resolve(testQuestion); }),
      );
    jest.spyOn(BaseHandler.prototype, 'getUser')
      .mockImplementation(
        () => new Promise<PasswordUser | undefined>((resolve) => { resolve(testPasswordUser); }),
      );
    mockAttemptStorage.addAttempt.mockImplementation(
      () => testHistoryAttemptEntity,
    );
  });

  test('Successful Attempt Creation', async () => {
    const request = makeRequest(testAttempt);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.attempt)
      .toStrictEqual(testAttempt);
  });

  test('Bad Request - Missing question', async () => {
    const testBadAttempt: HistoryAttempt = {
      attemptId: 1,
      question: undefined,
      language: 'Test language',
      timestamp: testDateSeconds,
      users: [testUser.username],
      submission: 'Test submission',
    };

    const request = makeRequest(testBadAttempt);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.attempt)
      .toBeUndefined();
  });

  test('Invalid Question Request', async () => {
    jest.spyOn(BaseHandler.prototype, 'getQuestion')
      .mockImplementation(
        () => new Promise<Question | undefined>((resolve) => { resolve(undefined); }),
      );

    const request = makeRequest(testAttempt);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.attempt)
      .toBeUndefined();
  });

  test('Bad Downstream Request', async () => {
    mockAttemptStorage.addAttempt.mockImplementationOnce(
      () => { throw new Error(); },
    );
    const request = makeRequest(testAttempt);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.attempt)
      .toBeUndefined();
  });

  test('Internal Error', async () => {
    mockAttemptStorage.addAttempt.mockImplementationOnce(
      () => ({ createDateTime: undefined }),
    );

    const request = makeRequest(testAttempt);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.attempt)
      .toBeUndefined();
  });
});
