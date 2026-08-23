import { useQuery } from '@tanstack/react-query'
import { getPublishedProperties, type PropertyOperation } from '../services/propertyService'

export function usePublishedProperties(operationType?: PropertyOperation) {
  return useQuery({
    queryKey: ['properties', 'published', operationType ?? 'all'],
    queryFn: () => getPublishedProperties(operationType),
    staleTime: 60_000,
    retry: 1,
  })
}
