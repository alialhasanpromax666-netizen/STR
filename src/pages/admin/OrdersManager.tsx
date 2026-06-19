import { useState, useMemo } from 'react'
import { useAdmin } from '../../store/AdminContext'
import { CRYPTOS } from '../../store/types'
import type { OrderStatus } from '../../store/types'
import { SearchIcon, XIcon } from '../../components/icons/Icons'

const statusFilters: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'معلّق' },
  { key: 'processing', label: 'قيد التنفيذ' },
  { key: 'completed', label: 'مكتمل' },
  { key: 'cancelled', label: 'ملغي' },
]

const typeLabels: Record<string, string> = {
  'recharge': 'شحن رصيد',
  'buy-usdt': 'شراء USD',
  'buy-crypto': 'شراء عملات',
  'sell-crypto': 'بيع عملات',
  'buy-product': 'شراء منتج',
}

const cryptoNameMap: Record<string, string> = {}
for (const c of CRYPTOS) {
  cryptoNameMap[c.id] = `${c.nameAr} (${c.symbol})`
}

const operatorLabels: Record<string, string> = {
  'mtn': 'MTN',
  'syriatel': 'Syriatel',
  'mtn-cash': 'MTN كاش',
  'syriatel-cash': 'سريتل كاش',
}

const statusBadge: Record<string, string> = {
  'pending': 'bg-gold-faint text-gold',
  'processing': 'bg-blue-100 text-blue-700',
  'completed': 'bg-emerald-light text-emerald',
  'cancelled': 'bg-error-faint text-red',
}

