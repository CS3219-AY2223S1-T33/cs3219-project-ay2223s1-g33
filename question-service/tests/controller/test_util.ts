import { StoredQuestion } from '../../src/model/question_store_model';
import { QuestionDifficulty, Question } from '../../src/proto/types';

function makeMockQuestionStorage() {
  return {
    addQuestion: jest.fn(),
    removeQuestion: jest.fn(),
    replaceQuestion: jest.fn(),
    getQuestion: jest.fn(),
    getQuestionByName: jest.fn(),
    getRandomQuestionByDifficulty: jest.fn(),
    getAllQuestion: jest.fn(),
  };
}

function makeTestQuestion(
  questionId: number,
  name: string,
  difficulty: QuestionDifficulty,
  content: string,
  solution: string,
  executionInput: string,
): Question {
  return {
    questionId,
    name,
    difficulty,
    content,
    solution,
    executionInput,
  };
}

function makeStoredQuestion(
  questionId: number,
  name: string,
  difficulty: QuestionDifficulty,
  content: string,
  solution: string,
  executionInput: string,
): StoredQuestion {
  return {
    questionId,
    name,
    difficulty,
    content,
    solution,
    executionInput,
  };
}

const testData: Question[] = [
  {
    questionId: 10,
    name: 'Question 1',
    difficulty: QuestionDifficulty.EASY,
    content: 'test Content1',
    solution: 'test Solution1',
    executionInput: 'input1',
  },
  {
    questionId: 99,
    name: 'Question 2',
    difficulty: QuestionDifficulty.MEDIUM,
    content: 'test Content2',
    solution: 'test Solution2',
    executionInput: 'input2',
  },
];

function makeRedisStreamProducer() {
  return {
    pushMessage: jest.fn(),
  };
}

export {
  makeMockQuestionStorage,
  makeRedisStreamProducer,
  makeStoredQuestion,
  makeTestQuestion,
  testData,
};
