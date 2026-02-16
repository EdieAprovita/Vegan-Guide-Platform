import { refreshAccessToken, apiRequestWithRefresh } from '../tokenRefresh';
import { apiRequest } from '../config';

jest.mock('../config');

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('tokenRefresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh tokens', async () => {
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockTokens,
      } as any);

      const result = await refreshAccessToken('old-refresh-token');

      expect(result).toEqual(mockTokens);
      expect(mockApiRequest).toHaveBeenCalledWith('/auth/refresh-token', expect.any(Object));
    });

    it('should throw error on invalid refresh token', async () => {
      const mockError = new Error('Invalid refresh token');
      mockApiRequest.mockRejectedValue(mockError);

      await expect(refreshAccessToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });

    it('should prevent concurrent refresh requests', async () => {
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockApiRequest.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () => resolve({ success: true, data: mockTokens } as any),
              50
            );
          })
      );

      const [result1, result2, result3] = await Promise.all([
        refreshAccessToken('token'),
        refreshAccessToken('token'),
        refreshAccessToken('token'),
      ]);

      expect(result1).toEqual(mockTokens);
      expect(result2).toEqual(mockTokens);
      expect(result3).toEqual(mockTokens);
      expect(mockApiRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('apiRequestWithRefresh', () => {
    it('should make successful request without refresh', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'success' }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await apiRequestWithRefresh(
        '/test',
        { method: 'GET' },
        'valid-token',
        'refresh-token'
      );

      expect(result).toEqual({ data: 'success' });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should refresh and retry on 401', async () => {
      const mockNewTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      const mockUnauthorized = { status: 401, ok: false };
      const mockSuccess = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'refreshed-success' }),
      };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockUnauthorized)
        .mockResolvedValueOnce(mockSuccess);

      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockNewTokens,
      } as any);

      const result = await apiRequestWithRefresh(
        '/test',
        { method: 'GET' },
        'old-token',
        'refresh-token'
      );

      expect(result).toEqual({ data: 'refreshed-success' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should prevent infinite retry loop on second 401', async () => {
      global.fetch = jest.fn().mockResolvedValue({ status: 401, ok: false });

      mockApiRequest.mockResolvedValue({
        success: true,
        data: { accessToken: 'new-token', refreshToken: 'new-refresh' },
      } as any);

      await expect(
        apiRequestWithRefresh('/test', { method: 'GET' }, 'old-token', 'refresh-token')
      ).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle timeout errors', async () => {
      const abortError = new Error('Aborted');
      (abortError as any).name = 'AbortError';
      global.fetch = jest.fn().mockRejectedValue(abortError);

      await expect(
        apiRequestWithRefresh('/test', { method: 'GET' }, 'token', 'refresh-token')
      ).rejects.toThrow('Request timeout');
    });

    it('should call onTokenRefreshed callback when tokens are refreshed', async () => {
      const mockNewTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ status: 401, ok: false })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ data: 'success' }),
        });

      mockApiRequest.mockResolvedValue({
        success: true,
        data: mockNewTokens,
      } as any);

      const onTokenRefreshed = jest.fn();

      await apiRequestWithRefresh(
        '/test',
        { method: 'GET' },
        'old-token',
        'refresh-token',
        onTokenRefreshed
      );

      expect(onTokenRefreshed).toHaveBeenCalledWith(mockNewTokens);
    });
  });
});
