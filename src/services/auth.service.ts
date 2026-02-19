import { AUTH_BASE, FRONT_USER_BASE } from './api';

// Store access token in localStorage for cross-origin scenarios
const TOKEN_KEY = 'zehn_access_token';

let storedAccessToken: string | null = localStorage.getItem(TOKEN_KEY);

export function getStoredAccessToken(): string | null {
  return storedAccessToken;
}

export function setStoredAccessToken(token: string | null): void {
  storedAccessToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_BASE}/exists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, captchaToken: 'web_client' }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.data?.isRegistered ?? false;
    }
    return false;
  } catch {
    return false;
  }
}

export async function sendOTP(email: string): Promise<void> {
  const response = await fetch(`${AUTH_BASE}/login-with-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.error?.code || data.error?.message || data.message || 'Failed to send OTP';
    const blockedTime = data.error?.data?.blockedTime;
    throw new Error(blockedTime ? `${errorMsg} (Wait ${blockedTime}s)` : errorMsg);
  }
}

export async function verifyOTP(email: string, code: string): Promise<{ userId: string | null }> {
  const response = await fetch(`${AUTH_BASE}/verify-with-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, code }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Invalid OTP');
  }

  // Store the access token for subsequent requests
  if (data.tokens?.accessToken) {
    setStoredAccessToken(data.tokens.accessToken);
  }

  // Try to get userId from response data
  let userId = data.data?.user?._id || data.data?.user?.id || null;

  // If not in data, decode from JWT accessToken
  if (!userId && data.tokens?.accessToken) {
    try {
      const payload = JSON.parse(atob(data.tokens.accessToken.split('.')[1]));
      userId = payload._id || payload.id || null;
    } catch {
      // ignore decode errors
    }
  }

  return { userId };
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (storedAccessToken) {
    headers['Authorization'] = `Bearer ${storedAccessToken}`;
  }
  return headers;
}

export async function fetchCurrentUserId(): Promise<string | null> {
  try {
    const res = await fetch(`${AUTH_BASE}/me`, {
      credentials: 'include',
      headers: storedAccessToken ? { 'Authorization': `Bearer ${storedAccessToken}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      return data.data?._id || data.data?.id || data._id || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function submitProfile(
  userId: string,
  profile: { firstName: string; lastName: string; username: string; age: number }
): Promise<boolean> {
  const res = await fetch(`${AUTH_BASE}/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.message || err.error?.message || '';
    if (msg.toLowerCase().includes('username')) {
      throw new Error('Username already taken, try another');
    }
    return false;
  }
  return true;
}

export async function loginWithGoogle(idToken: string): Promise<{ userId: string | null }> {
  const response = await fetch(`${AUTH_BASE}/login-with-google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Google login failed');
  }

  if (data.tokens?.accessToken) {
    setStoredAccessToken(data.tokens.accessToken);
  }

  let userId: string | null = null;
  if (data.tokens?.accessToken) {
    try {
      const payload = JSON.parse(atob(data.tokens.accessToken.split('.')[1]));
      userId = payload._id || payload.id || null;
    } catch {
      // ignore
    }
  }
  return { userId };
}

export async function loginWithApple(idToken: string): Promise<{ userId: string | null }> {
  const response = await fetch(`${AUTH_BASE}/login-with-apple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Apple login failed');
  }

  if (data.tokens?.accessToken) {
    setStoredAccessToken(data.tokens.accessToken);
  }

  let userId: string | null = null;
  if (data.tokens?.accessToken) {
    try {
      const payload = JSON.parse(atob(data.tokens.accessToken.split('.')[1]));
      userId = payload._id || payload.id || null;
    } catch {
      // ignore
    }
  }
  return { userId };
}

export function logout(): void {
  setStoredAccessToken(null);
  document.cookie = 'm_at=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'm_rt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'm_did=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export function isAuthenticatedFromCookies(): boolean {
  // Check cookies first
  const cookies = document.cookie;
  if (cookies.includes('m_at=') && cookies.includes('m_did=')) return true;
  // Fallback: check stored token (for cross-origin scenarios)
  return !!storedAccessToken;
}

export async function trackFrontUser(data: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`${FRONT_USER_BASE}/track`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
  } catch {
    // fire-and-forget
  }
}
