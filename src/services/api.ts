const API_BASE = 'https://api.zehnly.ai/v1/personalized-learning/course';
const AUTH_BASE = 'https://api.zehnly.ai/v1/users';
const SPEECH_BASE = 'https://api.zehnly.ai/v1/speech';
const FRONT_USER_BASE = 'https://api.zehnly.ai/v1/front-users';

export { API_BASE, AUTH_BASE, SPEECH_BASE, FRONT_USER_BASE };

export async function apiCall<T = any>(endpoint: string, method = 'GET', body: unknown = null): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // Include stored access token for cross-origin auth
  const { getStoredAccessToken } = await import('./auth.service');
  const token = getStoredAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }
  return data;
}
