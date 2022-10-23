import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { ApiRequest, ApiResponse } from '../../src/api_server/api_server_types';
import HTTPServer from '../../src/api_server/http_server';
import { PasswordUser, User } from '../../src/proto/types';

describe('HTTP Server Test', () => {
  test('HTTP Processing Test', async () => {
    const handler = {
      handle: jest.fn(),
    };

    const inp = User.create();
    const out = PasswordUser.create();

    handler.handle.mockImplementationOnce(
      async (req: ApiRequest<User>): Promise<ApiResponse<PasswordUser>> => {
        expect(req.request).toStrictEqual(inp);
        expect(Object.keys(req.headers).length).toBe(2);
        expect('header1' in req.headers).toBeTruthy();
        expect('header2' in req.headers).toBeTruthy();
        return {
          headers: {
            header3: ['c'],
          },
          response: out,
        };
      },
    );

    const httpHandler = HTTPServer.adaptToHTTPhandler(handler, User, PasswordUser);
    const req = {
      headers: {
        header1: 'a',
        header2: 'b',
      } as IncomingHttpHeaders,
      body: User.toJson(User.create(), { emitDefaultValues: true }),
    } as Request;
    const response = await httpHandler(req);
    expect(response.jsonResponse).toStrictEqual(PasswordUser.toJson(out, {
      enumAsInteger: true,
    }));
    expect('header3' in response.headers!).toBeTruthy();
    expect(response.status).toBeUndefined();
  });

  test('HTTP Bad Body', async () => {
    const handler = {
      handle: jest.fn(),
    };

    const httpHandler = HTTPServer.adaptToHTTPhandler(handler, User, PasswordUser);
    const req = {
      headers: {} as IncomingHttpHeaders,
      body: undefined,
    } as Request;
    const response = await httpHandler(req);
    expect(response.status!).toBe(400);
  });

  test('Handler Error', async () => {
    const handler = {
      handle: jest.fn(),
    };

    handler.handle.mockImplementationOnce(
      async (): Promise<ApiResponse<PasswordUser>> => {
        throw new Error('Test Error');
      },
    );

    const httpHandler = HTTPServer.adaptToHTTPhandler(handler, User, PasswordUser);
    const req = {
      headers: {} as IncomingHttpHeaders,
      body: User.toJson(User.create(), { emitDefaultValues: true }),
    } as Request;

    expect(async () => {
      await httpHandler(req);
    }).rejects.toThrowError();
  });
});
