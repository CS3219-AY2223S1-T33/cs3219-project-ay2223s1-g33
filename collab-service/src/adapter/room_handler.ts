import { CollabTunnelResponse, VerifyRoomErrorCode } from '../proto/collab-service';

function buildErrorResponse(): CollabTunnelResponse {
  const emptyByte = new Uint8Array(0);
  return {
    data: emptyByte,
    flags: VerifyRoomErrorCode.VERIFY_ROOM_UNAUTHORIZED,
  };
}

export default buildErrorResponse;
