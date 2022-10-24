import { Metadata } from '@grpc/grpc-js';
import { ApiHeaderMap } from '../../src/api_server/api_server_types';
import GRPCServer from '../../src/api_server/grpc_server';

describe('GRPC Server Test', () => {
  const testCookie1 = 'cookiea';
  const testCookie2 = 'cookieb';
  const testCookie3 = 'cookiec';

  test('GRPC Incoming Metadata Map', async () => {
    const headers = new Metadata();
    headers.add('Cookie', testCookie1);
    headers.add('Cookie', testCookie2);
    headers.add('Cookie', testCookie3);
    headers.add('X-Other-Header', 'aaaa');
    headers.add('X-Other-Header', 'bbbb');
    headers.add('X-Other-Header-2', 'cccc');

    const parsedMap = GRPCServer.parseIncomingMetadata(headers);
    expect(Object.keys(parsedMap).length).toBe(3);
    expect(parsedMap.cookie.length).toBe(3);
    expect(parsedMap.cookie).toContain(testCookie1);
    expect(parsedMap.cookie).toContain(testCookie2);
    expect(parsedMap.cookie).toContain(testCookie3);
    expect(parsedMap['x-other-header'].length).toBe(2);
    expect(parsedMap['x-other-header'][0]).toBe('aaaa');
    expect(parsedMap['x-other-header'][1]).toBe('bbbb');
    expect(parsedMap['x-other-header-2'].length).toBe(1);
    expect(parsedMap['x-other-header-2'][0]).toBe('cccc');
  });

  test('Outgoing Headers Map', async () => {
    const headerMap: ApiHeaderMap = {
      'Set-Cookie': [testCookie1, testCookie2, testCookie3],
      'X-Other-Header': ['aaaa', 'bbbb'],
      'X-Other-Header-2': ['cccc'],
    };

    const metadata = GRPCServer.buildOutgoingMetadata(headerMap);
    expect(metadata.get('Set-Cookie').length).toBe(3);
    expect(metadata.get('Set-Cookie')).toContain(testCookie1);
    expect(metadata.get('Set-Cookie')).toContain(testCookie2);
    expect(metadata.get('Set-Cookie')).toContain(testCookie3);
    expect(metadata.get('X-Other-Header').length).toBe(1);
    expect(metadata.get('X-Other-Header')[0]).toBe('aaaa');
    expect(metadata.get('X-Other-Header-2').length).toBe(1);
    expect(metadata.get('X-Other-Header-2')[0]).toBe('cccc');
  });
});
