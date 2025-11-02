'use client'

import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales, type Locale } from '@/i18n/config'
import { Languages } from 'lucide-react'

export const LanguageSwitcher: React.FC = () => {
  const t = useTranslations('languages')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLocale: Locale) => {
    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.replace(`/${locale}`, '')
    const newPath = `/${newLocale}${pathWithoutLocale}`
    router.push(newPath)
  }

  return (
    <div className='relative inline-block'>
      <div className='flex items-center space-x-1'>
        <Languages className='w-4 h-4 text-muted-foreground' />
        <select
          value={locale}
          onChange={e => switchLanguage(e.target.value as Locale)}
          className='bg-transparent text-sm border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500'
        >
          {locales.map(loc => (
            <option key={loc} value={loc} className='bg-background'>
              {t(loc)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default LanguageSwitcher
