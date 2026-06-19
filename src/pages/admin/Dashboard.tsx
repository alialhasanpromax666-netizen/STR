import { useAdmin } from '../../store/AdminContext'
import { ShieldIcon, ClockIcon, ZapIcon, WalletIcon, ShoppingCartIcon } from '../../components/icons/Icons'

const serviceNames: Record<string, string> = {
  'mtn': 'شحن MTN',
  'syriatel': 'شحن Syriatel',
  'mtn-cash': 'MTN كاش',
  'syriatel-cash': 'سريتل كاش',
  'crypto-buy': 'شراء عملات مشفرة',
  'sham-cash': 'Sham Cash',
  'binance': 'Binance',
}

export default function Dashboard() {
  const { config } = useAdmin()

  const activeCount = config.services.filter((s) => s.active).length
  const maintenanceCount = config.services.filter((s) => s.maintenance).length
  const pendingOrders = config.orders.filter((o) => o.status === 'pending' || o.status === 'processing').length
  const productCount = config.products.filter((p) => p.active).length

  return (
    <div>
      <h2 className="h2 text-espresso mb-6">لوحة التحكم</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="luxury-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <ShieldIcon size={18} className="text-emerald" />
            <span className="caption">الخدمات النشطة</span>
          </div>
          <p className="h2 gold-text">{activeCount}<span className="h4 text-espresso-muted me-1">/ {config.services.length}</span></p>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <ClockIcon size={18} className="text-gold" />
            <span className="caption">سعر USD</span>
          </div>
          <p className="h2 mono text-espresso">{config.usdtRate.toLocaleString()} <span className="h4 text-espresso-muted">ل.س</span></p>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <WalletIcon size={18} className="text-espresso-muted" />
            <span className="caption">الطلبات النشطة</span>
          </div>
          <p className="h2 text-espresso">{pendingOrders}</p>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCartIcon size={18} className="text-gold" />
            <span className="caption">المنتجات المتاحة</span>
          </div>
          <p className="h2 gold-text">{productCount}<span className="h4 text-espresso-muted me-1">/ {config.products.length}</span></p>
        </div>
        <div className="luxury-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <ZapIcon size={18} className="text-espresso-muted" />
            <span className="caption">في وضع الصيانة</span>
          </div>
          <p className="h2 text-espresso">{maintenanceCount}</p>
        </div>
      </div>

      <div className="luxury-card p-5">
        <h3 className="h3 text-espresso mb-4">حالة الخدمات</h3>
        <div className="space-y-2">
          {config.services.map((svc) => (
            <div key={svc.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm font-heading font-medium text-espresso">{serviceNames[svc.id] || svc.id}</span>
              <div className="flex items-center gap-3">
                {svc.maintenance && (
                  <span className="text-xs text-gold bg-gold-subtle px-2 py-0.5 rounded font-heading">صيانة</span>
                )}
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${svc.active ? 'bg-emerald-light text-emerald' : 'bg-error-faint text-red'}`}>
                  {svc.active ? 'نشط' : 'متوقف'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
