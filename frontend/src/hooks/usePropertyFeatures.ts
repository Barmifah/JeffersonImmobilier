import { useQuery } from '@tanstack/react-query'
import { getPublicFeatures } from '../services/contentAdminService'

export function usePropertyFeatures() {
  return useQuery({
    queryKey: ['public', 'features'],
    queryFn: getPublicFeatures,
    staleTime: 300_000,
    retry: 1,
  })
}
