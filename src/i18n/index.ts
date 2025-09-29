import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@locales/en/common.json'
import vi from '@locales/vi/common.json'

export const supportedLanguages = {
  en: 'English',
  vi: 'Tiếng Việt',
} as const

type SupportedLanguage = keyof typeof supportedLanguages

const resolvedLanguage = (() => {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const storedLanguage = window.localStorage.getItem('app_language') as SupportedLanguage | null
  if (storedLanguage && supportedLanguages[storedLanguage]) {
    return storedLanguage
  }

  const browserLanguage = window.navigator.language.split('-')[0] as SupportedLanguage
  if (browserLanguage && supportedLanguages[browserLanguage]) {
    return browserLanguage
  }

  return 'en'
})()

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: resolvedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    supportedLngs: Object.keys(supportedLanguages),
    returnNull: false,
    returnEmptyString: false,
  })
  .then(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app_language', i18n.language)
    }
  })
  .catch((error) => {
    console.error('Failed to initialise i18n', error)
  })

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('app_language', lng)
  }
})

export default i18n
