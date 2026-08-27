import { apiClient, getAccessToken } from './apiClient'
import type { PropertySummary } from './propertyService'

export interface InquirySummary {
  id: number
  propertyTitle: string
  propertyReference: string
  fullName: string
  email: string
  phone: string
  message: string
  status: string
  createdAt: string
}

export interface AdminDashboardSummary {
  publishedProperties: number
  availableProperties: number
  totalInquiries: number
  newInquiries: number
  totalViews: number
  properties: PropertySummary[]
  inquiries: InquirySummary[]
}

export interface CreatePropertyPayload {
  reference: string
  title: string
  titleFr?: string
  titleEn?: string
  slug: string
  description: string
  descriptionFr?: string
  descriptionEn?: string
  propertyType: string
  operationType: 'VENTE' | 'LOCATION'
  price: number
  currency: string
  city: string
  district?: string
  address?: string
  area?: number
  bedrooms?: number
  imageUrls: string[]
  featureIds?: number[]
}

export async function createProperty(payload: CreatePropertyPayload) {
  const response = await apiClient.post<PropertySummary>('/properties', payload, {
    headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
  })
  return response.data
}

export async function updateProperty(id: number, payload: CreatePropertyPayload) {
  const response = await apiClient.put<PropertySummary>(`/properties/${id}`, payload, {
    headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
  })
  return response.data
}

export async function getAdminDashboard() {
  const response = await apiClient.get<AdminDashboardSummary>('/admin/dashboard')
  return response.data
}

export async function updatePropertyStatus(id: number, status: string) {
  const response = await apiClient.patch<PropertySummary>(`/properties/${id}/status`, null, {
    params: { status },
    headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
  })
  return response.data
}

export async function updateInquiryStatus(id: number, status: string) {
  const response = await apiClient.patch<InquirySummary>(`/inquiries/${id}/status`, null, {
    params: { status },
    headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
  })
  return response.data
}
