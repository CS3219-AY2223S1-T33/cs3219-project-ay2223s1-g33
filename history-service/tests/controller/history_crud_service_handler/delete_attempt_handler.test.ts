import {
  DeleteAttemptRequest,
} from '../../../src/proto/history-crud-service';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import { makeMockAttemptStorage, testAttempt } from '../test_util';
import { IStorage } from '../../../src/storage/storage';
import DeleteAttemptHandler
  from '../../../src/controller/history_crud_service_handlers/delete_attempt_handler';

describe('Delete Attempt Handler', () => {
  const makeRequest = (attemptId: number):
  ApiRequest<DeleteAttemptRequest> => ({
    request: { attemptId },
    headers: {},
  });

  let mockAttemptStorage = makeMockAttemptStorage();
  let mockStorage: IStorage = {
    getAttemptStore: jest.fn(() => mockAttemptStorage),
    getCompletionStore: jest.fn(),
  };
  let handler = new DeleteAttemptHandler(mockStorage);

  beforeEach(() => {
    jest.clearAllMocks();
    mockAttemptStorage = makeMockAttemptStorage();
    mockStorage = {
      getAttemptStore: jest.fn(() => mockAttemptStorage),
      getCompletionStore: jest.fn(),
    };
    handler = new DeleteAttemptHandler(mockStorage);
  });

  test('Successful Attempt Deletion', async () => {
    const request = makeRequest(testAttempt.attemptId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .toBe('');
    expect(mockAttemptStorage.removeAttempt.mock.calls.length)
      .toBe(1);
    expect(mockAttemptStorage.removeAttempt.mock.lastCall![0])
      .toBe(testAttempt.attemptId);
  });

  test('Bad Attempt Id Deletion Request', async () => {
    const request = makeRequest(-2);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(mockAttemptStorage.removeAttempt.mock.calls.length)
      .toBe(0); // Client not touched
    expect(mockAttemptStorage.removeAttempt.mock.lastCall)
      .toBe(undefined);
  });

  test('DB Error Deletion Request', async () => {
    mockAttemptStorage.removeAttempt.mockImplementationOnce(() => {
      throw new Error();
    });

    const request = makeRequest(testAttempt.attemptId);
    const response = await handler.handle(request);
    expect(response.response.errorMessage)
      .not
      .toBe('');
    expect(mockAttemptStorage.removeAttempt.mock.calls.length)
      .toBe(1);
    expect(mockAttemptStorage.removeAttempt.mock.lastCall![0])
      .toBe(testAttempt.attemptId);
  });
});
