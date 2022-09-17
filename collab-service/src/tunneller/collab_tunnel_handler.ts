import { ServerDuplexStreamImpl } from '@grpc/grpc-js/build/src/server-call';
import assert from 'assert';
import {
  TunnelServiceRequest,
  TunnelServiceResponse,
} from '../proto/tunnel-service';
import Logger from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let count = -1;
const allUsers = ['user1', 'user2'];
const fakeRoomId = '12345678';

// Tracks roomId to handler
const roomIdHandler = new Map<string,
Map<string, ServerDuplexStreamImpl<TunnelServiceRequest, TunnelServiceResponse>>>();

// Add user to tracker
function registerUserRoom(
  username: string,
  roomId: string,
  call: ServerDuplexStreamImpl<TunnelServiceRequest, TunnelServiceResponse>,
) {
  const roomExist = roomIdHandler.has(roomId);
  if (!roomExist) {
    roomIdHandler.set(roomId, new Map());
    Logger.info(`Created ${roomId}`);
  }
  const room = roomIdHandler.get(roomId);
  assert(room);
  const userExist = room.has(username);
  if (!userExist && room.size < 2) {
    room.set(username, call);
  }
  // eslint-disable-next-line no-console
  console.log(roomIdHandler);
}

// Share data to users
function pushData(roomId: string, _data: TunnelServiceRequest) {
  const handlers = roomIdHandler.get(roomId);
  if (handlers === undefined) {
    return;
  }
  const response = TunnelServiceResponse.create(
    {
      data: _data.data,
    },
  );
  // eslint-disable-next-line no-restricted-syntax
  for (const call of handlers.values()) {
    call.write(response);
  }
}

function doOpenStream(call: any) {
  // When data is detected
  call.on('data', (request: TunnelServiceRequest) => {
    // Access fake username & room_id
    count += 1;
    count %= 2;
    const username = allUsers[count];
    const roomId = fakeRoomId;

    registerUserRoom(username, roomId, call);
    pushData(roomId, request);
  });
  // When stream ends
  call.on('end', () => {
    call.end();
  });
}

export default doOpenStream;
