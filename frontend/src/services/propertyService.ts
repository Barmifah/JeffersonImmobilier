import { apiClient } from './apiClient'

export type PropertyOperation = 'VENTE' | 'LOCATION'

export interface PropertySummary {
  id: number
  reference: string
  title: string
  slug: string
  description: string
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
