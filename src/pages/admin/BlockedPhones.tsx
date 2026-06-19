import { useMemo } from 'react'
import { useAdmin } from '../../store/AdminContext'
import { XIcon } from '../../components/icons/Icons'

export default function BlockedPhones() {
  const { config, unblockPhone } = useAdmin()

  const ordersFromBlocked = useMemo(() => {
    return config.orders
      .filter((o) => config.blockedPhones.includes(o.phone))
      .reduce((acc, o) => {
        if (!acc.find((a) => a.phone === o.phone)) {
          acc.push({ phone: o.phone, orders: 1 })
        } else {
          const found = acc.find((a) => a.phone === o.phone)
          if (found) found.orders++
        }
        return acc
      }, [] as { phone: string; orders: number }[])
  }, [config.orders, config.blockedPhones])

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="h3 md:h2 text-espresso">الأرقام المحظورة</h2>
        <span className="text-xs md:text-sm text-espresso-muted font-heading">
          محظور: <span className="font-bold text-espresso">{config.blockedPhones.length}</span>
        </span>
      </div>

      {config.blockedPhones.length === 0 ? (
        <div className="luxury-card p-6 md:p-8 text-center">
          <p className="text-espresso-muted font-heading text-sm md:text-base">لا توجد أرقام محظورة</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="luxury-card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-ivory-dark">
                    <th className="text-start px-5 py-3 text-xs font-heading font-semibold text-espresso-muted">رقم الهاتف</th>
                    <th className="text-start px-5 py-3 text-xs font-heading font-semibold text-espresso-muted">عدد الطلبات السابقة</th>
                    <th className="text-start px-5 py-3 text-xs font-heading font-semibold text-espresso-muted">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {config.blockedPhones.map((phone) => {
                    const info = ordersFromBlocked.find((a) => a.phone === phone)
                    return (
                      <tr key={phone} className="border-b border-border last:border-0 hover:bg-ivory transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-sm font-mono font-medium text-espresso" dir="ltr">{phone}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-espresso-muted">{info ? info.orders : 0}</span>
                        </td>
                        <td className="px-5 py-4">
                          <button type="button"
                            onClick={() => unblockPhone(phone)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-heading font-medium bg-emerald-light text-emerald hover:bg-emerald hover:text-white transition-colors"
                          >
                            <XIcon size={14} />
                            فك الحظر
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {config.blockedPhones.map((phone) => {
              const info = ordersFromBlocked.find((a) => a.phone === phone)
              return (
                <div key={phone} className="luxury-card p-4 flex items-center justify-between animate-fade-up">
                  <div>
                    <span className="text-sm font-mono font-medium text-espresso" dir="ltr">{phone}</span>
                    <span className="text-xs text-espresso-faint block mt-0.5">الطلبات السابقة: {info ? info.orders : 0}</span>
                  </div>
                  <button type="button"
                    onClick={() => unblockPhone(phone)}
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-heading font-medium bg-emerald-light text-emerald hover:bg-emerald hover:text-white transition-colors"
                  >
                    <XIcon size={14} />
                    فك الحظر
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
