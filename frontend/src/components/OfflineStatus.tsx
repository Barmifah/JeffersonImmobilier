import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function OfflineStatus() {
  const { t } = useTranslation()
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine)
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return online ? null : <div className="offline-status" role="status">{t('offline.message')}</div>
}