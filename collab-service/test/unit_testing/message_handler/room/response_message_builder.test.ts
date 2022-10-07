import {
  isHeartbeat, makeDataResponse, makeHeartbeatResponse, makeUnauthorizedResponse,
}
  from '../../../../src/message_handler/room/response_message_builder';
import {
  CollabTunnelResponseFlags,
} from '../../../../src/proto/collab-service';

describe('Function-Room-Response makeUnauthorizedResponse', () => {
  test('Test empty data and unauthorized flag', () => {
    const msg = makeUnauthorizedResponse();
    expect(msg.data.toString())
      .toBe('');
    expect(msg.flags)
      .toBe(CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_UNAUTHORIZED);
  });
});

describe('Function-Room-Response makeDataResponse', () => {
  test('Test normal data and normal flag', () => {
    const data = Buffer.from([123]);
    const msg = makeDataResponse(data);
    expect(msg.data.toString())
      .toBe(data.toString());
    expect(msg.flags)
      .toBe(CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_NONE);
  });
});

describe('Function-Room-Response makeHeartbeatResponse', () => {
  test('Test empty data and heartbeat flag', () => {
    const msg = makeHeartbeatResponse();
    expect(msg.data.toString())
      .toBe('');
    expect(msg.flags)
      .toBe(CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_HEARTBEAT);
  });
});

describe('Function-Room-Response isHeartbeat', () => {
  test('Test is a heartbeat flag', () => {
    expect(isHeartbeat(1))
      .toBe(true);
  });
  test('Test is NOT a heartbeat flag', () => {
    expect(isHeartbeat(0))
      .toBe(false);
  });
});
