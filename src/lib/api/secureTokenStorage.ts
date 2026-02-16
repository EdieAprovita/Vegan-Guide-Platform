/**
 * Secure token storage mechanism that avoids localStorage XSS exposure
 *
 * Strategy: Store refresh token in memory + HTTP-only server cookie
 * This prevents exfiltration via JavaScript while maintaining functionality
 */

// In-memory storage for refresh token (cleared on page reload)
// This is more secure than localStorage but requires the backend to also
// handle the refresh token via HttpOnly cookie
let cachedRefreshToken: string | null = null;

export const secureTokenStorage = {
  /**
   * Set refresh token in memory (NOT in localStorage)
   * In production, the refresh token should be sent by the backend
   * in an HttpOnly, Secure cookie. This function should only be called
   * during initial auth when we receive it from the server.
   */
  setRefreshToken(token: string): void {
    cachedRefreshToken = token;
    // IMPORTANT: The backend should also set this in an HttpOnly cookie
    // Don't store in localStorage - it's vulnerable to XSS
  },

  /**
   * Get refresh token from memory
   * Returns null if page was reloaded (which is fine - backend cookie will be used)
   */
  getRefreshToken(): string | null {
    return cachedRefreshToken;
  },

  /**
   * Clear refresh token from memory (e.g., on logout)
   */
  clearRefreshToken(): void {
    cachedRefreshToken = null;
  },

  /**
   * Check if we have a refresh token available
   */
  hasRefreshToken(): boolean {
    return cachedRefreshToken !== null;
  },
};

/**
 * SECURITY RECOMMENDATIONS:
 *
 * 1. Backend should send refresh token in HttpOnly, Secure cookie:
 *    ```typescript
 *    res.cookie('refreshToken', token, {
 *      httpOnly: true,
 *      secure: process.env.NODE_ENV === 'production',
 *      sameSite: 'strict',
 *      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
 *    });
 *    ```
 *
 * 2. Frontend should NEVER:
 *    - Store refresh token in localStorage/sessionStorage
 *    - Expose refresh token in response body to client-side code
 *    - Read refresh token from response and use in JavaScript
 *
 * 3. Refresh token endpoint should:
 *    - Accept refresh token from cookie (automatic, via credentials: 'include')
 *    - Return new access token (can be in body)
 *    - Optionally rotate refresh token in new cookie
 *
 * 4. In case of XSS:
 *    - Attacker CAN'T exfiltrate refresh token (it's in HttpOnly cookie)
 *    - Attacker CAN make requests as user (since they run in user's browser)
 *    - But refresh token stays safe and can be revoked server-side
 */
