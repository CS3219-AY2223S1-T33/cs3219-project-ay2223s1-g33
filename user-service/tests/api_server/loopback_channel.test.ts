import { ApiRequest, ApiResponse } from '../../src/api_server/api_server_types';
import LoopbackApiChannel from '../../src/api_server/loopback_channel';
import { PasswordUser, User } from '../../src/proto/types';

describe('Loopback Channel Test', () => {
  test('Loopback Channel Processing Test', async () => {
    const handler = {
      handle: jest.fn(),
    };

    const inp = User.create();
    const out = PasswordUser.create();

    handler.handle.mockImplementationOnce(
      async (req: ApiRequest<User>): Promise<ApiResponse<PasswordUser>> => {
        expect(req.request).toStrictEqual(inp);
        return {
          headers: {},
          response: out,
        };
      },
    );

    const loopback = LoopbackApiChannel.getLoopbackRouteHandler(handler, User, PasswordUser);
    const response = await loopback(inp);
    expect(response).toStrictEqual(out);
  });

  test('Loopback Channel Error Test', async () => {
    const handler = {
      handle: jest.fn(),
    };

    handler.handle.mockImplementationOnce(async () => {
      throw new Error('Test error');
    });

    const loopback = LoopbackApiChannel.getLoopbackRouteHandler(handler, User, PasswordUser);
    expect(async () => {
      await loopback(User.create());
    }).rejects.toThrowError();
  });
});
