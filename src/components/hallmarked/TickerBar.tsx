import { useTranslation } from 'react-i18next'
import { useAdmin } from '../../store/AdminContext'

export default function TickerBar() {
  const { t, i18n } = useTranslation()
  const { config } = useAdmin()
  const isRtl = i18n.language === 'ar'
  const rate = config.usdtRate
  const feePercent = config.feePercent

  const items = [
    { label: t('crypto.usdt'), value: `1 USD = ${rate.toLocaleString()} ${t('crypto.syp')}${feePercent > 0 ? ` (رسوم ${feePercent}%)` : ''}` },
    { label: t('crypto.usdt'), value: `1 USD = $1.00` },
    { label: t('home.trust.instant'), value: '✓' },
    { label: t('home.trust.secure'), value: '✓' },
  ]

  const tickerContent = items.map((item, i) => (
    <span key={i}>
      <span className="label">{item.label}</span>
      {' '}
      <span className="value">{item.value}</span>
    </span>
  ))

  return (
    <div className="ticker-bar animate-slide-down">
      <div className="flex" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className="flex" style={{ animation: 'marquee 30s linear infinite' }}>
          {tickerContent}
          {tickerContent}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
