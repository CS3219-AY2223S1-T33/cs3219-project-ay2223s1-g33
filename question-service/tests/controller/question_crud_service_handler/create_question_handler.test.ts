import CreateQuestionHandler from '../../../src/controller/question_service_handlers/create_question_handler';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import { CreateQuestionRequest } from '../../../src/proto/question-service';
import { IStorage } from '../../../src/storage/storage';
import { Question } from '../../../src/proto/types';
import {
  makeMockQuestionStorage,
  makeStoredQuestion,
  makeTestQuestion,
  testData,
} from '../test_util';

describe('Create Attempt Handler', () => {
  const testDataSet1 = testData[0];
  const {
    questionId: testQuestionId1,
    name: testName1,
    difficulty: testDifficulty1,
    content: testContent1,
    solution: testSolution1,
    executionInput: testExecutionInput1,
  } = testDataSet1;

  const makeRequest = (question: Question): ApiRequest<CreateQuestionRequest> => ({
    request: { question },
    headers: {},
  });

  test('Successful Question Creation', async () => {
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
      testExecutionInput1
    );
    mockStore.addQuestion.mockReturnValue(Promise.resolve(storedQuestionResult));
    const handler = new CreateQuestionHandler(storage);

    const request = makeRequest(
      makeTestQuestion(
        testQuestionId1,
        testName1,
        testDifficulty1,
        testContent1,
        testSolution1,
        testExecutionInput1
      )
    );
    const response = await handler.handle(request);

    expect(response.response.errorMessage).toBe('');
    expect(response.response.question!.questionId).toBe(testQuestionId1);
    expect(response.response.question!.name).toBe(testName1);
    expect(response.response.question!.difficulty).toBe(testDifficulty1);
    expect(response.response.question!.content).toBe(testContent1);
    expect(response.response.question!.solution).toBe(testSolution1);
    expect(response.response.question!.solution).toBe(testSolution1);
    expect(response.response.question!.executionInput).toBe(testExecutionInput1);
    expect(mockStore.addQuestion.mock.calls.length).toBe(1);
  });

  test('Bad Request', async () => {
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
      testExecutionInput1
    );
    mockStore.addQuestion.mockReturnValue(Promise.resolve(storedQuestionResult));
    const handler = new CreateQuestionHandler(storage);

    let request = makeRequest(
      makeTestQuestion(
        testQuestionId1,
        '',
        testDifficulty1,
        testContent1,
        testSolution1,
        testExecutionInput1
      )
    );
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.addQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(
        testQuestionId1,
        testName1,
        0,
        testContent1,
        testSolution1,
        testExecutionInput1
      )
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.addQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(
        testQuestionId1,
        testName1,
        -1,
        testContent1,
        testSolution1,
        testExecutionInput1
      )
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.addQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(
        testQuestionId1,
        testName1,
        testDifficulty1,
        '',
        testSolution1,
        testExecutionInput1
      )
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.addQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(
        testQuestionId1,
        testName1,
        testDifficulty1,
        testContent1,
        '',
        testExecutionInput1
      )
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.addQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(testQuestionId1, testName1, testDifficulty1, testContent1, testSolution1, '')
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.addQuestion.mock.calls.length).toBe(0);
  });

  const testErrorMessage = 'Test Error Message';
  test('Bad Database', async () => {
    const mockStore = makeMockQuestionStorage();
    const storage: IStorage = {
      getQuestionStore: jest.fn(() => mockStore),
    };
    mockStore.addQuestion.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });
    const handler = new CreateQuestionHandler(storage);

    const request = makeRequest(
      makeTestQuestion(
        testQuestionId1,
        testName1,
        testDifficulty1,
        testContent1,
        testSolution1,
        testExecutionInput1
      )
    );

    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.addQuestion.mock.calls.length).toBe(1);
  });
});
