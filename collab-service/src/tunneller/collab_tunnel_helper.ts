import {
  CollabTunnelRequest,
  CollabTunnelResponse,
  VerifyRoomErrorCode,
} from '../proto/collab-service';

// Unwrap Response struct and write response to client
function subscribeCall(call: any, message: string, username: string) {
  const messageJson = JSON.parse(message);
  const {
    sender,
    data,
  } = messageJson;
  const res = CollabTunnelResponse.create(
    {
      data: Buffer.from(data),
      flags: VerifyRoomErrorCode.VERIFY_ROOM_ERROR_NONE,
    },
  );
  if (sender !== username) {
    call.write(res);
  }
}

// Wrap Request into Response struct
function createPushStruct(username: string, request: CollabTunnelRequest) {
  return {
    sender: username,
    data: request.data,
  };
}

export {
  subscribeCall,
  createPushStruct,
};
