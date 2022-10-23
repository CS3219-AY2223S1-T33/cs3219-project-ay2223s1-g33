import { DeleteResetTokenRequest } from '../../../src/proto/user-crud-service';
import { IStorage } from '../../../src/storage/storage';
import { ApiRequest } from '../../../src/api_server/api_server_types';
import { makeMockTokenStorage, testData } from '../test_util';
import DeleteResetTokenHandler from '../../../src/controller/user_crud_service_handlers/delete_reset_token_handler';

describe('Delete Token Handler', () => {
  const { testTokenString1 } = testData;

  const makeRequest = (tokenString: string): ApiRequest<DeleteResetTokenRequest> => ({
    request: {
      tokenString,
    },
    headers: {},
  });

  test('Successful Token Delete', async () => {
    const mockStore = makeMockTokenStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(),
      getResetTokenStore: jest.fn(() => mockStore),
    };

    mockStore.removeResetToken.mockImplementationOnce(() => true);
    const handler = new DeleteResetTokenHandler(storage);
    const request = makeRequest(testTokenString1);

    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBe('');
    expect(mockStore.removeResetToken.mock.calls.length).toBe(1);
    expect(mockStore.removeResetToken.mock.lastCall![0]).toBe(testTokenString1);
  });

  test('Bad Request', async () => {
    const mockStore = makeMockTokenStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(),
      getResetTokenStore: jest.fn(() => mockStore),
    };

    const handler = new DeleteResetTokenHandler(storage);
    const request = makeRequest('');
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
  });

  test('Bad Database', async () => {
    const mockStore = makeMockTokenStorage();
    const storage: IStorage = {
      getUserStore: jest.fn(),
      getResetTokenStore: jest.fn(() => mockStore),
    };

    mockStore.removeResetToken.mockImplementationOnce(() => false);
    const handler = new DeleteResetTokenHandler(storage);

    const request = makeRequest(testTokenString1);
    const response = await handler.handle(request);
    expect(response.response.errorMessage).toBeTruthy();
    expect(mockStore.removeResetToken.mock.lastCall![0]).toBe(testTokenString1);
    expect(mockStore.removeResetToken.mock.calls.length).toBe(1);
  });
});
