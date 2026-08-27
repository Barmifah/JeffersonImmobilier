import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  function changeLanguage(language: 'fr' | 'en') {
    void i18n.changeLanguage(language)
  }

  return <div className="language-switcher" aria-label="Choisir la langue">
    <button type="button" className={i18n.language === 'fr' ? 'active' : ''} onClick={() => changeLanguage('fr')} aria-pressed={i18n.language === 'fr'}>FR</button>
    <span aria-hidden="true">|</span>
    <button type="button" className={i18n.language === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')} aria-pressed={i18n.language === 'en'}>EN</button>
  </div>
}
