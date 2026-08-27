import { apiClient, setAccessToken } from './apiClient'

interface AuthResponse {
  token: string
  tokenType: string
  expiresIn: number
  refreshToken: string
}

const tokenKey = 'jefferson_access_token'
const refreshTokenKey = 'jefferson_refresh_token'

export async function login(email: string, password: string) {
  const response = await apiClient.post<AuthResponse>('/auth/login', { email, password })
  localStorage.setItem(tokenKey, response.data.token)
  localStorage.setItem(refreshTokenKey, response.data.refreshToken)
  setAccessToken(response.data.token)
  return response.data
}

export async function refreshSession() {
  const refreshToken = localStorage.getItem(refreshTokenKey)
  if (!refreshToken) return null
  const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })
  localStorage.setItem(tokenKey, response.data.token)
  localStorage.setItem(refreshTokenKey, response.data.refreshToken)
  setAccessToken(response.data.token)
  return response.data
}

export function restoreSession() {
  const token = localStorage.getItem(tokenKey)
  setAccessToken(token)
  return token
}

export function logout() {
  localStorage.removeItem(tokenKey)
  localStorage.removeItem(refreshTokenKey)
  setAccessToken(null)
}
