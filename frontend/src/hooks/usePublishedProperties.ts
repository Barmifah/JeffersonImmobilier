import { useQuery } from '@tanstack/react-query'
import { getPublishedProperties, searchPublishedProperties, type PropertyOperation, type PropertySearchParams } from '../services/propertyService'

export function usePublishedProperties(operationType?: PropertyOperation, searchParams?: Omit<PropertySearchParams, 'operationType'>) {
  const hasSearch = Boolean(searchParams && Object.values(searchParams).some(Boolean))
  const params = hasSearch ? { ...searchParams, operationType } : undefined
  return useQuery({
    queryKey: ['properties', 'published', operationType ?? 'all', params],
    queryFn: async () => hasSearch
      ? (await searchPublishedProperties(params!)).content
      : getPublishedProperties(operationType),
    staleTime: 60_000,
    retry: 1,
  })
}
