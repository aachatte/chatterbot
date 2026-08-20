import { useEffect, useCallback } from 'react';
import logger from '../services/logger';

/**
 * Custom hook for automatic token refresh
 * Refreshes JWT token before expiry to maintain session
 */
export function useTokenRefresh(tokenExpiresIn = 3600) {
  // Refresh token 5 minutes before expiry
  const REFRESH_BUFFER_MS = 5 * 60 * 1000;
  const refreshIntervalMs = (tokenExpiresIn * 1000) - REFRESH_BUFFER_MS;

  const refreshToken = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies if using HTTP-only cookies
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store new token in localStorage
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        logger.debug('Token refreshed successfully');
      }
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      // Redirect to login on token refresh failure
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (refreshIntervalMs <= 0) {
      logger.warn('Token expiry too soon for auto-refresh');
      return;
    }

    const refreshInterval = setInterval(() => {
      logger.debug('Auto-refreshing token');
      refreshToken();
    }, refreshIntervalMs);

    return () => clearInterval(refreshInterval);
  }, [refreshIntervalMs, refreshToken]);

  return refreshToken;
}
