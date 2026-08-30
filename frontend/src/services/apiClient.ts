import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://api.jeffersonimmobilier.bf/api',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jefferson_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function setAccessToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common.Authorization
  }
}

export function getAccessToken() {
  return localStorage.getItem('jefferson_access_token')
}
