interface PriceCardProps {
  label: string
  usdtPrice: string
  sypPrice: string
  trend?: 'up' | 'down'
  trendValue?: string
  className?: string
  usdtLabel?: string
  sypLabel?: string
}

export default function PriceCard({ label, usdtPrice, sypPrice, trend, trendValue, className = '', usdtLabel = 'USDT', sypLabel = 'ل.س' }: PriceCardProps) {
  return (
    <div className={`luxury-card p-5 ${className}`}>
      <p className="caption mb-1">{label}</p>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="h3 gold-text mono">${usdtPrice}</span>
          <span className="caption me-1"> {usdtLabel}</span>
        </div>
        <div className="text-end">
          <span className="h4 text-espresso">{sypPrice}</span>
          <span className="caption me-1"> {sypLabel}</span>
        </div>
      </div>
      {trend && (
        <div className={`mt-2 flex items-center gap-1 ${trend === 'up' ? 'text-emerald' : 'text-espresso-muted'}`}>
          {trend === 'up' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" /><path d="M19 12l-7 7-7-7" />
            </svg>
          )}
          {trendValue && <span className="text-xs mono">{trendValue}</span>}
        </div>
      )}
    </div>
  )
}
