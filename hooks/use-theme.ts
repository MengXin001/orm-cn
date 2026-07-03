'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null

    if (storedTheme) {
      setTheme(storedTheme)
      applyTheme(storedTheme)
    } else {
      const isDarkByTime = isDarkByLocalTime()
      const isDarkBySystem = window.matchMedia('(prefers-color-scheme: dark)').matches
      const preferredTheme = isDarkByTime || isDarkBySystem ? 'dark' : 'light'

      setTheme(preferredTheme)
      applyTheme(preferredTheme)
    }

    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const storedTheme = localStorage.getItem('theme')
      if (!storedTheme) {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mounted])

  return {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
      applyTheme(newTheme)
      localStorage.setItem('theme', newTheme)
    },
    toggleTheme: () => {
      const newTheme = theme === 'light' ? 'dark' : 'light'
      setTheme(newTheme)
      applyTheme(newTheme)
      localStorage.setItem('theme', newTheme)
    },
    mounted,
  }
}

function applyTheme(theme: Theme) {
  const html = document.documentElement
  if (theme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

function isDarkByLocalTime(): boolean {
  const now = new Date()
  const hour = now.getHours()
  return hour >= 20 || hour < 6
}
