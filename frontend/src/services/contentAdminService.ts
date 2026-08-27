import { apiClient } from './apiClient'

export interface SeoMetadata {
  path: string
  title: string
  description: string
  imageUrl?: string
}

export interface SocialLink {
  network: string
  url: string
}

export interface WebsiteSetting {
  key: string
  value: string
}

export interface PropertyFeature {
  id: number
  name: string
  icon?: string
}

export interface ContactMessagePayload {
  fullName: string
  email: string
  phone?: string
  project?: string
  message: string
}

export interface ContactMessage {
  id: number
  fullName: string
  email: string
  phone?: string
  project?: string
  message: string
  status: string
  createdAt: string
}

export async function getSeoMetadata() {
  const response = await apiClient.get<SeoMetadata[]>('/admin/content/seo')
  return response.data
}

export async function saveSeoMetadata(metadata: SeoMetadata) {
  const response = await apiClient.put<SeoMetadata>('/admin/content/seo', metadata)
  return response.data
}

export async function getWebsiteSettings() {
  const response = await apiClient.get<WebsiteSetting[]>('/admin/content/settings')
  return response.data
}

export async function saveWebsiteSetting(key: string, value: string) {
  const response = await apiClient.put<WebsiteSetting>(`/admin/content/settings/${encodeURIComponent(key)}`, { value })
  return response.data
}

export async function getSocialLinks() {
  const response = await apiClient.get<SocialLink[]>('/admin/content/social-links')
  return response.data
}

export async function getPublicWebsiteSettings() {
  const response = await apiClient.get<WebsiteSetting[]>('/public/settings')
  return response.data
}

export async function submitContactMessage(payload: ContactMessagePayload) {
  const response = await apiClient.post('/contact-messages', payload)
  return response.data
}

export async function getContactMessages() {
  const response = await apiClient.get<ContactMessage[]>('/contact-messages')
  return response.data
}

export async function updateContactMessageStatus(id: number, status: string) {
  const response = await apiClient.patch<ContactMessage>(`/contact-messages/${id}/status`, null, { params: { status } })
  return response.data
}

export async function getPublicFeatures() {
  const response = await apiClient.get<PropertyFeature[]>('/public/features')
  return response.data
}
