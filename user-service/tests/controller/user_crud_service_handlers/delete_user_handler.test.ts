import { DeleteUserRequest } from '../../../src/proto/user-crud-service';
import { IStorage } from '../../../src/storage/storage';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import { makeMockUserStorage, testData } from '../test_util';
import DeleteUserHandler from '../../../src/controller/user_crud_service_handlers/delete_user_handler';

describe('Delete User Handler', () => {
  const { testUserId1 } = testData;

  const makeRequest = (userId: number): ApiRequest<DeleteUserRequest> => ({
    request: {
      userId,
    },
    headers: {},
  });

  test('Successful User Delete', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
    };

    const handler = new DeleteUserHandler(storage);
    const request = makeRequest(testUserId1);

    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(mockStore.removeUser.mock.calls.length).toBe(1);
    expect(mockStore.removeUser.mock.lastCall![0]).toBe(testUserId1);
  });

  test('Bad Request', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
    };

    const handler = new DeleteUserHandler(storage);
    const request = makeRequest(-1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
  });

  const testErrorMessage = 'Test Error Message';
  test('Bad Database', async () => {
    const mockStore = makeMockUserStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(() => mockStore),
    };

    mockStore.removeUser.mockImplementationOnce(() => { throw new Error(testErrorMessage); });
    const handler = new DeleteUserHandler(storage);

    const request = makeRequest(testUserId1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(mockStore.removeUser.mock.lastCall![0]).toBe(testUserId1);
    expect(mockStore.removeUser.mock.calls.length).toBe(1);
  });
});
