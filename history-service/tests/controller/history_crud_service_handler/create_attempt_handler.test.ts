import { ChannelCredentials } from '@grpc/grpc-js';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import { CreateAttemptRequest } from '../../../src/proto/history-crud-service';
import {
  makeMockAttemptStorage,
  testAttempt, testDateSeconds,
  testHistoryAttemptEntity,
  testPasswordUser,
  testQuestion, testUser,
} from '../test_util';
import { IStorage } from '../../../src/storage/storage';
import CreateAttemptHandler
  from '../../../src/controller/history_crud_service_handlers/create_attempt_handler';
import { UserCrudServiceClient } from '../../../src/proto/user-crud-service.grpc-client';
import { QuestionServiceClient } from '../../../src/proto/question-service.grpc-client';
import { HistoryAttempt } from '../../../src/proto/types';
import BaseHandler from '../../../src/controller/history_crud_service_handlers/base_handler';
import HistoryAttemptEntity from '../../../src/db/history_entity';

describe('Get Attempt Handler', () => {
  const makeRequest = (attempt: HistoryAttempt | undefined):
  ApiRequest<CreateAttemptRequest> => ({
    request: { attempt },
    headers: {},
  });

  let mockAttemptStorage = makeMockAttemptStorage();
  let mockStorage: IStorage = {
    getAttemptStore: jest.fn(() => mockAttemptStorage),
  };
  const userClient = new UserCrudServiceClient(
    'userServiceUrl',
    ChannelCredentials.createInsecure(),
    {},
    {},
  );
  const questionClient = new QuestionServiceClient(
    'questionServiceUrl',
    ChannelCredentials.createInsecure(),
    {},
    {},
  );
  let handler = new CreateAttemptHandler(mockStorage, userClient, questionClient);

  beforeEach(() => {
    jest.clearAllMocks();
    mockAttemptStorage = makeMockAttemptStorage();
    mockStorage = {
      getAttemptStore: jest.fn(() => mockAttemptStorage),
    };
    handler = new CreateAttemptHandler(mockStorage, userClient, questionClient);

    jest.spyOn(BaseHandler.prototype, 'getQuestion')
      .mockImplementation(
        () => testQuestion,
      );
    jest.spyOn(BaseHandler.prototype, 'getUser')
      .mockImplementation(
        () => testPasswordUser,
      );
    mockAttemptStorage.addAttempt.mockImplementation(
      (): HistoryAttemptEntity => testHistoryAttemptEntity,
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
        () => undefined,
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
