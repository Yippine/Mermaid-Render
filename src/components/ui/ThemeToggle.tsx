'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useThemeContext } from '@/components/layout/ThemeProvider'
import { clsx } from 'clsx'

interface ThemeToggleProps {
  variant?: 'button' | 'icon'
  className?: string
  showLabel?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme, mounted } = useThemeContext()

  // 避免水合不匹配
  if (!mounted) {
    return <div className={clsx('h-9 w-9', className)} />
  }

  const isLight = theme === 'light'
  const Icon = isLight ? Sun : Moon
  const label = isLight ? '切換到暗色模式' : '切換到亮色模式'

  if (variant === 'button') {
    return (
      <Button
        variant='outline'
        onClick={toggleTheme}
        className={clsx('flex items-center space-x-2', className)}
        data-testid='theme-toggle-button'
      >
        <Icon className='h-4 w-4' />
        {showLabel && <span>{label}</span>}
      </Button>
    )
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleTheme}
      className={className}
      title={label}
      data-testid='theme-toggle-icon'
    >
      <Icon className='h-4 w-4' />
      <span className='sr-only'>{label}</span>
    </Button>
  )
}

export default ThemeToggle
