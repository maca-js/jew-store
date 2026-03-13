import { getRequestConfig } from 'next-intl/server'
import { routing } from '@/shared/config/i18n'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Fallback to default locale if not valid
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
