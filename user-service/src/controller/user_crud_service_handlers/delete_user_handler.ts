import { DeleteUserRequest, DeleteUserResponse } from '../../proto/user-crud-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage';

function getHeaderlessResponse(resp: DeleteUserResponse): ApiResponse<DeleteUserResponse> {
  return {
    response: resp,
    headers: {},
  };
}

class DeleteUserHandler implements IApiHandler<DeleteUserRequest, DeleteUserResponse> {
  userStore: IUserStore;

  redisStream: IStreamProducer;

  constructor(storage: IStorage, redisStream: IStreamProducer) {
    this.userStore = storage.getUserStore();
    this.redisStream = redisStream;
  }

  async handle(request: ApiRequest<DeleteUserRequest>): Promise<ApiResponse<DeleteUserResponse>> {
    const requestObject = request.request;

    if (requestObject.userId <= 0) {
      return getHeaderlessResponse({
        errorMessage: 'Malformed request',
      });
    }

    try {
      await this.userStore.removeUser(requestObject.userId);
    } catch {
      return getHeaderlessResponse({
        errorMessage: 'Database Error',
      });
    }

    // Push delete-change to Stream
    try {
      await this.redisStream.pushMessage(requestObject.userId.toString());
    } catch {
      return getHeaderlessResponse({
        errorMessage: 'Redis Error',
      });
    }

    return getHeaderlessResponse({
      errorMessage: '',
    });
  }
}

export default DeleteUserHandler;
