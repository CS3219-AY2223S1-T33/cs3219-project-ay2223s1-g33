import {
  HistoryAttempt,
  PasswordUser,
  Question,
  QuestionDifficulty,
  User,
} from '../../src/proto/types';
import HistoryAttemptEntity from '../../src/db/history_entity';

const gatewayHeaderUsername = 'grpc-x-bearer-username';

const testDate = new Date('2022-10-10');
const testDateSeconds = testDate.getTime() / 1000;

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
  timestamp: testDateSeconds,
  users: [testUser.username],
  submission: 'Test submission',
};

const testHistoryAttemptEntity: HistoryAttemptEntity = {
  attemptId: testAttempt.attemptId,
  users: [testUser],
  questionId: testQuestion.questionId,
  submission: testAttempt.submission,
  language: testAttempt.language,
  createDateTime: testDate,
  updateDateTime: testDate,
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
  gatewayHeaderUsername,
  testDateSeconds,
  testQuestion,
  testAttempt,
  testHistoryAttemptEntity,
  testUser,
  testPasswordUser,
  makeMockAttemptStorage,
  makeMockLoopbackChannel,
};
