import { ApiRequest } from '../../../src/api_server/api_server_types';
import DeleteQuestionHandler from '../../../src/controller/question_service_handlers/delete_question_handler';
import { DeleteQuestionRequest } from '../../../src/proto/question-service';
import { IStorage } from '../../../src/storage/storage';
import { makeMockQuestionStorage, makeRedisStreamProducer, testData } from '../test_util';

describe('Delete User Handler', () => {
  const testDataSet1 = testData[0];
  const { questionId: testQuestionId1 } = testDataSet1;
  const redis = makeRedisStreamProducer();

  const makeRequest = (questionId: number): ApiRequest<DeleteQuestionRequest> => ({
    request: { questionId },
    headers: {},
  });

  test('Successful Question Creation', async () => {
    const mockStore = makeMockQuestionStorage();
    const storage: IStorage = {
      getQuestionStore: jest.fn(() => mockStore),
    };

    const handler = new DeleteQuestionHandler(storage, redis);

    const request = makeRequest(testQuestionId1);

    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(mockStore.removeQuestion.mock.calls.length).toBe(1);
    expect(mockStore.removeQuestion.mock.lastCall![0]).toBe(testQuestionId1);
  });

  test('Bad Request', async () => {
    const mockStore = makeMockQuestionStorage();
    const storage: IStorage = {
      getQuestionStore: jest.fn(() => mockStore),
    };

    const handler = new DeleteQuestionHandler(storage, redis);
    const request = makeRequest(-1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
  });

  const testErrorMessage = 'Test Error Message';
  test('Bad Database', async () => {
    const mockStore = makeMockQuestionStorage();
    const storage: IStorage = {
      getQuestionStore: jest.fn(() => mockStore),
    };

    mockStore.removeQuestion.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });
    const handler = new DeleteQuestionHandler(storage, redis);

    const request = makeRequest(testQuestionId1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(mockStore.removeQuestion.mock.lastCall![0]).toBe(testQuestionId1);
    expect(mockStore.removeQuestion.mock.calls.length).toBe(1);
  });
});
