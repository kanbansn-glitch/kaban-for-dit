import { apiRequest } from '../../api/client';

export function registerUser(payload) {
  return apiRequest('register', {
    method: 'POST',
    body: payload,
  });
}

export function loginUser(payload) {
  return apiRequest('login', {
    method: 'POST',
    body: payload,
  });
}

export function logoutUser(token) {
  return apiRequest('logout', {
    method: 'POST',
    token,
  });
}

export function fetchCurrentUser(token) {
  return apiRequest('me', {
    method: 'GET',
    token,
  });
}

export function loginWithGoogle(payload) {
  return apiRequest('login/google', {
    method: 'POST',
    body: payload,
  });
}

export function fetchGoogleAuthConfig() {
  return apiRequest('auth/google/config', {
    method: 'GET',
  });
}

export function requestEmailVerification(payload) {
  return apiRequest('email/verification-request', {
    method: 'POST',
    body: payload,
  });
}

export function resendEmailVerification(token) {
  return apiRequest('email/verification-notification', {
    method: 'POST',
    token,
  });
}
