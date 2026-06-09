import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Vite glob — every file added to lang/ is automatically included, no code change needed
const langModules = import.meta.glob('../config/lang/*.json')

type LangData = Record<string, unknown>

interface LangContextValue {
  lang: string
  setLang: (lang: string) => void
  t: (key: string) => string
  ta: (key: string) => string[]
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
  ta: () => [],
})

function resolve(data: LangData, key: string): unknown {
  return key.split('.').reduce<unknown>((obj, part) => {
    if (obj != null && typeof obj === 'object') return (obj as Record<string, unknown>)[part]
    return undefined
  }, data)
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') ?? 'ge')
  const [data, setData] = useState<LangData>({})

  useEffect(() => {
    const path = `../config/lang/${lang}.json`
    const loader = langModules[path]
    if (loader) {
      loader().then((mod) => setData((mod as { default: LangData }).default ?? (mod as LangData)))
    }
  }, [lang])

  function setLang(l: string) {
    localStorage.setItem('lang', l)
    setLangState(l)
  }

  function t(key: string): string {
    const val = resolve(data, key)
    return typeof val === 'string' ? val : key
  }

  function ta(key: string): string[] {
    const val = resolve(data, key)
    return Array.isArray(val) ? (val as string[]) : []
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t, ta }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
