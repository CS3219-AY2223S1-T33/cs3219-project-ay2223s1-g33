import { GetUserRequest, GetUserResponse } from '../../../src/proto/user-crud-service';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import {
  makeMockUserCrudLoopbackChannel,
  makeTestPasswordUser,
  makeTestUser,
  testData,
} from '../test_util';
import { GetUserProfileRequest } from '../../../src/proto/user-service';
import GatewayConstants from '../../../src/utils/gateway_constants';
import GetUserProfileHandler from '../../../src/controller/user_service_handlers/get_user_profile_handler';

describe('Get User Profile Handler', () => {
  const {
    testUserId1,
    testUsername1,
    testNickname1,
    testPassword1,
  } = testData;

  const makeRequest = (username: string):
  ApiRequest<GetUserProfileRequest> => {
    const req: ApiRequest<GetUserProfileRequest> = {
      request: {},
      headers: {},
    };
    req.headers[GatewayConstants.GATEWAY_HEADER_USERNAME] = [username];
    return req;
  };

  test('Successful Get User Profile', async () => {
    const userCrudClient = makeMockUserCrudLoopbackChannel();

    const handler = new GetUserProfileHandler(userCrudClient);
    userCrudClient.client.getUser.mockImplementationOnce((request: GetUserRequest):
    GetUserResponse => {
      expect(request.user!.username).toBe(testUsername1);

      return {
        user: makeTestPasswordUser(testUserId1, testUsername1, testNickname1, testPassword1),
        errorMessage: '',
      };
    });

    const request = makeRequest(testUsername1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(response.response.user).toStrictEqual(
      makeTestUser(testUserId1, testUsername1, testNickname1),
    );
  });

  test('Bad Request', async () => {
    const userCrudClient = makeMockUserCrudLoopbackChannel();
    const handler = new GetUserProfileHandler(userCrudClient);

    let request = makeRequest('');
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(userCrudClient.client.getUser.mock.calls.length).toBe(0);

    request = {
      request: {},
      headers: {},
    };
    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
    expect(userCrudClient.client.getUser.mock.calls.length).toBe(0);
  });

  test('Bad Downstream Request', async () => {
    const userCrudClient = makeMockUserCrudLoopbackChannel();

    const handler = new GetUserProfileHandler(userCrudClient);
    userCrudClient.client.getUser.mockImplementationOnce((request: GetUserRequest):
    GetUserResponse => {
      expect(request.user!.username).toBe(testUsername1);

      return {
        user: undefined,
        errorMessage: 'No Such User',
      };
    }).mockImplementationOnce(() => {
      throw new Error('Cannot connect downstream');
    });

    const request = makeRequest(testUsername1);
    let response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();

    response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(response.response.user).toBeUndefined();
  });
});
