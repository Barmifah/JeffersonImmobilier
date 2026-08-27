import { useTranslation } from 'react-i18next'
import type { PropertySummary } from '../services/propertyService'

export function useLocalizedProperty(property: Pick<PropertySummary, 'title' | 'description' | 'titleFr' | 'titleEn' | 'descriptionFr' | 'descriptionEn'>) {
  const { i18n } = useTranslation()
  const isEnglish = i18n.language === 'en'
  return {
    title: (isEnglish ? property.titleEn : property.titleFr) || property.title,
    description: (isEnglish ? property.descriptionEn : property.descriptionFr) || property.description,
  }
}
