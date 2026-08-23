import { apiClient, setAccessToken } from './apiClient'

interface AuthResponse {
  token: string
  tokenType: string
  expiresIn: number
}

const tokenKey = 'jefferson_access_token'

export async function login(email: string, password: string) {
  const response = await apiClient.post<AuthResponse>('/auth/login', { email, password })
  localStorage.setItem(tokenKey, response.data.token)
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
  setAccessToken(null)
}
