import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

export function InstallAppButton() {
  const { t } = useTranslation()
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)
  const userAgent = navigator.userAgent.toLowerCase()
  const isIos = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  if (isIos && !isStandalone) return <p className="ios-install-help">{t('offline.ios')}</p>
  if (!promptEvent) return null

  async function install() {
    if (!promptEvent) return
    const installPrompt: InstallPromptEvent = promptEvent
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') setPromptEvent(null)
  }

  return <button type="button" className="install-app-button" onClick={install}>{t('pwa.install')}</button>
}
