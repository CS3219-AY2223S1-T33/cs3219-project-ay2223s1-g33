import { ApiRequest } from '../../../src/api_server/api_server_types';
import GetQuestionHandler from '../../../src/controller/question_service_handlers/get_question_handler';
import { GetQuestionRequest } from '../../../src/proto/question-service';
import { Question } from '../../../src/proto/types';
import { IStorage } from '../../../src/storage/storage';
import {
  makeMockQuestionStorage,
  makeStoredQuestion,
  makeTestQuestion,
  testData,
} from '../test_util';

describe('Get Question Handler', () => {
  const testDataSet1 = testData[0];
  const {
    questionId: testQuestionId1,
    name: testName1,
    difficulty: testDifficulty1,
    content: testContent1,
    solution: testSolution1,
    executionInput: testExecutionInput1,
  } = testDataSet1;

  const makeRequest = (question: Question | undefined): ApiRequest<GetQuestionRequest> => ({
    request: { question },
    headers: {},
  });

  test('Successful Question GET', async () => {
    const mockStore = makeMockQuestionStorage();
    const storage: IStorage = {
      getQuestionStore: jest.fn(() => mockStore),
    };

    const storedQuestionResult = makeStoredQuestion(
      testQuestionId1,
      testName1,
      testDifficulty1,
      testContent1,
      testSolution1,
      testExecutionInput1,
    );
    mockStore.getQuestion.mockReturnValue(storedQuestionResult);
    mockStore.getQuestionByName.mockReturnValue(storedQuestionResult);
    mockStore.getRandomQuestionByDifficulty.mockReturnValue(storedQuestionResult);

    const handler = new GetQuestionHandler(storage);

    let request = makeRequest(makeTestQuestion(testQuestionId1, '', -1, '', '', ''));
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.question!.questionId).toBe(testQuestionId1);
    expect(mockStore.getQuestion.mock.calls.length).toBe(1);
    expect(mockStore.getQuestionByName.mock.calls.length).toBe(0);
    expect(mockStore.getQuestion.mock.lastCall![0]).toBe(testQuestionId1);

    request = makeRequest(makeTestQuestion(-1, testName1, -1, '', '', ''));
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.question!.questionId).toBe(testQuestionId1);
    expect(mockStore.getQuestion.mock.calls.length).toBe(1);
    expect(mockStore.getQuestionByName.mock.calls.length).toBe(1);
    expect(mockStore.getQuestionByName.mock.lastCall![0]).toBe(testName1);

    request = makeRequest(makeTestQuestion(-1, '', testDifficulty1, '', '', ''));
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.question!.questionId).toBe(testQuestionId1);
    expect(mockStore.getQuestion.mock.calls.length).toBe(1);
    expect(mockStore.getRandomQuestionByDifficulty.mock.calls.length).toBe(1);
    expect(mockStore.getQuestionByName.mock.lastCall![0]).toBe(testName1);
  });

  test('Bad Request', async () => {
    const mockStore = makeMockQuestionStorage();
    const storage: IStorage = {
      getQuestionStore: jest.fn(() => mockStore),
    };

    const handler = new GetQuestionHandler(storage);

    const request = makeRequest(makeTestQuestion(-1, '', -1, '', '', ''));
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
  });

  const testErrorMessage = 'Test Error Message';
  test('Bad Database', async () => {
    const mockStore = makeMockQuestionStorage();
    const storage: IStorage = {
      getQuestionStore: jest.fn(() => mockStore),
    };

    mockStore.getQuestion.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });
    mockStore.getQuestionByName.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });

    const handler = new GetQuestionHandler(storage);
    let request = makeRequest(makeTestQuestion(testQuestionId1, '', -1, '', '', ''));
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(mockStore.getQuestion.mock.calls.length).toBe(1);
    expect(mockStore.getQuestion.mock.lastCall![0]).toBe(testQuestionId1);

    request = makeRequest(makeTestQuestion(-1, testName1, -1, '', '', ''));
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(mockStore.getQuestionByName.mock.calls.length).toBe(1);
    expect(mockStore.getQuestionByName.mock.lastCall![0]).toBe(testName1);
  });
});
