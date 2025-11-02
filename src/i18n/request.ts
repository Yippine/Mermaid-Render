import { getRequestConfig } from 'next-intl/server'
import { defaultLocale } from './config'

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is defined, fallback to default
  const actualLocale = locale || defaultLocale

  try {
    const messages = (await import(`../../messages/${actualLocale}.json`))
      .default
    return {
      locale: actualLocale,
      messages,
    }
  } catch {
    console.warn(
      `Failed to load messages for locale ${actualLocale}, falling back to ${defaultLocale}`
    )
    const fallbackMessages = (
      await import(`../../messages/${defaultLocale}.json`)
    ).default
    return {
      locale: defaultLocale,
      messages: fallbackMessages,
    }
  }
})
