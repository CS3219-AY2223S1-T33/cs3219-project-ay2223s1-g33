import { EditQuestionRequest } from '../../../src/proto/question-service';
import {
  makeMockQuestionStorage,
  makeStoredQuestion,
  makeTestQuestion,
  testData,
} from '../test_util';
import { Question } from '../../../src/proto/types';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import EditQuestionHandler from '../../../src/controller/question_service_handlers/edit_question_handler';
import { IStorage } from '../../../src/storage/storage';

describe('Edit User Handler', () => {
  const testDataSet2 = testData[1];
  const {
    questionId: testQuestionId2,
    name: testName2,
    difficulty: testDifficulty2,
    content: testContent2,
    solution: testSolution2,
    executionInput: testExecutionInput2,
  } = testDataSet2;

  const makeRequest = (question: Question | undefined): ApiRequest<EditQuestionRequest> => ({
    request: {
      question,
    },
    headers: {},
  });

  test('Successful Question Modification', async () => {
    const mockStore = makeMockQuestionStorage();
    const storage: IStorage = {
      getQuestionStore: jest.fn(() => mockStore),
    };

    const storedQuestionResult = makeStoredQuestion(
      testQuestionId2,
      testName2,
      testDifficulty2,
      testContent2,
      testSolution2,
      testExecutionInput2
    );
    mockStore.replaceQuestion.mockReturnValue(Promise.resolve(storedQuestionResult));
    const handler = new EditQuestionHandler(storage);

    const request = makeRequest(
      makeTestQuestion(
        testQuestionId2,
        testName2,
        testDifficulty2,
        testContent2,
        testSolution2,
        testExecutionInput2
      )
    );
    const response = await handler.handle(request);

    expect(response.response.errorMessage).toBe('');
    expect(response.response.question!.questionId).toBe(testQuestionId2);
    expect(response.response.question!.name).toBe(testName2);
    expect(response.response.question!.difficulty).toBe(testDifficulty2);
    expect(response.response.question!.content).toBe(testContent2);
    expect(response.response.question!.solution).toBe(testSolution2);
    expect(response.response.question!.solution).toBe(testSolution2);
    expect(response.response.question!.executionInput).toBe(testExecutionInput2);

    expect(mockStore.replaceQuestion.mock.calls.length).toBe(1);
    expect(mockStore.replaceQuestion.mock.calls[0][0]).toStrictEqual(storedQuestionResult);
  });

  test('Bad Request', async () => {
    const mockStore = makeMockQuestionStorage();
    const storage: IStorage = {
      getQuestionStore: jest.fn(() => mockStore),
    };

    const storedQuestionResult = makeStoredQuestion(
      testQuestionId2,
      testName2,
      testDifficulty2,
      testContent2,
      testSolution2,
      testExecutionInput2
    );
    mockStore.replaceQuestion.mockReturnValue(Promise.resolve(storedQuestionResult));
    const handler = new EditQuestionHandler(storage);

    let request = makeRequest(
      makeTestQuestion(
        0,
        testName2,
        testDifficulty2,
        testContent2,
        testSolution2,
        testExecutionInput2
      )
    );
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.replaceQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(
        testQuestionId2,
        '',
        testDifficulty2,
        testContent2,
        testSolution2,
        testExecutionInput2
      )
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.replaceQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(
        testQuestionId2,
        testName2,
        0,
        testContent2,
        testSolution2,
        testExecutionInput2
      )
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.replaceQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(
        testQuestionId2,
        testName2,
        -1,
        testContent2,
        testSolution2,
        testExecutionInput2
      )
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.replaceQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(
        testQuestionId2,
        testName2,
        testDifficulty2,
        '',
        testSolution2,
        testExecutionInput2
      )
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.replaceQuestion.mock.calls.length).toBe(0);

    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.replaceQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(
        testQuestionId2,
        testName2,
        testDifficulty2,
        testContent2,
        '',
        testExecutionInput2
      )
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.replaceQuestion.mock.calls.length).toBe(0);

    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.replaceQuestion.mock.calls.length).toBe(0);

    request = makeRequest(
      makeTestQuestion(testQuestionId2, testName2, testDifficulty2, testContent2, testSolution2, '')
    );
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.replaceQuestion.mock.calls.length).toBe(0);
  });

  const testErrorMessage = 'Test Error Message';
  test('Bad Database', async () => {
    const mockStore = makeMockQuestionStorage();
    const storage: IStorage = {
      getQuestionStore: jest.fn(() => mockStore),
    };

    mockStore.replaceQuestion.mockImplementationOnce(() => {
      throw new Error(testErrorMessage);
    });
    const handler = new EditQuestionHandler(storage);

    const request = makeRequest(
      makeTestQuestion(
        testQuestionId2,
        testName2,
        testDifficulty2,
        testContent2,
        testSolution2,
        testExecutionInput2
      )
    );
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.question).toBeUndefined();
    expect(mockStore.replaceQuestion.mock.calls.length).toBe(1);
  });
});
