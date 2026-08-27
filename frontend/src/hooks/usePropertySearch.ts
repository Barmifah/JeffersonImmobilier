import { useQuery } from '@tanstack/react-query'
import { searchPublishedProperties, type PropertySearchParams } from '../services/propertyService'

export function usePropertySearch(params: PropertySearchParams) {
  return useQuery({
    queryKey: ['properties', 'search', params],
    queryFn: () => searchPublishedProperties(params),
    staleTime: 60_000,
    retry: 1,
  })
}
