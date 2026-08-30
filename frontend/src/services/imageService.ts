export async function uploadPropertyImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${import.meta.env.VITE_API_URL}/images`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const result = await response.json() as { url?: string }
  if (!result.url) {
    throw new Error('No URL returned')
  }

  return result.url
}