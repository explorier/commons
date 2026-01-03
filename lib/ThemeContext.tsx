'use client'

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="commons-theme"
    >
      {children}
    </NextThemesProvider>
  )
}

export function useTheme() {
  const { theme, resolvedTheme, setTheme } = useNextTheme()
  return {
    theme: (theme || 'system') as 'light' | 'dark' | 'system',
    resolvedTheme: (resolvedTheme || 'light') as 'light' | 'dark',
    setTheme,
  }
}
