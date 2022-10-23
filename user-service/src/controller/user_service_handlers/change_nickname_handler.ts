import Validator from 'validator';
import { ChangeNicknameErrorCode, ChangeNicknameRequest, ChangeNicknameResponse } from '../../proto/user-service';
import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
  ILoopbackServiceChannel,
} from '../../api_server/api_server_types';
import {
  EditUserRequest,
  EditUserResponse,
  GetUserRequest,
  GetUserResponse,
} from '../../proto/user-crud-service';
import { IUserCrudService } from '../../proto/user-crud-service.grpc-server';
import { PasswordUser, User } from '../../proto/types';
import GatewayConstants from '../../utils/gateway_constants';

class ChangeNicknameHandler
implements IApiHandler<ChangeNicknameRequest, ChangeNicknameResponse> {
  crudClient: ILoopbackServiceChannel<IUserCrudService>;

  constructor(
    crudClient: ILoopbackServiceChannel<IUserCrudService>,
  ) {
    this.crudClient = crudClient;
  }

  async handle(request: ApiRequest<ChangeNicknameRequest>):
  Promise<ApiResponse<ChangeNicknameResponse>> {
    const requestObject = request.request;

    const validatedRequest = ChangeNicknameHandler.validateRequest(requestObject);
    if (validatedRequest instanceof Error) {
      return ChangeNicknameHandler.buildErrorResponse(
        ChangeNicknameErrorCode.CHANGE_NICKNAME_ERROR_BAD_REQUEST,
        validatedRequest.message,
      );
    }

    const { newNickname } = validatedRequest;

    if (!(GatewayConstants.GATEWAY_HEADER_USERNAME in request.headers)) {
      return ChangeNicknameHandler.buildErrorResponse(
        ChangeNicknameErrorCode.CHANGE_NICKNAME_ERROR_INTERNAL_ERROR,
        'Bad request from gateway',
      );
    }

    const username = request.headers[GatewayConstants.GATEWAY_HEADER_USERNAME][0];
    if (username.length === 0) {
      return ChangeNicknameHandler.buildErrorResponse(
        ChangeNicknameErrorCode.CHANGE_NICKNAME_ERROR_INTERNAL_ERROR,
        'Bad request from gateway',
      );
    }

    const user = await this.getUserByUsername(username);
    if (!user || !user.userInfo) {
      return ChangeNicknameHandler.buildErrorResponse(
        ChangeNicknameErrorCode.CHANGE_NICKNAME_ERROR_INTERNAL_ERROR,
        'Could not find user',
      );
    }

    const isSuccessful = await this.changeUserNickname(user, newNickname);
    if (!isSuccessful) {
      return ChangeNicknameHandler.buildErrorResponse(
        ChangeNicknameErrorCode.CHANGE_NICKNAME_ERROR_INTERNAL_ERROR,
        'Could not save new nickname',
      );
    }

    return ChangeNicknameHandler.buildHeaderlessResponse({
      errorCode: ChangeNicknameErrorCode.CHANGE_NICKNAME_ERROR_NONE,
      errorMessage: '',
    });
  }

  static validateRequest(request: ChangeNicknameRequest): (ValidatedRequest | Error) {
    if (!request.newNickname) {
      return new Error('New nickname not provided');
    }

    const newNickname = request.newNickname.trim();

    if (Validator.isEmpty(newNickname)) {
      return new Error('Empty field provided');
    }

    return {
      newNickname,
    };
  }

  async getUserByUsername(username: string): Promise<(PasswordUser | undefined)> {
    const searchUserObject: User = User.create();
    searchUserObject.username = username;

    const request: GetUserRequest = {
      user: searchUserObject,
    };

    const result = await this.crudClient.callRoute<GetUserRequest, GetUserResponse>('getUser', request, GetUserResponse);
    if (!result) {
      return undefined;
    }

    if (!result.user && result.errorMessage !== '') {
      throw new Error(result.errorMessage);
    }

    return result.user;
  }

  async changeUserNickname(userModel: PasswordUser, newNickname: string): Promise<boolean> {
    const newUserModel = userModel;
    newUserModel.userInfo!.nickname = newNickname;
    const editUserRequest: EditUserRequest = {
      user: newUserModel,
    };

    const updateResponse = await this.crudClient
      .callRoute<EditUserRequest, EditUserResponse>(
      'editUser',
      editUserRequest,
      EditUserResponse,
    );

    return updateResponse.errorMessage === '';
  }

  static buildHeaderlessResponse(response: ChangeNicknameResponse):
  ApiResponse<ChangeNicknameResponse> {
    return {
      response,
      headers: {},
    };
  }

  static buildErrorResponse(errorCode: ChangeNicknameErrorCode, errorMessage: string)
    : ApiResponse<ChangeNicknameResponse> {
    return ChangeNicknameHandler.buildHeaderlessResponse({
      errorCode,
      errorMessage,
    });
  }
}

type ValidatedRequest = {
  newNickname: string,
};

export default ChangeNicknameHandler;
