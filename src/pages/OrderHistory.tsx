import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdmin } from '../store/AdminContext'
import { useAuth } from '../store/AuthContext'
import NotesBanner from '../components/admin/NotesBanner'
import {
  CheckIcon,
  ClockIcon,
  ZapIcon,
  XIcon,
  WalletIcon,
  CreditCardIcon,
  PhoneIcon,
  BtcIcon,
  ShoppingCartIcon,
} from '../components/icons/Icons'

const typeIcon: Record<string, React.ReactNode> = {
  recharge: <PhoneIcon size={16} />,
  'buy-usdt': <CreditCardIcon size={16} />,
  'buy-crypto': <BtcIcon size={16} />,
  'sell-crypto': <BtcIcon size={16} />,
  'buy-product': <ShoppingCartIcon size={16} />,
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-light text-emerald border-emerald/30',
    cancelled: 'bg-red-50 text-red border-red/20',
  }
  const icons: Record<string, React.ReactNode> = {
    pending: <ClockIcon size={12} />,
    processing: <ZapIcon size={12} />,
    completed: <CheckIcon size={12} />,
    cancelled: <XIcon size={12} />,
  }
  const labels: Record<string, string> = {
    pending: 'معلّق',
    processing: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
        styles[status] || styles.pending
      }`}
    >
      {icons[status]}
      {labels[status] || status}
    </span>
  )
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    recharge: 'شحن رصيد',
    'buy-usdt': 'شراء USD',
    'buy-crypto': 'شراء عملات',
    'sell-crypto': 'بيع عملات',
    'buy-product': 'شراء منتج',
  }
  return labels[type] || type
}

export default function OrderHistory() {
  const { t } = useTranslation()
  const { config } = useAdmin()
  const { deviceId } = useAuth()

  const orders = useMemo(() => {
    const userOrders = config.orders.filter((o) => o.userId === deviceId)
    return userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [config.orders, deviceId])

  return (
    <div className="section">
      <div className="max-w-3xl mx-auto">
        <NotesBanner section="orders" />
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="h1 text-espresso">{t('orders.title')}</h1>
          <p className="body-secondary mt-2">{t('orders.desc')}</p>
        </div>

        {orders.length === 0 ? (
          <div className="luxury-card p-8 text-center animate-fade-up">
            <WalletIcon size={32} className="mx-auto mb-3 text-espresso-faint" />
            <p className="body-secondary">لا توجد طلبات حتى الآن</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <div
                key={order.id}
                className={`luxury-card p-4 animate-fade-up`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-espresso-faint">
                      {typeIcon[order.type] || <CreditCardIcon size={16} />}
                    </span>
                    <span className="h4 text-espresso">{typeLabel(order.type)}</span>
                  </div>
                  {statusBadge(order.status)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="caption">المبلغ</p>
                    <p className="font-mono font-medium">
                      {order.type === 'recharge'
                        ? `${order.amount}`
                        : `$${order.usdtAmount?.toFixed(2) || order.amount}`}
                    </p>
                  </div>
                  <div>
                    <p className="caption">التاريخ</p>
                    <p className="font-mono text-xs">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="caption">الهاتف</p>
                    <p className="font-mono text-xs">{order.phone}</p>
                  </div>
                  <div>
                    <p className="caption">المعرف</p>
                    <p className="font-mono text-xs text-espresso-muted">{order.id.slice(-6)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
