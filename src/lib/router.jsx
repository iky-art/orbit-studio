import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

/**
 * Router kecil tanpa dependensi.
 * - Path bersih (`/`, `/app`, `/app/admin/pengguna`) memakai History API.
 * - Vite dev/preview sudah menyediakan fallback SPA untuk path dalam.
 */

const RouterContext = createContext({
  url: '/',
  path: '/',
  navigate: () => {},
  back: () => {},
})

const normalizePath = (value) => {
  if (!value) return '/'
  let out = String(value).split('#')[0]
  if (!out.startsWith('/')) out = `/${out}`
  out = out.replace(/\/{2,}/g, '/')
  if (out.length > 1) out = out.replace(/\/+$/, '')
  return out || '/'
}

const splitUrl = (value) => {
  const raw = value && value.startsWith('/') ? value : `/${value || ''}`
  const [pathname, search = ''] = raw.split('?')
  return { path: normalizePath(pathname), search }
}

export function RouterProvider({ children }) {
  const [url, setUrl] = useState(() => {
    if (typeof window === 'undefined') return '/'
    return `${window.location.pathname}${window.location.search}`
  })

  useEffect(() => {
    const onPop = () => {
      setUrl(`${window.location.pathname}${window.location.search}`)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to, options = {}) => {
    if (typeof window === 'undefined') return
    const target = to.startsWith('/') ? to : `/${to}`
    const current = `${window.location.pathname}${window.location.search}`
    if (target === current) {
      if (options.scroll !== false) window.scrollTo({ top: 0 })
      return
    }
    if (options.replace) window.history.replaceState(null, '', target)
    else window.history.pushState(null, '', target)
    setUrl(target)
    if (options.scroll !== false) window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const back = useCallback(() => {
    if (typeof window !== 'undefined') window.history.back()
  }, [])

  const value = useMemo(() => {
    const { path, search } = splitUrl(url)
    return { url, path, search, navigate, back }
  }, [url, navigate, back])

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  )
}

export function useRouter() {
  return useContext(RouterContext)
}

export function useSearchParams() {
  const { search } = useRouter()
  return useMemo(() => new URLSearchParams(search), [search])
}

/**
 * Cocokkan pola seperti `/app/admin/:panel` dengan path aktual.
 * Mendukung segmen opsional di akhir (`:section?`) dan wildcard (`*`).
 * Mengembalikan objek parameter, atau null bila tidak cocok.
 */
export function matchPath(pattern, pathname) {
  const p = normalizePath(pattern).split('/').filter(Boolean)
  const s = normalizePath(pathname).split('/').filter(Boolean)
  const wildcard = p[p.length - 1] === '*'
  const fixed = wildcard ? p.slice(0, -1) : p

  // Segmen opsional hanya didukung pada bagian akhir pola.
  let required = fixed.length
  while (required > 0 && fixed[required - 1].endsWith('?')) required -= 1

  if (wildcard ? s.length < required : s.length < required || s.length > fixed.length) {
    return null
  }

  const params = {}
  for (let i = 0; i < s.length; i += 1) {
    const seg = fixed[i]
    if (!seg) break
    if (seg.startsWith(':')) {
      params[seg.slice(1).replace(/\?$/, '')] = decodeURIComponent(s[i])
    } else if (seg.replace(/\?$/, '') !== s[i]) {
      return null
    }
  }
  if (wildcard) params['*'] = s.slice(fixed.length).join('/')
  return params
}

export function Link({ to, replace, scroll, className, children, ...rest }) {
  const { navigate } = useRouter()
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return
        }
        event.preventDefault()
        navigate(to, { replace, scroll })
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
