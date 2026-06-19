import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import type { AppConfig, Order, OrderType, OrderStatus, AdminNote } from './types'
import { createDefaultConfig, generateOrderId } from './types'

const STORAGE_KEY = 'str-admin-config'
const API_BASE = '/api'

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export interface AdminSession {
  id: string
  ip: string
  userAgent: string
  loginTime: string
  lastHeartbeat: string
  isActive: boolean
}

interface AdminContextType {
  config: AppConfig
  isAuthenticated: boolean
  loading: boolean
  adminSessions: AdminSession[]
  login: (password: string) => Promise<boolean>
  logout: () => void
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
  fetchSessions: () => Promise<void>
  updateRate: (rate: number) => void
  updateBuyRate: (rate: number) => void
  updateSellRate: (rate: number) => void
  updateFee: (fee: number) => void
  toggleService: (id: string) => void
  toggleMaintenance: (id: string) => void
  updateService: (id: string, updates: Partial<AppConfig['services'][0]>) => void
  addService: (service: AppConfig['services'][0]) => void
  deleteService: (id: string) => void
  addWalletToService: (serviceId: string, walletId: string) => void
  removeWalletFromService: (serviceId: string, walletId: string) => void
  updateHeroTitle: (title: string) => void
  updateHeroSub: (sub: string) => void
  saveConfig: () => void
  resetConfig: () => void
  createOrder: (input: {
    type: OrderType
    phone: string
    operator?: string
    amount: number
    usdtAmount: number
    sypAmount: number
    paymentMethod?: string
    paymentProof?: string
    walletAddress?: string
    note?: string
    userId?: string
    productId?: string
    quantity?: number
  }) => Order
  updateOrderStatus: (id: string, status: OrderStatus) => void
  deleteOrder: (id: string) => void
  updateWallet: (id: string, value: string) => void
  updateWalletLabel: (id: string, label: string) => void
  updateWalletCharLimit: (id: string, charLimit: number) => void
  toggleWallet: (id: string) => void
  addWallet: (wallet: AppConfig['wallets'][0]) => void
  deleteWallet: (id: string) => void
  blockPhone: (phone: string) => void
  unblockPhone: (phone: string) => void
  isPhoneBlocked: (phone: string) => boolean
  addProduct: (product: AppConfig['products'][0]) => void
  updateProduct: (id: string, updates: Partial<AppConfig['products'][0]>) => void
  deleteProduct: (id: string) => void
  addNote: (note: AdminNote) => void
  updateNote: (id: string, updates: Partial<AdminNote>) => void
  deleteNote: (id: string) => void
  toggleNoteActive: (id: string) => void
}

const AdminContext = createContext<AdminContextType | null>(null)

function loadLocal(): AppConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const defaults = createDefaultConfig()
      const base = parsed.usdtRate || defaults.usdtRate
      return {
        ...defaults,
        ...parsed,
        buyRate: parsed.buyRate || base + 2,
        sellRate: parsed.sellRate || base - 2,
        services: [
          ...defaults.services.map((d) => {
            const existing = (parsed.services ?? []).find((s: { id: string }) => s.id === d.id)
            return existing ? { ...d, ...existing, allowedWallets: existing.allowedWallets ?? [] } : d
          }),
          ...(parsed.services ?? []).filter((s: { id: string }) => !defaults.services.some((d) => d.id === s.id)),
        ],
        orders: parsed.orders ?? [],
        wallets: [
          ...defaults.wallets.map((d) => {
            const existing = (parsed.wallets ?? []).find((w: { id: string }) => w.id === d.id)
            return existing ? { ...d, ...existing } : d
          }),
          ...(parsed.wallets ?? []).filter((w: { id: string }) => !defaults.wallets.some((d) => d.id === w.id)),
        ],
        blockedPhones: parsed.blockedPhones ?? [],
        products: parsed.products ?? [],
        notes: parsed.notes ?? [],
      }
    }
  } catch (e) { console.error('loadLocal failed:', e) }
  return createDefaultConfig()
}

