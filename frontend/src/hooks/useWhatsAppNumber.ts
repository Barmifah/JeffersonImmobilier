import { useQuery } from '@tanstack/react-query'
import { getPublicWebsiteSettings } from '../services/contentAdminService'

const fallbackWhatsAppNumber = '22655773241'

export function useWhatsAppNumber() {
  const query = useQuery({
    queryKey: ['public', 'settings'],
    queryFn: getPublicWebsiteSettings,
    staleTime: 300_000,
    retry: 1,
  })
  return query.data?.find((setting) => setting.key === 'whatsapp.number')?.value || fallbackWhatsAppNumber
}
