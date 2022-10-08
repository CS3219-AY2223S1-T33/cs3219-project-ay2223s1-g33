import { CreateAttemptRequest, CreateAttemptResponse } from '../../proto/history-crud-service';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IAttemptStore } from '../../storage/storage';
import { StoredAttempt, convertToProtoAttempt, convertToStoredAttempt } from '../../model/attempt_store_model';
import { UserCrudServiceClient } from '../../proto/user-crud-service.grpc-client';
import { QuestionServiceClient } from '../../proto/question-service.grpc-client';
import { PasswordUser, Question, User } from '../../proto/types';
import BaseHandler from './base_handler';

class CreateAttemptHandler extends BaseHandler
  implements IApiHandler<CreateAttemptRequest, CreateAttemptResponse> {
  attemptStore: IAttemptStore;

  constructor(
    storage: IStorage,
    userGrpcClient: UserCrudServiceClient,
    questionGrpcClient: QuestionServiceClient,
  ) {
    super(userGrpcClient, questionGrpcClient);
    this.attemptStore = storage.getAttemptStore();
  }

  async handle(apiRequest: ApiRequest<CreateAttemptRequest>):
  Promise<ApiResponse<CreateAttemptResponse>> {
    const { request } = apiRequest;

    if (!request.attempt || !request.attempt.question) {
      return CreateAttemptHandler.buildErrorResponse('Invalid attempt information');
    }

    const users = await this.getUsersByUsername(request.attempt.users);
    const validUsers = users
      .map((x) => x.userInfo)
      .filter((x) => x !== undefined)
      .map((x) => (x as User));
    const userIds = validUsers.map((x) => x.userId);
    const userUsernames = validUsers.map((x) => x.username);

    const question = await super.getQuestion(Question.create({
      questionId: request.attempt.question?.questionId,
    }));

    if (!question) {
      return CreateAttemptHandler.buildErrorResponse('Invalid question id');
    }

    const convertedAttempt = convertToStoredAttempt(request.attempt, userIds);
    if (!convertedAttempt) {
      return CreateAttemptHandler.buildErrorResponse('Invalid attempt information');
    }

    convertedAttempt.attemptId = 0;
    let attempt: StoredAttempt | undefined;
    try {
      attempt = await this.attemptStore.addAttempt(convertedAttempt);
    } catch (err) {
      return CreateAttemptHandler.buildErrorResponse(`${err}`);
    }

    const nicknameMap: { [key: number]: string } = {};
    validUsers.forEach((user) => {
      nicknameMap[user.userId] = user.nickname;
    });
    const questionMap: { [key: number]: Question } = {};
    questionMap[question.questionId] = question;

    const resultAttempt = convertToProtoAttempt(attempt, nicknameMap, questionMap);
    if (!resultAttempt) {
      return CreateAttemptHandler.buildErrorResponse('An internal error occurred');
    }

    resultAttempt.users = userUsernames;
    return {
      response: {
        attempt: resultAttempt,
        errorMessage: '',
      },
      headers: {},
    };
  }

  async getUsersByUsername(username: string[]): Promise<PasswordUser[]> {
    const promises = username.map((x): Promise<PasswordUser | undefined> => {
      const searchUserObject: User = User.create();
      searchUserObject.username = x;

      return super.getUser(searchUserObject);
    });

    const users = await Promise.all(promises);
    return users.filter((x) => x !== undefined).map((x) => x as PasswordUser);
  }

  static buildErrorResponse(errorMessage: string):
  ApiResponse<CreateAttemptResponse> {
    return {
      response: {
        errorMessage,
        attempt: undefined,
      },
      headers: {},
    };
  }
}

export default CreateAttemptHandler;
