import { ApiRequest } from '../../../src/api_server/api_server_types';
import { GetCompletionRequest } from '../../../src/proto/history-crud-service';
import {
  makeMockCompletionStorage,
  makeMockQuestionClient,
  makeMockUserClient, testCompletion, testCompletionEntity, testPasswordUser, testQuestion,
} from '../test_util';
import { IStorage } from '../../../src/storage/storage';
import GetCompletionHandler
  from '../../../src/controller/history_crud_service_handlers/get_completion_handler';
import BaseHandler from '../../../src/controller/history_crud_service_handlers/base_handler';
import { PasswordUser, Question } from '../../../src/proto/types';

describe('Get Completion Handler', () => {
  const makeRequest = (username: string, questionId: number):
  ApiRequest<GetCompletionRequest> => ({
    request: {
      username,
      questionId,
    },
    headers: {},
  });

  const userClient = makeMockUserClient();
  const questionClient = makeMockQuestionClient();

  let mockCompletionStorage = makeMockCompletionStorage();
  let mockStorage: IStorage = {
    getAttemptStore: jest.fn(),
    getCompletionStore: jest.fn(() => mockCompletionStorage),
  };
  let handler = new GetCompletionHandler(mockStorage, userClient, questionClient);

  beforeEach(() => {
    jest.clearAllMocks();
    mockCompletionStorage = makeMockCompletionStorage();
    mockStorage = {
      getAttemptStore: jest.fn(),
      getCompletionStore: jest.fn(() => mockCompletionStorage),
    };
    handler = new GetCompletionHandler(mockStorage, userClient, questionClient);

    jest.spyOn(BaseHandler.prototype, 'getQuestion')
      .mockImplementation(
        () => new Promise<Question | undefined>((resolve) => { resolve(testQuestion); }),
      );
    jest.spyOn(BaseHandler.prototype, 'getUser')
      .mockImplementation(
        () => new Promise<PasswordUser | undefined>((resolve) => { resolve(testPasswordUser); }),
      );
    mockCompletionStorage.getCompletion.mockImplementation(
      () => testCompletionEntity,
    );
  });

  test('Successful Completion Retrieval', async () => {
    const request = makeRequest(testCompletion.username, testCompletion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.completed)
      .toStrictEqual(testCompletion);
  });

  test('Bad Request - Missing username', async () => {
    const request = makeRequest('', testCompletion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });

  test('Bad Request - Missing questionId', async () => {
    const request = makeRequest(testCompletion.username, 0);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });

  test('Invalid Get User Request', async () => {
    jest.spyOn(BaseHandler.prototype, 'getUser')
      .mockImplementation(
        () => new Promise<PasswordUser | undefined>((resolve) => { resolve(undefined); }),
      );

    const request = makeRequest(testCompletion.username, testCompletion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });

  test('Bad Get User Request', async () => {
    jest.spyOn(BaseHandler.prototype, 'getUser')
      .mockImplementation(
        () => { throw new Error(); },
      );

    const request = makeRequest(testCompletion.username, testCompletion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });

  test('Invalid Check Question Request', async () => {
    jest.spyOn(BaseHandler.prototype, 'getQuestion')
      .mockImplementation(
        () => new Promise<Question | undefined>((resolve) => { resolve(undefined); }),
      );

    const request = makeRequest(testCompletion.username, testCompletion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });

  test('Bad Check Question Request', async () => {
    jest.spyOn(BaseHandler.prototype, 'getQuestion')
      .mockImplementation(
        () => { throw new Error(); },
      );

    const request = makeRequest(testCompletion.username, testCompletion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });

  test('Bad Downstream Get Completion Request', async () => {
    mockCompletionStorage.getCompletion.mockImplementationOnce(
      () => { throw new Error(); },
    );

    const request = makeRequest(testCompletion.username, testCompletion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });

  test('User does not exit', async () => {
    mockCompletionStorage.getCompletion.mockImplementationOnce(
      () => undefined,
    );

    const request = makeRequest(testCompletion.username, testCompletion.questionId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(response.response.completed)
      .toBeUndefined();
  });
});
