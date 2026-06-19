import { useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdmin } from '../store/AdminContext'
import { useAuth } from '../store/AuthContext'
import NotesBanner from '../components/admin/NotesBanner'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { PhoneIcon, SignalIcon, WalletIcon, XIcon, CopyIcon } from '../components/icons/Icons'

const isShamCash = (id: string) => id === 'sham-cash-usd' || id === 'sham-cash-syp'

const sypAmounts = [50, 100, 200, 500, 1000, 2000]
const usdAmounts = [5, 10, 25, 50, 100, 200]

const operatorIcons: Record<string, typeof SignalIcon> = {
  mtn: SignalIcon,
  syriatel: PhoneIcon,
  'mtn-cash': WalletIcon,
  'syriatel-cash': WalletIcon,
  'sham-cash-usd': WalletIcon,
  'sham-cash-syp': WalletIcon,
}

export default function Recharge() {
  const { t } = useTranslation()
  const { config, createOrder, isPhoneBlocked } = useAdmin()
  const { deviceId } = useAuth()
  const [operator, setOperator] = useState('')
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentProof, setPaymentProof] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [blockedError, setBlockedError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isUsdMode = operator === 'sham-cash-usd'
  const rate = config.buyRate || config.usdtRate || 0

  const rechargeServices = useMemo(() =>
    config.services.filter((s) => s.active && !s.maintenance && ['mtn', 'syriatel', 'mtn-cash', 'syriatel-cash', 'sham-cash-usd', 'sham-cash-syp'].includes(s.id)),
    [config.services]
  )

  const currentService = useMemo(() =>
    config.services.find((s) => s.id === operator),
    [config.services, operator]
  )

  const feePercent = currentService?.feePercent ?? config.feePercent
  const feeMultiplier = 1 + feePercent / 100
  const amounts = isUsdMode ? usdAmounts : sypAmounts
  const actualAmount = Math.max(0, isCustom && customAmount ? parseFloat(customAmount) || 0 : (amount || 0))
  const usdtPrice = rate > 0 && actualAmount
    ? isUsdMode ? actualAmount * feeMultiplier : (actualAmount / rate) * feeMultiplier
    : 0

  const visibleWallets = useMemo(() => {
    if (!currentService) return []
    return config.wallets.filter((w) =>
      w.enabled && currentService.allowedWallets.includes(w.id)
    )
  }, [config.wallets, currentService])

  const selectedWallet = config.wallets.find((w) => w.id === paymentMethod)

  function getWalletAddress(walletId: string): string | undefined {
    if (walletId === 'sham-cash-usd' || walletId === 'sham-cash-syp') {
      return config.wallets.find((w) => w.id === 'sham-cash')?.value
    }
    return config.wallets.find((w) => w.id === walletId)?.value
  }

  function getWalletLabel(walletId: string): string | undefined {
    return config.wallets.find((w) => w.id === walletId)?.label
  }

  const walletAddress = getWalletAddress(paymentMethod)

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text) } catch {}
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('حجم الصورة كبير جداً. الحد الأقصى 2 ميغابايت.'); return }
    const reader = new FileReader()
    reader.onload = () => setPaymentProof(reader.result?.toString() ?? '')
    reader.readAsDataURL(file)
  }

  const handleProceed = () => {
    if (!phone || !actualAmount || !paymentMethod || !paymentProof) return
    if (!isShamCash(operator) && isPhoneBlocked(phone)) {
      setBlockedError(true)
      return
    }
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    if (submitting) return
    if (!paymentProof || actualAmount === null) return
    if (!isShamCash(operator) && isPhoneBlocked(phone)) { setBlockedError(true); setShowConfirm(false); return }
    setSubmitting(true)
    createOrder({
      type: 'recharge',
      phone,
      operator,
      amount: actualAmount,
      usdtAmount: usdtPrice,
      sypAmount: isUsdMode ? actualAmount * rate : actualAmount,
      paymentMethod,
      paymentProof,
      walletAddress,
      userId: deviceId,
    })
    setShowConfirm(false)
    setSubmitting(false)
    setOperator('')
    setAmount(null)
    setIsCustom(false)
    setCustomAmount('')
    setPhone('')
    setPaymentMethod('')
    setPaymentProof('')
    setShowToast(true)
  }

  return (
    <div className="section">
      <div className="max-w-xl mx-auto">
        <NotesBanner section="recharge" />
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="h1 text-espresso">{t('recharge.title')}</h1>
          <p className="body-secondary mt-2">{t('recharge.desc')}</p>
        </div>

        <div className="luxury-card p-6 animate-fade-up stagger-1">
          <div className="mb-6">
            <label className="caption block mb-2 font-medium">{t('recharge.operator')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rechargeServices.map((svc) => {
                const Icon = operatorIcons[svc.id] || SignalIcon
                return (
                  <button
                    key={svc.id}
                    onClick={() => {
                      setOperator(svc.id)
                      setPaymentMethod('')
                    }}
                    className={`py-3 px-4 rounded-lg text-sm font-heading font-semibold transition-all duration-200 border ${
                      operator === svc.id
                        ? 'bg-gold text-white border-gold'
                        : 'bg-white text-espresso-muted border-border hover:border-gold'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon size={16} />
                      {svc.name}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="caption block mb-2 font-medium">{t('recharge.amount')}</label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {amounts.map((a) => (
                <button
                  key={a}
                  onClick={() => { setAmount(a); setIsCustom(false); setCustomAmount('') }}
                  className={`py-2.5 px-3 rounded-lg text-sm font-heading font-semibold transition-all duration-200 border ${
                    amount === a && !isCustom
                      ? 'bg-gold text-white border-gold'
                      : 'bg-white text-espresso-muted border-border hover:border-gold'
                  }`}
                >
                  {isUsdMode ? `$${a}` : a.toLocaleString()}
                </button>
              ))}
              <button
                onClick={() => { setAmount(null); setIsCustom(true); setCustomAmount('') }}
                className={`py-2.5 px-3 rounded-lg text-sm font-heading font-semibold transition-all duration-200 border ${
                  isCustom
                    ? 'bg-gold text-white border-gold'
                    : 'bg-white text-espresso-muted border-border hover:border-gold'
                }`}
              >
                أخرى
              </button>
            </div>
            {isCustom && (
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="input-luxury font-mono text-lg mt-2"
                placeholder={isUsdMode ? 'أدخل المبلغ بالدولار...' : 'أدخل المبلغ...'}
                autoFocus
              />
            )}
          </div>

          <div className="mb-6">
            <label className="caption block mb-2 font-medium">
              {isShamCash(operator) ? 'عنوان شام كاش' : t('recharge.phone')}
            </label>
            <input
              type={isShamCash(operator) ? 'text' : 'tel'}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setBlockedError(false)
              }}
              placeholder={isShamCash(operator) ? 'أدخل عنوان شام كاش...' : '09XX XXX XXX'}
              className="input-luxury font-mono text-sm"
            />
            {blockedError && (
              <p className="text-xs text-red mt-1.5">{t('form.phoneBlocked')}</p>
            )}
          </div>

          {actualAmount && (
            <div className="bg-gold-subtle rounded-lg p-4 mb-6 animate-fade-up space-y-1">
              <div className="flex justify-between items-center">
                <span className="caption">تدفع</span>
                <span className="h4 gold-text mono">${usdtPrice.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="caption">{isUsdMode ? 'مايعادل بدولار' : 'مايعادل باليرة'}</span>
                <span className="h4 text-espresso">{isUsdMode ? `$${actualAmount.toFixed(2)}` : `${actualAmount.toLocaleString()} ل.س`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="caption">ما يعادل</span>
                <span className="body text-espresso-muted">{isUsdMode ? `${(actualAmount * rate).toLocaleString()} ل.س` : `$${(actualAmount / rate).toFixed(2)}`}</span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="caption block mb-2 font-medium">{t('form.paymentMethod')}</label>
            {visibleWallets.length === 0 ? (
              <p className="text-xs text-espresso-faint">اختر الخدمة أولاً</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {visibleWallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setPaymentMethod(w.id)}
                    className={`py-2.5 px-3 rounded-lg text-sm font-heading font-medium transition-all duration-200 border ${
                      paymentMethod === w.id
                        ? 'bg-gold text-white border-gold'
                        : 'bg-white text-espresso-muted border-border hover:border-gold'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedWallet && (
            <div className="bg-ivory-dark rounded-lg p-3 mb-6 border border-gold-light">
              {walletAddress && (
                <p className="text-xs text-espresso font-medium mb-2">أرسل {usdtPrice.toFixed(2)} USDT ({(usdtPrice * rate).toLocaleString()} ل.س) إلى هذا العنوان</p>
              )}
              <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                {getWalletLabel(paymentMethod) || selectedWallet.label}
              </span>
              {walletAddress ? (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-mono text-espresso break-all flex-1 min-w-0">{walletAddress}</span>
                  <button onClick={() => copyToClipboard(walletAddress)} className="shrink-0 p-1 rounded-md text-espresso-faint hover:text-gold hover:bg-gold-subtle transition-colors" title="نسخ">
                    <CopyIcon size={16} />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-espresso-faint italic">لم يتم تعيين عنوان بعد</span>
              )}
              {(config.wallets.find((w) => w.id === (paymentMethod === 'sham-cash-usd' || paymentMethod === 'sham-cash-syp' ? 'sham-cash' : paymentMethod))?.charLimit) && (
                <span className="text-[10px] text-espresso-faint block mt-1">
                  {(config.wallets.find((w) => w.id === (paymentMethod === 'sham-cash-usd' || paymentMethod === 'sham-cash-syp' ? 'sham-cash' : paymentMethod))?.value || walletAddress || '').length}
                  /{(config.wallets.find((w) => w.id === (paymentMethod === 'sham-cash-usd' || paymentMethod === 'sham-cash-syp' ? 'sham-cash' : paymentMethod))?.charLimit)} حرف
                </span>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="caption block mb-1.5 font-medium">{t('form.paymentProof')}</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className={`w-full py-3 px-4 rounded-lg text-sm font-heading font-medium border border-dashed transition-all ${
                paymentProof
                  ? 'bg-emerald-light text-emerald border-emerald'
                  : 'bg-white text-espresso-muted border-border hover:border-gold'
              }`}
            >
              {paymentProof ? t('form.imageSelected') : t('form.selectImage')}
            </button>
            {paymentProof && (
              <div className="mt-2 relative inline-block">
                <img src={paymentProof} alt={t('form.paymentProof')} className="h-20 w-20 object-cover rounded-lg border border-border" />
                <button onClick={() => setPaymentProof('')} className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-red text-white flex items-center justify-center text-xs">✕</button>
              </div>
            )}
          </div>

          <Button
            variant="gold"
            className="w-full"
            disabled={!phone || !actualAmount || !paymentMethod || !paymentProof}
            onClick={handleProceed}
          >
            {t('recharge.charge')}
          </Button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="luxury-card p-5 md:p-6 w-full max-w-md mx-auto animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="h3 text-espresso">{t('form.confirmOrder')}</h3>
              <button onClick={() => setShowConfirm(false)} className="text-espresso-muted hover:text-espresso">
                <XIcon size={20} />
              </button>
            </div>

            <div className="bg-gold-subtle rounded-lg p-3 mb-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-espresso-muted">{t('form.operator')}</span>
                <span className="font-heading font-medium text-espresso">{currentService?.name || operator}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-espresso-muted">تدفع</span>
                <span className="font-mono font-medium gold-text">${usdtPrice.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-espresso-muted">{isUsdMode ? 'مايعادل بدولار' : 'مايعادل باليرة'}</span>
                <span className="font-mono font-medium text-espresso">{isUsdMode ? `$${actualAmount?.toFixed(2)}` : `${actualAmount?.toLocaleString()} ل.س`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-espresso-muted">ما يعادل</span>
                <span className="font-mono font-medium text-espresso">{isUsdMode ? `${(actualAmount * rate).toLocaleString()} ل.س` : `$${(actualAmount / rate).toFixed(2)}`}</span>
              </div>
            </div>

            {selectedWallet && (
              <div className="bg-ivory-dark rounded-lg p-3 mb-4 border border-gold-light">
                {walletAddress && (
                <p className="text-xs text-espresso font-medium mb-2">أرسل {usdtPrice.toFixed(2)} USDT ({(usdtPrice * rate).toLocaleString()} ل.س) إلى هذا العنوان</p>
                )}
                <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                  {getWalletLabel(paymentMethod) || selectedWallet.label}
                </span>
                {walletAddress ? (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-mono text-espresso break-all flex-1 min-w-0">{walletAddress}</span>
                    <button onClick={() => copyToClipboard(walletAddress)} className="shrink-0 p-1 rounded-md text-espresso-faint hover:text-gold hover:bg-gold-subtle transition-colors" title="نسخ">
                      <CopyIcon size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-espresso-faint italic">لم يتم تعيين عنوان بعد</span>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="gold" className="flex-1" onClick={handleConfirm} disabled={submitting || !paymentProof}>
                {t('form.confirmAndSend')}
              </Button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-heading font-medium bg-ivory-dark text-espresso-muted hover:text-espresso transition-colors flex-1"
              >
                {t('form.back')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={t('form.rechargeOrderSubmitted')}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}
