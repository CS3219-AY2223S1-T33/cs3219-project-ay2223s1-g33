import { ApiService } from '../../src/api_server/api_server_types';
import createApiServer from '../../src/api_server/api_server';
import { IUserCrudService } from '../../src/proto/user-crud-service.grpc-server';

describe('API Server Test', () => {
  const createProtocolServer = () => ({
    registerServiceRoutes: jest.fn(),
    bind: jest.fn(),
  });

  test('API Server Creation and Muxing', async () => {
    const s1 = createProtocolServer();
    const s2 = createProtocolServer();
    const s3 = createProtocolServer();

    const apiServer = createApiServer(s1, s2, s3);
    apiServer.bind();
    expect(s1.bind).toBeCalledTimes(1);
    expect(s2.bind).toBeCalledTimes(1);
    expect(s3.bind).toBeCalledTimes(1);

    apiServer.registerServiceRoutes({} as ApiService<IUserCrudService>);
    expect(s1.registerServiceRoutes).toBeCalledTimes(1);
    expect(s2.registerServiceRoutes).toBeCalledTimes(1);
    expect(s3.registerServiceRoutes).toBeCalledTimes(1);
  });
});
