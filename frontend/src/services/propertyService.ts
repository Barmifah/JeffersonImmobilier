import { apiClient } from './apiClient'

export type PropertyOperation = 'VENTE' | 'LOCATION'

export interface PropertySearchParams {
  operationType?: PropertyOperation
  propertyType?: string
  location?: string
  maxPrice?: string
  page?: number
  size?: number
}

export interface PropertySummary {
  id: number
  reference: string
  title: string
  titleFr?: string
  titleEn?: string
  slug: string
  description: string
  descriptionFr?: string
  descriptionEn?: string
  propertyType: string
  operationType: PropertyOperation
  price: number
  currency: string
  city: string
  district?: string
  address?: string
  area?: number
  bedrooms?: number
  bathrooms?: number
  livingRooms?: number
  parking?: boolean
  status: string
  imageUrls: string[]
  features?: string[]
  featureIds?: number[]
}

export async function getPublishedProperties(operationType?: PropertyOperation) {
  const response = await apiClient.get<PropertySummary[]>('/properties', {
    params: operationType ? { operationType } : undefined,
  })
  return response.data
}

export async function getPublishedProperty(slug: string) {
  const response = await apiClient.get<PropertySummary>(`/properties/${slug}`)
  return response.data
}

export async function searchPublishedProperties(params: PropertySearchParams) {
  const response = await apiClient.get<{ content: PropertySummary[]; totalElements: number; totalPages: number }>('/properties/search', { params })
  return response.data
}
