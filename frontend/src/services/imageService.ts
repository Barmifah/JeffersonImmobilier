import { apiClient } from './apiClient'

export async function uploadPropertyImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<{ url: string }>('/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.url
}
