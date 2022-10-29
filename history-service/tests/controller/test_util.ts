import { ChannelCredentials, handleUnaryCall } from '@grpc/grpc-js';
import {
  HistoryAttempt,
  HistoryCompletion,
  PasswordUser,
  Question,
  QuestionDifficulty,
  User,
} from '../../src/proto/types';
import HistoryAttemptEntity from '../../src/db/history_entity';
import { UserCrudServiceClient } from '../../src/proto/user-crud-service.grpc-client';
import { QuestionServiceClient } from '../../src/proto/question-service.grpc-client';
import {
  CreateAttemptRequest,
  CreateAttemptResponse, CreateCompletionRequest, CreateCompletionResponse,
  DeleteAttemptRequest,
  DeleteAttemptResponse, DeleteCompletionRequest, DeleteCompletionResponse,
  GetAttemptRequest,
  GetAttemptResponse,
  GetAttemptsRequest,
  GetAttemptsResponse, GetCompletionRequest, GetCompletionResponse,
} from '../../src/proto/history-crud-service';
import { LoopbackRouteHandler } from '../../src/api_server/loopback_server_types';
import HistoryCompletionEntity from '../../src/db/history_completion_entity';

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

const testAttemptResponse: HistoryAttempt = {
  attemptId: 1,
  question: testQuestion,
  language: 'Test language',
  timestamp: testDateSeconds,
  users: [testUser.nickname],
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

const testCompletion: HistoryCompletion = {
  username: testUser.username,
  questionId: testQuestion.questionId,
};

const testCompletionEntity: HistoryCompletionEntity = {
  userId: testUser.userId,
  questionId: testQuestion.questionId,
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

function makeMockCompletionStorage() {
  return {
    addCompletion: jest.fn(),
    getCompletion: jest.fn(),
    removeCompletion: jest.fn(),
  };
}

function forceCast<T extends object, U extends object>(object: any):
LoopbackRouteHandler<handleUnaryCall<T, U>> {
  return object as LoopbackRouteHandler<handleUnaryCall<T, U>>;
}

function makeMockLoopbackChannel() {
  const mock = {
    getAttempts: jest.fn(),
    getAttempt: jest.fn(),
    createAttempt: jest.fn(),
    deleteAttempt: jest.fn(),
    createCompletion: jest.fn(),
    getCompletion: jest.fn(),
    deleteCompletion: jest.fn(),
  };
  return {
    client: {
      getAttempts: forceCast<GetAttemptsRequest, GetAttemptsResponse>(mock.getAttempts),
      getAttempt: forceCast<GetAttemptRequest, GetAttemptResponse>(mock.getAttempt),
      createAttempt: forceCast<CreateAttemptRequest, CreateAttemptResponse>(mock.createAttempt),
      deleteAttempt: forceCast<DeleteAttemptRequest, DeleteAttemptResponse>(mock.deleteAttempt),
      createCompletion:
        forceCast<CreateCompletionRequest, CreateCompletionResponse>(mock.createCompletion),
      getCompletion: forceCast<GetCompletionRequest, GetCompletionResponse>(mock.getCompletion),
      deleteCompletion:
        forceCast<DeleteCompletionRequest, DeleteCompletionResponse>(mock.deleteCompletion),
    },
    mock,
  };
}

function makeMockUserClient() {
  return new UserCrudServiceClient(
    'fakeUserServiceUrl',
    ChannelCredentials.createInsecure(),
    {},
    {},
  );
}

function makeMockQuestionClient() {
  return new QuestionServiceClient(
    'fakeQuestionServiceUrl',
    ChannelCredentials.createInsecure(),
    {},
    {},
  );
}

export {
  gatewayHeaderUsername,
  testDateSeconds,
  testQuestion,
  testAttempt,
  testAttemptResponse,
  testHistoryAttemptEntity,
  testUser,
  testPasswordUser,
  testCompletion,
  testCompletionEntity,
  makeMockAttemptStorage,
  makeMockCompletionStorage,
  makeMockLoopbackChannel,
  makeMockUserClient,
  makeMockQuestionClient,
};
