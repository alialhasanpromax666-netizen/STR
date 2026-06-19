export interface ServiceStatus {
  id: string
  name: string
  active: boolean
  maintenance: boolean
  allowedWallets: string[]
}

export interface Wallet {
  id: string
  label: string
  value: string
  enabled: boolean
  createdAt: string
  charLimit?: number
}

export interface Product {
  id: string
  name: string
  description: string
  image: string
  priceUSD: number
  stock: number | null
  paymentMethods: string[]
  active: boolean
  createdAt: string
}

export interface CryptoAsset {
  id: string
  symbol: string
  name: string
  nameAr: string
  coingeckoId: string
}

export type NoteSection = 'home' | 'recharge' | 'crypto' | 'products' | 'orders' | 'contact' | 'all'
export type NoteType = 'info' | 'warning' | 'alert'

export interface AdminNote {
  id: string
  title: string
  content: string
  section: NoteSection
  type: NoteType
  active: boolean
  createdAt: string
}

export type OrderType = 'recharge' | 'buy-usdt' | 'sell-usdt' | 'buy-crypto' | 'sell-crypto' | 'buy-product'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface Order {
  id: string
  type: OrderType
  status: OrderStatus
  phone: string
  operator?: string
  amount: number
  usdtAmount: number
  sypAmount: number
  paymentMethod?: string
  paymentProof?: string
  walletAddress?: string
  note?: string
  createdAt: string
  completedAt?: string
  userId?: string
  productId?: string
  quantity?: number
}

export interface AppConfig {
  usdtRate: number
  buyRate: number
  sellRate: number
  feePercent: number
  adminPassword?: string
  services: ServiceStatus[]
  heroTitle: string
  heroSub: string
  orders: Order[]
  wallets: Wallet[]
  blockedPhones: string[]
  products: Product[]
  notes: AdminNote[]
}

export const CRYPTOS: CryptoAsset[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', nameAr: 'بيتكوين', coingeckoId: 'bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', nameAr: 'إيثيريوم', coingeckoId: 'ethereum' },
  { id: 'usdt', symbol: 'USDT', name: 'Tether', nameAr: 'تيثير', coingeckoId: 'tether' },
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin', nameAr: 'USD كوين', coingeckoId: 'usd-coin' },
  { id: 'bnb', symbol: 'BNB', name: 'BNB', nameAr: 'بي إن بي', coingeckoId: 'binancecoin' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', nameAr: 'سولانا', coingeckoId: 'solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', nameAr: 'ريبل', coingeckoId: 'ripple' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', nameAr: 'كاردانو', coingeckoId: 'cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', nameAr: 'دوجكوين', coingeckoId: 'dogecoin' },
  { id: 'tron', symbol: 'TRX', name: 'TRON', nameAr: 'ترون', coingeckoId: 'tron' },
]

export const defaultServices: ServiceStatus[] = [
  { id: 'mtn', name: 'شحن MTN', active: true, maintenance: false, allowedWallets: ['usdt', 'sham-cash', 'sham-cash-usd', 'sham-cash-syp', 'syriatel-cash', 'mtn-cash'] },
  { id: 'syriatel', name: 'شحن Syriatel', active: true, maintenance: false, allowedWallets: ['usdt', 'sham-cash', 'sham-cash-usd', 'sham-cash-syp', 'syriatel-cash', 'mtn-cash'] },
  { id: 'mtn-cash', name: 'MTN كاش', active: true, maintenance: false, allowedWallets: ['usdt', 'sham-cash', 'sham-cash-usd', 'sham-cash-syp', 'syriatel-cash'] },
  { id: 'syriatel-cash', name: 'سريتل كاش', active: true, maintenance: false, allowedWallets: ['usdt', 'sham-cash', 'sham-cash-usd', 'sham-cash-syp', 'mtn-cash'] },
  { id: 'crypto-buy', name: 'شراء عملات مشفرة', active: true, maintenance: false, allowedWallets: ['sham-cash', 'sham-cash-usd', 'sham-cash-syp', 'syriatel-cash', 'mtn-cash'] },
  { id: 'sham-cash-usd', name: 'شحن Sham Cash (دولار)', active: true, maintenance: false, allowedWallets: ['usdt', 'sham-cash-usd', 'sham-cash-syp'] },
  { id: 'sham-cash-syp', name: 'شحن Sham Cash (سوري)', active: true, maintenance: false, allowedWallets: ['usdt', 'sham-cash-usd', 'sham-cash-syp'] },
]

export const defaultWallets: Wallet[] = [
  { id: 'usdt', label: 'USDT (TRC20)', value: '', enabled: true, createdAt: new Date(Date.now() - 7000).toISOString() },
  { id: 'sham-cash', label: 'Sham Cash', value: '', enabled: true, createdAt: new Date(Date.now() - 6000).toISOString() },
  { id: 'sham-cash-usd', label: 'Sham Cash (دولار)', value: '', enabled: true, createdAt: new Date(Date.now() - 5500).toISOString() },
  { id: 'sham-cash-syp', label: 'Sham Cash (سوري)', value: '', enabled: true, createdAt: new Date(Date.now() - 5000).toISOString() },
  { id: 'syriatel-cash', label: 'سريتل كاش', value: '', enabled: true, createdAt: new Date(Date.now() - 4000).toISOString() },
  { id: 'mtn-cash', label: 'MTN كاش', value: '', enabled: true, createdAt: new Date(Date.now() - 3000).toISOString() },
  ...CRYPTOS.map((c, i) => ({
    id: `crypto-${c.id}`,
    label: `${c.name} (${c.symbol})`,
    value: '',
    enabled: true,
    createdAt: new Date(Date.now() - 2000 + i * 100).toISOString(),
  })),
]

export function createDefaultConfig(): AppConfig {
  return {
    usdtRate: 144,
    buyRate: 146,
    sellRate: 142,
    feePercent: 0,
    services: defaultServices,
    heroTitle: '',
    heroSub: '',
    orders: [],
    wallets: defaultWallets,
    blockedPhones: [],
    products: [],
    notes: [],
  }
}

let _orderCounter = Date.now()
export function generateOrderId(): string {
  _orderCounter++
  return `ORD-${_orderCounter.toString(36).toUpperCase()}`
}

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}
