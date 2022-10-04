import { CreateAttemptRequest, CreateAttemptResponse } from '../../proto/history-crud-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IAttemptStore } from '../../storage/storage';
import { StoredAttempt, convertToProtoAttempt, convertToStoredAttempt } from '../../model/attempt_store_model';
import { UserCrudServiceClient } from '../../proto/user-crud-service.grpc-client';
import { PasswordUser, User } from '../../proto/types';

class CreateAttemptHandler implements IApiHandler<CreateAttemptRequest, CreateAttemptResponse> {
  attemptStore: IAttemptStore;

  grpcClient: UserCrudServiceClient;

  constructor(storage: IStorage, grpcClient: UserCrudServiceClient) {
    this.attemptStore = storage.getAttemptStore();
    this.grpcClient = grpcClient;
  }

  async handle(request: CreateAttemptRequest): Promise<CreateAttemptResponse> {
    if (!request.attempt) {
      return {
        attempt: undefined,
        errorMessage: 'Invalid attempt information',
      };
    }

    const users = await this.getUsersByUsername(request.attempt.users);
    const validUsers = users
      .map((x) => x.userInfo)
      .filter((x) => x !== undefined)
      .map((x) => (x as User));
    const userIds = validUsers.map((x) => x.userId);
    const userUsernames = validUsers.map((x) => x.username);

    const convertedAttempt = convertToStoredAttempt(request.attempt, userIds);
    if (!convertedAttempt) {
      return {
        attempt: undefined,
        errorMessage: 'Invalid attempt information',
      };
    }

    convertedAttempt.attemptId = 0;
    let attempt: StoredAttempt | undefined;
    try {
      attempt = await this.attemptStore.addAttempt(convertedAttempt);
    } catch (err) {
      return {
        attempt: undefined,
        errorMessage: `${err}`,
      };
    }

    const resultAttempt = convertToProtoAttempt(attempt);
    if (!resultAttempt) {
      return {
        attempt: undefined,
        errorMessage: 'An internal error occurred',
      };
    }

    resultAttempt.users = userUsernames;
    return {
      attempt: resultAttempt,
      errorMessage: '',
    };
  }

  async getUsersByUsername(username: string[]): Promise<PasswordUser[]> {
    const promises = username.map((x): Promise<PasswordUser | undefined> => {
      const searchUserObject: User = User.create();
      searchUserObject.username = x;

      return new Promise<PasswordUser | undefined>((resolve, reject) => {
        this.grpcClient.getUser(
          {
            user: searchUserObject,
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
    });

    const users = await Promise.all(promises);
    return users.filter((x) => x !== undefined).map((x) => x as PasswordUser);
  }
}

export default CreateAttemptHandler;
