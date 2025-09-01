'use client'

import { useEffect, useState } from 'react'
import { useEditorStore } from '@/stores/editorStore'

// type Theme = 'light' | 'dark' | 'system'; // 未來可能會需要系統主題

export function useTheme() {
  const { theme: editorTheme, setTheme } = useEditorStore()
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  // 檢測系統主題
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    // 初始化
    updateSystemTheme()

    // 監聽系統主題變化
    mediaQuery.addEventListener('change', updateSystemTheme)

    // 標記為已掛載
    setMounted(true)

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme)
    }
  }, [])

  // 應用主題到 HTML 元素
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const isDark = editorTheme === 'dark'

    // 更新 HTML 類別
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 更新 CSS 變數
    if (isDark) {
      // 暗色主題變數
      root.style.setProperty('--background', '224 71.4% 4.1%')
      root.style.setProperty('--foreground', '210 20% 98%')
      root.style.setProperty('--muted', '215 27.9% 16.9%')
      root.style.setProperty('--muted-foreground', '217.9 10.6% 64.9%')
      root.style.setProperty('--popover', '224 71.4% 4.1%')
      root.style.setProperty('--popover-foreground', '210 20% 98%')
      root.style.setProperty('--border', '215 27.9% 16.9%')
      root.style.setProperty('--input', '215 27.9% 16.9%')
      root.style.setProperty('--card', '224 71.4% 4.1%')
      root.style.setProperty('--card-foreground', '210 20% 98%')
      root.style.setProperty('--primary', '210 20% 98%')
      root.style.setProperty('--primary-foreground', '220.9 39.3% 11%')
      root.style.setProperty('--secondary', '215 27.9% 16.9%')
      root.style.setProperty('--secondary-foreground', '210 20% 98%')
      root.style.setProperty('--accent', '215 27.9% 16.9%')
      root.style.setProperty('--accent-foreground', '210 20% 98%')
      root.style.setProperty('--destructive', '0 62.8% 30.6%')
      root.style.setProperty('--destructive-foreground', '210 20% 98%')
      root.style.setProperty('--ring', '216 12.2% 83.9%')
    } else {
      // 亮色主題變數
      root.style.setProperty('--background', '0 0% 100%')
      root.style.setProperty('--foreground', '222.2 84% 4.9%')
      root.style.setProperty('--muted', '210 40% 96%')
      root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%')
      root.style.setProperty('--popover', '0 0% 100%')
      root.style.setProperty('--popover-foreground', '222.2 84% 4.9%')
      root.style.setProperty('--border', '214.3 31.8% 91.4%')
      root.style.setProperty('--input', '214.3 31.8% 91.4%')
      root.style.setProperty('--card', '0 0% 100%')
      root.style.setProperty('--card-foreground', '222.2 84% 4.9%')
      root.style.setProperty('--primary', '222.2 47.4% 11.2%')
      root.style.setProperty('--primary-foreground', '210 40% 98%')
      root.style.setProperty('--secondary', '210 40% 96%')
      root.style.setProperty('--secondary-foreground', '222.2 47.4% 11.2%')
      root.style.setProperty('--accent', '210 40% 96%')
      root.style.setProperty('--accent-foreground', '222.2 47.4% 11.2%')
      root.style.setProperty('--destructive', '0 84.2% 60.2%')
      root.style.setProperty('--destructive-foreground', '210 40% 98%')
      root.style.setProperty('--ring', '215 20.2% 65.1%')
    }
  }, [editorTheme, mounted])

  const toggleTheme = () => {
    setTheme(editorTheme === 'dark' ? 'light' : 'dark')
  }

  const setThemeMode = (theme: 'light' | 'dark') => {
    setTheme(theme)
  }

  return {
    theme: editorTheme,
    systemTheme,
    setTheme: setThemeMode,
    toggleTheme,
    mounted,
  }
}
