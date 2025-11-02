// Define supported locales
export const locales = ['en', 'zh-TW', 'zh-CN'] as const
export type Locale = (typeof locales)[number]

// Default locale
export const defaultLocale: Locale = 'zh-TW'