const statusLabel: Record<string, string> = {
  'pending': 'معلّق',
  'processing': 'قيد التنفيذ',
  'completed': 'مكتمل',
  'cancelled': 'ملغي',
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ar-SA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrdersManager() {
  const { config, updateOrderStatus, deleteOrder, blockPhone } = useAdmin()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [previewImg, setPreviewImg] = useState<string | null>(null)

  const walletMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const w of config.wallets) {
      m[w.id] = w.label
    }
    return m
  }, [config.wallets])

  const filtered = useMemo(() => {
    let list = config.orders
    if (filter !== 'all') {
      list = list.filter((o) => o.status === filter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((o) => o.id.toLowerCase().includes(q) || o.phone.includes(q))
    }
    return list
  }, [config.orders, filter, search])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: config.orders.length }
    for (const s of ['pending', 'processing', 'completed', 'cancelled'] as OrderStatus[]) {
      c[s] = config.orders.filter((o) => o.status === s).length
    }
    return c
  }, [config.orders])

  const handleAction = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status)
    setConfirmId(null)
  }

  const handleDelete = (id: string) => {
    deleteOrder(id)
    setConfirmId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="h3 md:h2 text-espresso">إدارة الطلبات</h2>
        <span className="text-xs md:text-sm text-espresso-muted font-heading">
          إجمالي: <span className="font-bold text-espresso">{config.orders.length}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-3 md:mx-0 px-3 md:px-0">
        {statusFilters.map((f) => (
          <button type="button"
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-heading font-medium transition-colors duration-200 border shrink-0 ${
              filter === f.key
                ? 'bg-gold text-white border-gold'
                : 'bg-white text-espresso-muted border-border hover:border-gold'
            }`}
          >
            {f.label}
            {counts[f.key] > 0 && (
              <span className={`me-1 px-1.5 py-0.5 rounded text-xs ${
                filter === f.key ? 'bg-white/20 text-white' : 'bg-gold-subtle text-gold'
              }`}>
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative mb-4 md:mb-6">
        <SearchIcon size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-espresso-faint" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث برقم الطلب أو رقم الهاتف..."
          className="input-luxury ps-9 pe-9 text-sm"
        />
        {search && (
          <button type="button"
            onClick={() => setSearch('')}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-espresso-faint hover:text-espresso"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="luxury-card p-6 md:p-8 text-center">
          <p className="text-espresso-muted font-heading text-sm md:text-base">
            {config.orders.length === 0
              ? 'لا توجد طلبات حتى الآن'
              : 'لا توجد طلبات بهذه الحالة'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="luxury-card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-ivory-dark">
                    <th className="text-start px-4 py-3 text-xs font-heading font-semibold text-espresso-muted">الطلب</th>
                    <th className="text-start px-4 py-3 text-xs font-heading font-semibold text-espresso-muted">النوع</th>
                    <th className="text-start px-4 py-3 text-xs font-heading font-semibold text-espresso-muted">رقم الهاتف</th>
                    <th className="text-start px-4 py-3 text-xs font-heading font-semibold text-espresso-muted">المبلغ</th>
                    <th className="text-start px-4 py-3 text-xs font-heading font-semibold text-espresso-muted">USD</th>
                    <th className="text-start px-4 py-3 text-xs font-heading font-semibold text-espresso-muted">طريقة الدفع</th>
                    <th className="text-start px-4 py-3 text-xs font-heading font-semibold text-espresso-muted">الإثبات</th>
                    <th className="text-start px-4 py-3 text-xs font-heading font-semibold text-espresso-muted">الحالة</th>
                    <th className="text-start px-4 py-3 text-xs font-heading font-semibold text-espresso-muted">التاريخ</th>
                    <th className="text-start px-4 py-3 text-xs font-heading font-semibold text-espresso-muted">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-ivory transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-medium text-espresso">{order.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-heading text-espresso">
                          {typeLabels[order.type]}
                          {order.operator && (
                            <span className="text-xs text-espresso-faint block">
                              {order.type === 'buy-crypto' ? (cryptoNameMap[order.operator] || order.operator) : (operatorLabels[order.operator] || order.operator)}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-espresso-faint block mb-0.5">
                          {order.type === 'buy-crypto' || order.type === 'sell-crypto' ? 'عنوان العملة' : 'رقم الهاتف'}
                        </span>
                        <span className="text-sm font-mono text-espresso" dir="ltr">{order.phone}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-espresso">
                          {order.sypAmount > 0 ? `${order.sypAmount.toLocaleString()} ل.س` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono gold-text">
                          {order.usdtAmount > 0 ? `$${order.usdtAmount.toFixed(2)}` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.paymentMethod ? (
                          <span className="text-sm font-heading text-espresso">
                            {walletMap[order.paymentMethod] || order.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-xs text-espresso-faint">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {order.paymentProof ? (
                          <button type="button"
                            onClick={() => setPreviewImg(order.paymentProof!)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-heading font-medium bg-gold-subtle text-gold hover:bg-gold hover:text-white transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            عرض
                          </button>
                        ) : (
                          <span className="text-xs text-espresso-faint">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-medium ${statusBadge[order.status]}`}>
                          {statusLabel[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-espresso-faint font-heading whitespace-nowrap">{fmtDate(order.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {order.status === 'pending' && (
                            <>
                              <button type="button"
                                onClick={() => handleAction(order.id, 'processing')}
                                className="px-2.5 py-1 rounded text-xs font-heading font-medium bg-gold-subtle text-gold hover:bg-gold hover:text-white transition-colors"
                              >
                                تنفيذ
                              </button>
                              <button type="button"
                                onClick={() => setConfirmId(order.id)}
                                className="px-2.5 py-1 rounded text-xs font-heading font-medium bg-error-faint text-red hover:bg-red hover:text-white transition-colors"
                              >
                                إلغاء
                              </button>
                            </>
                          )}
                          {order.status === 'processing' && (
                            <>
                              <button type="button"
                                onClick={() => handleAction(order.id, 'completed')}
                                className="px-2.5 py-1 rounded text-xs font-heading font-medium bg-emerald-light text-emerald hover:bg-emerald hover:text-white transition-colors"
                              >
                                إكمال
                              </button>
                              <button type="button"
                                onClick={() => setConfirmId(order.id)}
                                className="px-2.5 py-1 rounded text-xs font-heading font-medium bg-error-faint text-red hover:bg-red hover:text-white transition-colors"
                              >
                                إلغاء
                              </button>
                            </>
                          )}
                          {order.status === 'completed' && (
                            <button type="button"
                              onClick={() => handleDelete(order.id)}
                              className="px-2.5 py-1 rounded text-xs font-heading font-medium text-espresso-faint hover:bg-error-faint hover:text-red transition-colors"
                            >
                              حذف
                            </button>
                          )}
                          {order.status === 'cancelled' && (
                            <button type="button"
                              onClick={() => handleDelete(order.id)}
                              className="px-2.5 py-1 rounded text-xs font-heading font-medium text-espresso-faint hover:bg-error-faint hover:text-red transition-colors"
                            >
                              حذف
                            </button>
                          )}
                          {order.type !== 'buy-crypto' && order.type !== 'sell-crypto' && !config.blockedPhones.includes(order.phone) && (
                            <button type="button"
                              onClick={() => blockPhone(order.phone)}
                              className="px-2.5 py-1 rounded text-xs font-heading font-medium text-espresso-faint hover:bg-error-faint hover:text-red transition-colors"
                              title="حظر هذا الرقم"
                            >
                              حظر
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((order) => (
              <div key={order.id} className="luxury-card p-4 animate-fade-up">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono font-medium text-espresso-faint">{order.id}</span>
                    <span className="text-sm font-heading text-espresso block mt-0.5">
                      {typeLabels[order.type]}
                      {order.operator && (
                        <span className="text-xs text-espresso-faint"> · {operatorLabels[order.operator] || order.operator}</span>
                      )}
                    </span>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded text-xs font-mono font-medium ${statusBadge[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <span className="text-espresso-faint block">{order.type === 'buy-crypto' || order.type === 'sell-crypto' ? 'عنوان العملة' : 'رقم الهاتف'}</span>
                    <span className="font-mono text-espresso" dir="ltr">{order.phone}</span>
                  </div>
                  <div>
                    <span className="text-espresso-faint block">المبلغ</span>
                    <span className="font-mono text-espresso">
                      {order.sypAmount > 0 ? `${order.sypAmount.toLocaleString()} ل.س` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-espresso-faint block">USD</span>
                    <span className="font-mono gold-text">
                      {order.usdtAmount > 0 ? `$${order.usdtAmount.toFixed(2)}` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-espresso-faint block">طريقة الدفع</span>
                    <span className="font-heading text-espresso">
                      {walletMap[order.paymentMethod ?? ''] || order.paymentMethod || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-espresso-faint block">التاريخ</span>
                    <span className="text-espresso-faint whitespace-nowrap text-[11px]">{fmtDate(order.createdAt)}</span>
                  </div>
                  <div>
                    {order.paymentProof ? (
                      <>
                        <span className="text-espresso-faint block">الإثبات</span>
                        <button type="button"
                          onClick={() => setPreviewImg(order.paymentProof!)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-heading font-medium bg-gold-subtle text-gold hover:bg-gold hover:text-white transition-colors"
                        >
                          عرض الصورة
                        </button>
                      </>
                    ) : (
                      <span className="text-espresso-faint">—</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  {order.status === 'pending' && (
                    <>
                      <button type="button" onClick={() => handleAction(order.id, 'processing')} className="flex-1 px-3 py-2 rounded-lg text-xs font-heading font-medium bg-gold text-white hover:bg-gold/90 transition-colors">تنفيذ</button>
                      <button type="button" onClick={() => setConfirmId(order.id)} className="flex-1 px-3 py-2 rounded-lg text-xs font-heading font-medium bg-error-faint text-red hover:bg-red hover:text-white transition-colors">إلغاء</button>
                    </>
                  )}
                  {order.status === 'processing' && (
                    <>
                      <button type="button" onClick={() => handleAction(order.id, 'completed')} className="flex-1 px-3 py-2 rounded-lg text-xs font-heading font-medium bg-emerald text-white hover:bg-emerald/90 transition-colors">إكمال</button>
                      <button type="button" onClick={() => setConfirmId(order.id)} className="flex-1 px-3 py-2 rounded-lg text-xs font-heading font-medium bg-error-faint text-red hover:bg-red hover:text-white transition-colors">إلغاء</button>
                    </>
                  )}
                  {(order.status === 'completed' || order.status === 'cancelled') && (
                    <button type="button" onClick={() => handleDelete(order.id)} className="flex-1 px-3 py-2 rounded-lg text-xs font-heading font-medium text-espresso-faint border border-border hover:bg-error-faint hover:text-red hover:border-red transition-colors">حذف</button>
                  )}
                  {order.type !== 'buy-crypto' && order.type !== 'sell-crypto' && !config.blockedPhones.includes(order.phone) && (
                    <button type="button" onClick={() => blockPhone(order.phone)} className="px-3 py-2 rounded-lg text-xs font-heading font-medium text-espresso-faint border border-border hover:bg-error-faint hover:text-red hover:border-red transition-colors">حظر</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="luxury-card p-5 md:p-6 w-full max-w-sm mx-auto animate-fade-up max-h-[90vh] overflow-y-auto">
            <h3 className="h3 text-espresso mb-2">تأكيد الإلغاء</h3>
            <p className="body-secondary mb-5">هل أنت متأكد من إلغاء هذا الطلب؟</p>
            <div className="flex gap-3">
              <button type="button"
                onClick={() => handleAction(confirmId, 'cancelled')}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-heading font-semibold bg-red text-white hover:bg-red/90 transition-colors"
              >
                تأكيد الإلغاء
              </button>
              <button type="button"
                onClick={() => setConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-heading font-medium bg-ivory-dark text-espresso-muted hover:text-espresso transition-colors"
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewImg(null)}
        >
          <div className="relative max-w-lg w-full animate-fade-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button type="button"
              onClick={() => setPreviewImg(null)}
              className="absolute -top-3 -end-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-espresso-muted hover:text-espresso transition-colors z-10"
            >
              <XIcon size={16} />
            </button>
            <img src={previewImg} alt="صورة الإثبات" className="w-full rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  )
}
