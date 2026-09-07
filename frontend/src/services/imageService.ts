import { getAccessToken } from './apiClient'

export async function uploadPropertyImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  // Nettoie l'URL pour éviter les doubles slashes '//'
  const baseUrl = (import.meta.env.VITE_API_URL ?? 'https://jeffersonimmobilier.bf').replace(/\/$/, '')
  
  const response = await fetch(`${baseUrl}/images`, {
    method: 'POST',
    body: formData,
    headers: getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : undefined,
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Votre session administrateur a expiré. Reconnectez-vous.')
    }
    throw new Error('Upload failed')
  }

  const result = await response.json() as { url?: string }
  if (!result.url) {
    throw new Error('No URL returned')
  }

  return result.url
}