function saveLocal(config: AppConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (e) { console.error('saveLocal failed:', e) }
}

async function fetchConfig(): Promise<AppConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/config`)
    if (res.ok) return await res.json()
  } catch (e) { console.error('fetchConfig failed:', e) }
  return null
}

async function pushConfig(config: AppConfig): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (!res.ok) console.error('pushConfig failed:', res.status, await res.text())
    return res.ok
  } catch (e) {
    console.error('pushConfig error:', e)
    return false
  }
}

function getAdminToken(): string | null {
  return localStorage.getItem('str-admin-token')
}

function setAdminToken(token: string) {
  localStorage.setItem('str-admin-token', token)
}

function clearAdminToken() {
  localStorage.removeItem('str-admin-token')
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(loadLocal)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('str-admin-auth') === 'true'
  })
  const [loading, setLoading] = useState(true)
  const [adminSessions, setAdminSessions] = useState<AdminSession[]>([])
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    fetchConfig().then((serverData) => {
      if (serverData) {
        const defaults = createDefaultConfig()
        const base = serverData.usdtRate || defaults.usdtRate
        const merged: AppConfig = {
          ...defaults,
          ...serverData,
          buyRate: serverData.buyRate || base + 2,
          sellRate: serverData.sellRate || base - 2,
          services: [
            ...defaults.services.map((d) => {
              const existing = (serverData.services ?? []).find((s) => s.id === d.id)
              return existing ? { ...d, ...existing, allowedWallets: existing.allowedWallets ?? [] } : d
            }),
            ...(serverData.services ?? []).filter((s) => !defaults.services.some((d) => d.id === s.id)),
          ],
          orders: serverData.orders ?? [],
          wallets: [
            ...defaults.wallets.map((d) => {
              const existing = (serverData.wallets ?? []).find((w) => w.id === d.id)
              return existing ? { ...d, ...existing } : d
            }),
            ...(serverData.wallets ?? []).filter((w) => !defaults.wallets.some((d) => d.id === w.id)),
          ],
          blockedPhones: serverData.blockedPhones ?? [],
          products: serverData.products ?? [],
          notes: serverData.notes ?? [],
        }
        setConfig(merged)
        saveLocal(merged)
      }
      setLoading(false)
      initialLoadDone.current = true
    })
  }, [])

  useEffect(() => {
    if (!initialLoadDone.current) return
    saveLocal(config)
    pushConfig(config)
  }, [config])

  useEffect(() => {
    if (isAuthenticated) {
      const send = () => {
        const token = getAdminToken()
        if (token) {
          fetch(`${API_BASE}/admin/heartbeat`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {})
        }
      }
      send()
      heartbeatRef.current = setInterval(send, 30000)
    }
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    }
  }, [isAuthenticated])

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        const data = await res.json()
        setAdminToken(data.token)
        setIsAuthenticated(true)
        sessionStorage.setItem('str-admin-auth', 'true')
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    const token = getAdminToken()
    if (token) {
      fetch(`${API_BASE}/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    clearAdminToken()
    setIsAuthenticated(false)
    sessionStorage.removeItem('str-admin-auth')
  }, [])

  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
    const token = getAdminToken()
    if (!token) return false
    try {
      const res = await fetch(`${API_BASE}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      return res.ok
    } catch {
      return false
    }
  }, [])

  const fetchSessions = useCallback(async () => {
    const token = getAdminToken()
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/admin/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setAdminSessions(await res.json())
    } catch (e) { console.error('fetchSessions failed:', e) }
  }, [])

  const updateRate = useCallback((rate: number) => {
    setConfig((prev) => {
      const next = { ...prev, usdtRate: rate }
      return next
    })
  }, [])

  const updateBuyRate = useCallback((rate: number) => {
    setConfig((prev) => {
      const next = { ...prev, buyRate: rate }
      return next
    })
  }, [])

  const updateSellRate = useCallback((rate: number) => {
    setConfig((prev) => {
      const next = { ...prev, sellRate: rate }
      return next
    })
  }, [])

  const updateFee = useCallback((fee: number) => {
    setConfig((prev) => {
      const next = { ...prev, feePercent: fee }
      return next
    })
  }, [])

  const toggleService = useCallback((id: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        services: prev.services.map((s) =>
          s.id === id ? { ...s, active: !s.active } : s
        ),
      }
      return next
    })
  }, [])

  const toggleMaintenance = useCallback((id: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        services: prev.services.map((s) =>
          s.id === id ? { ...s, maintenance: !s.maintenance } : s
        ),
      }
      return next
    })
  }, [])

  const updateService = useCallback((id: string, updates: Partial<AppConfig['services'][0]>) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        services: prev.services.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      }
      return next
    })
  }, [])

  const addService = useCallback((service: AppConfig['services'][0]) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        services: [...prev.services, service],
      }
      return next
    })
  }, [])

  const deleteService = useCallback((id: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        services: prev.services.filter((s) => s.id !== id),
      }
      return next
    })
  }, [])

  const addWalletToService = useCallback((serviceId: string, walletId: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        services: prev.services.map((s) =>
          s.id === serviceId
            ? { ...s, allowedWallets: s.allowedWallets.includes(walletId) ? s.allowedWallets : [...s.allowedWallets, walletId] }
            : s
        ),
      }
      return next
    })
  }, [])

  const removeWalletFromService = useCallback((serviceId: string, walletId: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        services: prev.services.map((s) =>
          s.id === serviceId
            ? { ...s, allowedWallets: s.allowedWallets.filter((w) => w !== walletId) }
            : s
        ),
      }
      return next
    })
  }, [])

  const updateHeroTitle = useCallback((title: string) => {
    setConfig((prev) => {
      const next = { ...prev, heroTitle: title }
      return next
    })
  }, [])

  const updateHeroSub = useCallback((sub: string) => {
    setConfig((prev) => {
      const next = { ...prev, heroSub: sub }
      return next
    })
  }, [])

  const saveConfig = useCallback(() => {
    setConfig((prev) => prev)
  }, [])

  const resetConfig = useCallback(() => {
    const defaults = createDefaultConfig()
    if (config.adminPassword) defaults.adminPassword = config.adminPassword
    setConfig(defaults)
  }, [config.adminPassword])

  const createOrder = useCallback((input: {
    type: OrderType
    phone: string
    operator?: string
    amount: number
    usdtAmount: number
    sypAmount: number
    paymentMethod?: string
    paymentProof?: string
    walletAddress?: string
    note?: string
    userId?: string
    productId?: string
    quantity?: number
  }): Order => {
    const now = new Date().toISOString()
    const order: Order = {
      id: generateOrderId(),
      type: input.type,
      status: 'pending',
      phone: input.phone,
      operator: input.operator,
      amount: input.amount,
      usdtAmount: input.usdtAmount,
      sypAmount: input.sypAmount,
      paymentMethod: input.paymentMethod,
      paymentProof: input.paymentProof,
      walletAddress: input.walletAddress,
      note: input.note,
      createdAt: now,
      userId: input.userId,
      productId: input.productId,
      quantity: input.quantity,
    }
    setConfig((prev) => {
      const next = { ...prev, orders: [order, ...prev.orders] }
      if (input.type === 'buy-product' && input.productId && input.quantity) {
        next.products = next.products.map((p) =>
          p.id === input.productId && p.stock !== null
            ? { ...p, stock: Math.max(0, p.stock - (input.quantity ?? 1)) }
            : p
        )
      }
      return next
    })
    return order
  }, [])

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setConfig((prev) => {
      const order = prev.orders.find((o) => o.id === id)
      if (!order) return prev
      const allowed = STATUS_TRANSITIONS[order.status]
      if (!allowed.includes(status)) return prev
      return {
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === id
            ? { ...o, status, completedAt: status === 'completed' ? new Date().toISOString() : o.completedAt }
            : o
        ),
      }
    })
  }, [])

  const deleteOrder = useCallback((id: string) => {
    setConfig((prev) => {
      const next = { ...prev, orders: prev.orders.filter((o) => o.id !== id) }
      return next
    })
  }, [])

  const updateWallet = useCallback((id: string, value: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        wallets: prev.wallets.map((w) => w.id === id ? { ...w, value } : w),
      }
      return next
    })
  }, [])

  const updateWalletLabel = useCallback((id: string, label: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        wallets: prev.wallets.map((w) => w.id === id ? { ...w, label } : w),
      }
      return next
    })
  }, [])

  const updateWalletCharLimit = useCallback((id: string, charLimit: number) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        wallets: prev.wallets.map((w) => w.id === id ? { ...w, charLimit } : w),
      }
      return next
    })
  }, [])

  const toggleWallet = useCallback((id: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        wallets: prev.wallets.map((w) => w.id === id ? { ...w, enabled: !w.enabled } : w),
      }
      return next
    })
  }, [])

  const addWallet = useCallback((wallet: AppConfig['wallets'][0]) => {
    setConfig((prev) => {
      const next = { ...prev, wallets: [...prev.wallets, wallet] }
      return next
    })
  }, [])

  const deleteWallet = useCallback((id: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        wallets: prev.wallets.filter((w) => w.id !== id),
        services: prev.services.map((s) => ({
          ...s,
          allowedWallets: s.allowedWallets.filter((w) => w !== id),
        })),
      }
      return next
    })
  }, [])

  const blockPhone = useCallback((phone: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        blockedPhones: prev.blockedPhones.includes(phone)
          ? prev.blockedPhones
          : [...prev.blockedPhones, phone],
      }
      return next
    })
  }, [])

  const unblockPhone = useCallback((phone: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        blockedPhones: prev.blockedPhones.filter((p) => p !== phone),
      }
      return next
    })
  }, [])

  const isPhoneBlocked = useCallback((phone: string) => {
    return config.blockedPhones.includes(phone)
  }, [config.blockedPhones])

  const addProduct = useCallback((product: AppConfig['products'][0]) => {
    setConfig((prev) => ({ ...prev, products: [...prev.products, product] }))
  }, [])

  const updateProduct = useCallback((id: string, updates: Partial<AppConfig['products'][0]>) => {
    setConfig((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setConfig((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }))
  }, [])

  const addNote = useCallback((note: AdminNote) => {
    setConfig((prev) => ({ ...prev, notes: [...prev.notes, note] }))
  }, [])

  const updateNote = useCallback((id: string, updates: Partial<AdminNote>) => {
    setConfig((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }))
  }, [])

  const deleteNote = useCallback((id: string) => {
    setConfig((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }))
  }, [])

  const toggleNoteActive = useCallback((id: string) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        notes: prev.notes.map((n) => (n.id === id ? { ...n, active: !n.active } : n)),
      }
      return next
    })
  }, [])

  return (
    <AdminContext.Provider
      value={{
        config,
        isAuthenticated,
        loading,
        adminSessions,
        login,
        logout,
        changePassword,
        fetchSessions,
        updateRate,
        updateBuyRate,
        updateSellRate,
        updateFee,
        toggleService,
        toggleMaintenance,
        updateService,
        addService,
        deleteService,
        addWalletToService,
        removeWalletFromService,
        updateHeroTitle,
        updateHeroSub,
        saveConfig,
        resetConfig,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        updateWallet,
        updateWalletLabel,
        updateWalletCharLimit,
        toggleWallet,
        addWallet,
        deleteWallet,
        blockPhone,
        unblockPhone,
        isPhoneBlocked,
        addProduct,
        updateProduct,
        deleteProduct,
        addNote,
        updateNote,
        deleteNote,
        toggleNoteActive,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
