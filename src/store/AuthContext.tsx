import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface DeviceUser {
  deviceId: string
  phone: string
}

interface AuthContextType {
  deviceId: string
  phone: string
  setPhone: (phone: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEVICE_KEY = 'str-device-id'
const PHONE_KEY = 'str-device-phone'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return 'dev-' + crypto.randomUUID()
  }
  return 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* localStorage unavailable */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [deviceId] = useState<string>(() => {
    const existing = safeGet(DEVICE_KEY)
    if (existing) return existing
    const id = generateUUID()
    safeSet(DEVICE_KEY, id)
    return id
  })

  const [phone, setPhoneState] = useState<string>(() => {
    return safeGet(PHONE_KEY) || ''
  })

  const setPhone = useCallback((p: string) => {
    safeSet(PHONE_KEY, p)
    setPhoneState(p)
  }, [])

  return (
    <AuthContext.Provider value={{ deviceId, phone, setPhone }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
