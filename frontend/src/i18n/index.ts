import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import fr from './fr.json'

const supportedLanguages = ['fr', 'en'] as const
const storedLanguage = localStorage.getItem('jefferson_language')
const browserLanguage = navigator.language.toLowerCase().startsWith('en') ? 'en' : 'fr'
const initialLanguage = storedLanguage && supportedLanguages.includes(storedLanguage as typeof supportedLanguages[number])
  ? storedLanguage
  : browserLanguage

void i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: initialLanguage,
  fallbackLng: 'fr',
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (language) => {
  localStorage.setItem('jefferson_language', language)
  document.documentElement.lang = language
})

document.documentElement.lang = initialLanguage

export default i18n
