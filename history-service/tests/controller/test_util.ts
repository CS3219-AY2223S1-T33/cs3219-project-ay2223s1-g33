import {
  HistoryAttempt,
  PasswordUser,
  Question,
  QuestionDifficulty,
  User,
} from '../../src/proto/types';

const testUser: User = {
  userId: 1,
  username: 'johnny@mail.com',
  nickname: 'Johnny',
};

const testPasswordUser: PasswordUser = {
  userInfo: testUser,
  password: 'JohnnyPassword',
};

const testQuestion: Question = {
  questionId: 1,
  name: 'Test Name',
  difficulty: QuestionDifficulty.EASY,
  content: 'Test Content',
  solution: 'Test Solution',
};

const testAttempt: HistoryAttempt = {
  attemptId: 1,
  question: testQuestion,
  language: 'Test language',
  timestamp: 1,
  users: ['Johnny', 'Thomas'],
  submission: 'Test submission',
};

function makeMockAttemptStorage() {
  return {
    addAttempt: jest.fn(),
    removeAttempt: jest.fn(),
    getAttempt: jest.fn(),
    getAttemptsByUserId: jest.fn(),
    getAttemptsByUserIdAndQuestionId: jest.fn(),
    removeAllOfHistoryOwner: jest.fn(),
    removeHistoryByQuestionId: jest.fn(),
  };
}

function makeMockLoopbackChannel() {
  return {
    registerServiceRoutes: jest.fn(),
    callRoute: jest.fn(),
  };
}

export {
  testQuestion,
  testAttempt,
  testUser,
  testPasswordUser,
  makeMockAttemptStorage,
  makeMockLoopbackChannel,
};
