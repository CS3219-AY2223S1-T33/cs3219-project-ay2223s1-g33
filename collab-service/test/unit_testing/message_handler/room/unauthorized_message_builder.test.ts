import createUnauthorizedMessage
  from '../../../../src/message_handler/room/unauthorized_message_builder';
import { VerifyRoomErrorCode } from '../../../../src/proto/collab-service';

describe('Function-Room createUnauthorizedMessage', () => {
  test('Test unauthorized empty data and flag', () => {
    const msg = createUnauthorizedMessage();
    expect(msg.data.toString())
      .toBe('');
    expect(msg.flags)
      .toBe(VerifyRoomErrorCode.VERIFY_ROOM_UNAUTHORIZED);
  });
});
