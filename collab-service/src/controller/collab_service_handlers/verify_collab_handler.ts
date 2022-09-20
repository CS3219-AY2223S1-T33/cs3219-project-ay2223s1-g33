import {
  VerifyRoomRequest,
  VerifyRoomResponse,
  VerifyRoomErrorCode,
} from '../../proto/collab-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';
import { IRoomSessionAgent } from '../../room_auth/room_session_agent_types';

class VerifyCollabHandler implements IApiHandler<VerifyRoomRequest, VerifyRoomResponse> {
  userAuthService: IAuthenticationAgent;

  roomAuthService: IRoomSessionAgent;

  constructor(userAuthService: IAuthenticationAgent, roomAuthService: IRoomSessionAgent) {
    this.userAuthService = userAuthService;
    this.roomAuthService = roomAuthService;
  }

  async handle(request: VerifyRoomRequest): Promise<VerifyRoomResponse> {
    const data = await this.userAuthService.verifyToken(request.sessionToken);
    if (data === undefined) {
      return VerifyCollabHandler.buildErrorResponse(
        'Invalid token',
        VerifyRoomErrorCode.VERIFY_ROOM_UNAUTHORIZED,
      );
    }

    // Validate legitimate room token
    const roomData = await this.roomAuthService.verifyToken(request.roomToken);
    if (roomData === undefined) {
      return VerifyCollabHandler.buildErrorResponse(
        'Invalid room',
        VerifyRoomErrorCode.VERIFY_ROOM_BAD_REQUEST,
      );
    }
    return VerifyCollabHandler.buildErrorResponse(
      'Good room',
      VerifyRoomErrorCode.VERIFY_ROOM_ERROR_NONE,
    );
  }

  static buildErrorResponse(errorMessage: string, errorCode: VerifyRoomErrorCode):
  VerifyRoomResponse {
    return {
      errorMessage,
      errorCode,
    };
  }
}

export default VerifyCollabHandler;
