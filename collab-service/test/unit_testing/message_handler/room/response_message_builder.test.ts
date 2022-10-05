import { makeUnauthorizedMessage }
  from '../../../../src/message_handler/room/response_message_builder';
import {
  CollabTunnelResponseFlags,
} from '../../../../src/proto/collab-service';

describe('Function-Room createUnauthorizedMessage', () => {
  test('Test unauthorized empty data and flag', () => {
    const msg = makeUnauthorizedMessage();
    expect(msg.data.toString())
      .toBe('');
    expect(msg.flags)
      .toBe(CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_UNAUTHORIZED);
  });
});
