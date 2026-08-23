import { apiClient } from './apiClient'
import type { PropertySummary } from './propertyService'

export interface CreatePropertyPayload {
  reference: string
  title: string
  slug: string
  description: string
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
}

export async function createProperty(payload: CreatePropertyPayload) {
  const response = await apiClient.post<PropertySummary>('/properties', payload)
  return response.data
}
