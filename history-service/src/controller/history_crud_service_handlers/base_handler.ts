import { UserCrudServiceClient } from '../../proto/user-crud-service.grpc-client';
import { QuestionServiceClient } from '../../proto/question-service.grpc-client';
import HistoryAttemptEntity from '../../db/history_entity';
import { Question, User, PasswordUser } from '../../proto/types';

export default class BaseHandler {
  userGrpcClient: UserCrudServiceClient;

  questionGrpcClient: QuestionServiceClient;

  constructor(
    userGrpcClient: UserCrudServiceClient,
    questionGrpcClient: QuestionServiceClient,
  ) {
    this.userGrpcClient = userGrpcClient;
    this.questionGrpcClient = questionGrpcClient;
  }

  async createQuestionMap(attempts: HistoryAttemptEntity[]): Promise<{ [key: number]: Question }> {
    const questionIdsToQuery = new Set<number>();

    attempts.forEach((attempt) => {
      questionIdsToQuery.add(attempt.questionId);
    });

    const promises: Promise<Question | undefined>[] = [];
    questionIdsToQuery.forEach((questionId) => {
      const questionSearchObject: Question = Question.create({ questionId });
      promises.push(this.getQuestion(questionSearchObject));
    });

    const result = await Promise.all(promises);

    const resultMap: { [key: number]: Question } = {};
    Array.from(result).forEach((question) => {
      if (!question) {
        return;
      }

      resultMap[question.questionId] = question;
    });
    return resultMap;
  }

  async fetchUsersFor(attempts: HistoryAttemptEntity[]):
  Promise<(PasswordUser | undefined)[]> {
    const userIdsToQuery = new Set<number>();

    attempts.forEach((attempt) => {
      if (!attempt.users) {
        return;
      }

      attempt.users
        .map((owner) => owner.userId)
        .forEach((owner) => {
          if (!owner) {
            return;
          }

          userIdsToQuery.add(owner);
        });
    });

    const promises: Promise<PasswordUser | undefined>[] = [];
    userIdsToQuery.forEach((userId) => {
      const searchUserObject: User = User.create({ userId });
      promises.push(this.getUser(searchUserObject));
    });

    const result = await Promise.all(promises);
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  createNicknameMapFrom(users: (PasswordUser | undefined)[]): { [key: number]: string } {
    const resultMap: { [key: number]: string } = {};
    Array.from(users).forEach((user) => {
      if (!user || !user.userInfo) {
        return;
      }

      resultMap[user.userInfo.userId] = user.userInfo.nickname;
    });

    return resultMap;
  }

  async createNicknameMap(attempts: HistoryAttemptEntity[]): Promise<{ [key: number]: string }> {
    const users = await this.fetchUsersFor(attempts);
    return this.createNicknameMapFrom(users);
  }

  async getUser(searchObject: User): Promise<PasswordUser | undefined> {
    return new Promise<PasswordUser | undefined>((resolve, reject) => {
      this.userGrpcClient.getUser(
        {
          user: searchObject,
        },
        (err, value) => {
          if (!value) {
            reject(err);
            return;
          }

          if (!value.user && value.errorMessage !== '') {
            reject(value.errorMessage);
            return;
          }
          resolve(value.user);
        },
      );
    });
  }

  async getQuestion(searchObject: Question): Promise<Question | undefined> {
    return new Promise<Question | undefined>((resolve, reject) => {
      this.questionGrpcClient.getQuestion(
        {
          question: searchObject,
        },
        (err, value) => {
          if (!value) {
            reject(err);
            return;
          }

          if (!value.question && value.errorMessage !== '') {
            reject(value.errorMessage);
            return;
          }
          resolve(value.question);
        },
      );
    });
  }
}
