export async function uploadPropertyImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? 'vj3x82ms')
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? 'grbf6yuq'
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error(`Cloudinary upload failed: ${response.status}`)
  const result = await response.json() as { secure_url?: string }
  if (!result.secure_url) throw new Error('Cloudinary did not return a secure URL')
  return result.secure_url
}
