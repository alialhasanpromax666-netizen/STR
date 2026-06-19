import { useState } from 'react'
import { useAdmin } from '../../store/AdminContext'
import { fmt } from '../../utils/format'
import { CRYPTOS, generateId } from '../../store/types'
import { useCryptoPrices } from '../../components/hallmarked/useCryptoPrices'
import Button from '../../components/ui/Button'
import { CopyIcon, XIcon } from '../../components/icons/Icons'
import {
  BtcIcon,
  EthIcon,
  UsdtIcon,
  UsdcIcon,
  BnbIcon,
  SolIcon,
  XrpIcon,
  AdaIcon,
  DogeIcon,
  TrxIcon,
} from '../../components/icons/Icons'

const iconMap: Record<string, typeof BtcIcon> = {
  bitcoin: BtcIcon,
  ethereum: EthIcon,
  usdt: UsdtIcon,
  usdc: UsdcIcon,
  bnb: BnbIcon,
  solana: SolIcon,
  ripple: XrpIcon,
  cardano: AdaIcon,
  dogecoin: DogeIcon,
  tron: TrxIcon,
}

export default function WalletsManager() {
  const { config, updateWallet, updateWalletLabel, updateWalletCharLimit, toggleWallet, addWallet, deleteWallet, saveConfig } = useAdmin()
  const { prices } = useCryptoPrices(config.buyRate || config.usdtRate)
  const [saved, setSaved] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newValue, setNewValue] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleSaveGlobal = () => {
    saveConfig()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAddWallet = () => {
    if (!newLabel.trim() || !newValue.trim()) return
    addWallet({
      id: generateId('wal-'),
      label: newLabel.trim(),
      value: newValue.trim(),
      enabled: true,
      createdAt: new Date().toISOString(),
    })
    setNewLabel('')
    setNewValue('')
    setShowAdd(false)
  }

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val).catch(() => {})
  }

  const handleDelete = (id: string) => {
    const used = config.orders.some((o) => o.paymentMethod === id)
    if (used) {
      alert('لا يمكن حذف محفظة مستخدمة في طلبات موجودة')
      setDeleteConfirm(null)
      return
    }
    deleteWallet(id)
    setDeleteConfirm(null)
  }

  const servicesUsingWallet = (walletId: string) => {
    return config.services.filter((s) => s.allowedWallets.includes(walletId))
  }

  const cryptoWallets = config.wallets.filter((w) => w.id.startsWith('crypto-'))
  const paymentWallets = config.wallets.filter((w) => !w.id.startsWith('crypto-'))

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="h3 md:h2 text-espresso">إدارة عناوين الدفع</h2>
        <div className="flex items-center gap-2">
          <Button variant="gold" onClick={handleSaveGlobal}>
            {saved ? 'تم الحفظ ✓' : 'حفظ التغييرات'}
          </Button>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-outline-gold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            إضافة محفظة
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="luxury-card p-4 mb-4 animate-fade-up">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="اسم المحفظة..."
              className="input-luxury flex-1 text-sm"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="العنوان / الرقم..."
              className="input-luxury flex-[2] text-sm font-mono"
            />
            <div className="flex gap-2">
              <button onClick={handleAddWallet} className="btn-gold text-sm px-4 py-2" disabled={!newLabel.trim() || !newValue.trim()}>
                إضافة
              </button>
              <button onClick={() => { setShowAdd(false); setNewLabel(''); setNewValue('') }} className="p-2 text-espresso-muted hover:text-espresso">
                <XIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {cryptoWallets.length > 0 && (
        <div className="mb-8">
          <h3 className="h3 text-espresso mb-3">محافظ العملات الرقمية</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cryptoWallets.map((wallet) => {
              const crypto = CRYPTOS.find((c) => `crypto-${c.id}` === wallet.id)
              const price = crypto ? prices.find((p) => p.id === crypto.id) : null
              const Icon = crypto ? iconMap[crypto.id] || BtcIcon : BtcIcon
              return (
                <div key={wallet.id} className="luxury-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon size={28} className="text-gold shrink-0" weight="fill" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-heading font-medium text-espresso">{wallet.label}</div>
                      {crypto && price && (
                        <div className="text-[10px] text-espresso-muted">{fmt(price.priceSYP)} ل.س</div>
                      )}
                    </div>
                    <button
                      onClick={() => setDeleteConfirm(wallet.id)}
                      className="p-1 rounded-md text-espresso-faint hover:text-red hover:bg-error-faint transition-colors shrink-0"
                      title="حذف المحفظة"
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={wallet.value}
                        onChange={(e) => updateWallet(wallet.id, e.target.value)}
                        className="input-luxury font-mono text-sm"
                        placeholder="عنوان المحفظة..."
                      />
                    </div>
                    <button
                      onClick={() => handleCopy(wallet.value)}
                      className="px-3 py-2 rounded-lg border border-border text-espresso-muted hover:text-espresso hover:border-gold transition-colors shrink-0"
                      title="نسخ"
                    >
                      <CopyIcon size={18} />
                    </button>
                  </div>
                  <div className="mt-2">
                    <label className="caption block mb-1 font-medium">عدد الأحرف</label>
                    <input
                      type="number"
                      value={wallet.charLimit ?? ''}
                      onChange={(e) => updateWalletCharLimit(wallet.id, parseInt(e.target.value, 10) || 0)}
                      className="input-luxury text-sm text-center w-24"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <h3 className="h3 text-espresso mb-3">محافظ الدفع</h3>
      <div className="space-y-4">
        {paymentWallets.map((wallet) => {
          const usingServices = servicesUsingWallet(wallet.id)

          return (
            <div key={wallet.id} className={`luxury-card p-4 md:p-5 ${!wallet.enabled ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      onClick={() => toggleWallet(wallet.id)}
                      className="toggle"
                      data-on={wallet.enabled ? 'true' : 'false'}
                      aria-label={wallet.enabled ? 'إيقاف المحفظة' : 'تفعيل المحفظة'}
                    />
                  </label>
                  <span className="text-sm font-heading font-medium text-espresso">{wallet.label}</span>
                  {!wallet.enabled && (
                    <span className="text-[10px] md:text-xs text-espresso-faint bg-ivory-dark px-2 py-0.5 rounded">متوقفة</span>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(wallet.id)}
                    className="p-1 rounded-md text-espresso-faint hover:text-red hover:bg-error-faint transition-colors"
                    title="حذف المحفظة"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="caption block mb-1 font-medium">اسم المحفظة</label>
                  <input
                    type="text"
                    value={wallet.label}
                    onChange={(e) => updateWalletLabel(wallet.id, e.target.value)}
                    className="input-luxury text-sm"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="caption block mb-1 font-medium">العنوان / الرقم</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={wallet.value}
                      onChange={(e) => updateWallet(wallet.id, e.target.value)}
                      className="input-luxury font-mono text-sm"
                      placeholder="أدخل عنوان المحفظة..."
                    />
                    {wallet.value && (
                      <button
                        onClick={() => handleCopy(wallet.value)}
                        className="px-3 py-2 rounded-lg border border-border text-espresso-muted hover:text-espresso hover:border-gold transition-colors shrink-0"
                        title="نسخ"
                      >
                        <CopyIcon size={18} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-24">
                  <label className="caption block mb-1 font-medium">عدد الأحرف</label>
                  <input
                    type="number"
                    value={wallet.charLimit ?? ''}
                    onChange={(e) => updateWalletCharLimit(wallet.id, parseInt(e.target.value, 10) || 0)}
                    className="input-luxury text-sm text-center"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              {usingServices.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] md:text-xs text-espresso-faint font-heading">مستخدمة في الخدمات: </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {usingServices.map((s) => (
                      <span key={s.id} className="inline-block px-2 py-0.5 rounded bg-ivory-dark text-[10px] md:text-xs text-espresso-muted font-heading">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="luxury-card p-5 md:p-6 w-full max-w-sm mx-auto animate-fade-up">
            <h3 className="h3 text-espresso mb-2">حذف المحفظة</h3>
            <p className="body-secondary mb-5">سيتم إزالة المحفظة من جميع الخدمات المرتبطة بها. هل أنت متأكد؟</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-heading font-semibold bg-red text-white hover:bg-red/90 transition-colors">حذف</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-heading font-medium bg-ivory-dark text-espresso-muted hover:text-espresso transition-colors">رجوع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
