import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAdmin } from '../store/AdminContext'
import { useAuth } from '../store/AuthContext'
import { fmt } from '../utils/format'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { XIcon, CopyIcon } from '../components/icons/Icons'

export default function ServicePage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { config, createOrder } = useAdmin()
  const { deviceId } = useAuth()
  const [amount, setAmount] = useState('100')
  const [usdtAddress, setUsdtAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentProof, setPaymentProof] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const service = config.services.find((s) => s.id === id)

  const rate = config.buyRate || config.usdtRate || 0
  const feePercent = config.feePercent
  const feeMultiplier = 1 - feePercent / 100
  const numAmount = Math.max(0, parseFloat(amount) || 0)
  const youPayValue = numAmount
  const grossReceive = rate > 0 ? numAmount / rate : 0
  const youReceiveValue = grossReceive * feeMultiplier
  const feeAmount = grossReceive - youReceiveValue
  const youPayFormatted = fmt(youPayValue) + ' ل.س'
  const grossFormatted = grossReceive.toFixed(2) + ' USD'
  const youReceiveFormatted = youReceiveValue.toFixed(2) + ' USD'
  const feeFormatted = feeAmount.toFixed(2) + ' USD'
  const sypAmount = numAmount
  const usdtAmount = youReceiveValue

  const minAmount = rate
  const belowMin = numAmount > 0 && numAmount < minAmount

  const selectedWallet = config.wallets.find((w) => w.id === paymentMethod)

  function getWalValue(walletId: string): string | undefined {
    if (walletId === 'sham-cash-usd' || walletId === 'sham-cash-syp') {
      return config.wallets.find((w) => w.id === 'sham-cash')?.value
    }
    return config.wallets.find((w) => w.id === walletId)?.value
  }

  function getWalLabel(walletId: string): string | undefined {
    return config.wallets.find((w) => w.id === walletId)?.label
  }

  const walletAddressValue = getWalValue(paymentMethod)

  const visibleWallets = config.wallets.filter((w) => {
    if (!w.enabled) return false
    if (!service) return false
    return service.allowedWallets.includes(w.id)
  })

  useEffect(() => {
    if (paymentMethod && !visibleWallets.some((w) => w.id === paymentMethod)) {
      setPaymentMethod('')
    }
  }, [paymentMethod, visibleWallets])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('حجم الصورة كبير جداً. الحد الأقصى 2 ميغابايت.'); return }
    const reader = new FileReader()
    reader.onload = () => setPaymentProof(reader.result?.toString() ?? '')
    reader.readAsDataURL(file)
  }

  const canProceed = !!usdtAddress && !!numAmount && !!paymentMethod && !!paymentProof && !belowMin

  const handleProceed = () => {
    if (!canProceed) return
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    if (submitting) return
    setSubmitting(true)
    createOrder({
      type: 'buy-usdt',
      phone: usdtAddress,
      operator: service?.id,
      amount: numAmount,
      usdtAmount,
      sypAmount,
      paymentMethod,
      paymentProof,
      walletAddress: walletAddressValue,
      userId: deviceId,
    })
    setShowConfirm(false)
    setSubmitting(false)
    setUsdtAddress('')
    setPaymentProof('')
    setPaymentMethod('')
    setAmount('100')
    setShowToast(true)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
  }

  if (!service) {
    return (
      <div className="section text-center">
        <h1 className="h1 text-espresso mb-4">الخدمة غير موجودة</h1>
        <p className="body-secondary mb-6">الخدمة التي تبحث عنها غير متوفرة</p>
        <Link to="/">
          <Button variant="gold">{t('notFound.home')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="h1 text-espresso">{service.name}</h1>
        </div>

        {service.maintenance && (
          <div className="text-center mb-6 animate-fade-up stagger-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-heading font-medium bg-error-faint text-error">
              {t('form.maintenance')}
            </span>
          </div>
        )}

        <div className="animate-fade-up stagger-3">
          <div className="luxury-card p-5">
            <h3 className="h3 text-espresso mb-4">
              {t('crypto.buy')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="caption block mb-1.5 font-medium">
                  {t('crypto.amount')} (ل.س)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-luxury font-mono text-lg"
                  placeholder={`الحد الأدنى: ${minAmount}`}
                  min={minAmount}
                />
                {belowMin && (
                  <p className="text-xs text-red mt-1.5">
                    الحد الأدنى للشراء هو {fmt(minAmount)} ل.س
                  </p>
                )}
              </div>

              <div className="divider-gold" />

              <div className="flex justify-between items-center">
                <span className="caption">{t('crypto.rate')}</span>
                <span className="price-badge">1 USD = {fmt(rate)} ل.س</span>
              </div>
              {feePercent > 0 && (
                <div className="flex justify-between items-center">
                  <span className="caption">رسوم</span>
                  <span className="text-xs text-espresso-muted">{feePercent}%</span>
                </div>
              )}

              <div className="bg-gold-subtle rounded-lg p-4">
                {feePercent > 0 && numAmount > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="caption">{t('crypto.youPay')}</span>
                      <span className="h4 text-espresso">{youPayFormatted}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="caption">المبلغ قبل الخصم</span>
                      <span className="text-sm font-mono text-espresso">{grossFormatted}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="caption text-red">رسوم ({feePercent}%)</span>
                      <span className="text-sm font-mono text-red">-{feeFormatted}</span>
                    </div>
                    <div className="border-t border-gold/30 pt-2 flex justify-between items-center">
                      <span className="caption font-heading font-semibold">{t('crypto.youReceive')}</span>
                      <span className="h3 gold-text mono">{youReceiveFormatted}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="caption">{t('crypto.youPay')}</span>
                      <span className="h4 text-espresso">{youPayFormatted}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="caption">{t('crypto.youReceive')}</span>
                      <span className="h3 gold-text mono">{youReceiveFormatted}</span>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="caption block mb-1.5 font-medium">طريقة الدفع</label>
                {visibleWallets.length === 0 ? (
                  <p className="text-xs text-espresso-faint bg-ivory-dark rounded-lg p-3">لا توجد طرق دفع متاحة لهذه الخدمة</p>
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

              {selectedWallet && selectedWallet.value && (
                <div className="bg-ivory-dark rounded-lg p-3 border border-gold-light">
                  <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                    أرسل المبلغ إلى: {selectedWallet.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-espresso break-all flex-1">{selectedWallet.value}</span>
                    <button onClick={() => copyToClipboard(selectedWallet.value)} className="shrink-0 p-1 rounded-md text-espresso-faint hover:text-gold hover:bg-gold-subtle transition-colors" title="نسخ">
                      <CopyIcon size={16} />
                    </button>
                  </div>
                  {selectedWallet.charLimit && (
                    <span className="text-[10px] text-espresso-faint block mt-1">{selectedWallet.value.length}/{selectedWallet.charLimit} حرف</span>
                  )}
                </div>
              )}

              <div className="divider-gold" />

              <div>
                <label className="caption block mb-1.5 font-medium">عنوان محفظة USDT للاستلام</label>
                <input
                  type="text"
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  className="input-luxury font-mono text-sm"
                  placeholder="أدخل عنوان محفظة USDT الخاصة بك..."
                />
              </div>

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
                disabled={!canProceed}
                onClick={handleProceed}
              >
                {t('form.submit')}
              </Button>
            </div>
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

              <div className="bg-gold-subtle rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-espresso-muted">{t('crypto.youPay')}</span>
                  <span className="font-mono font-medium text-espresso">{youPayFormatted}</span>
                </div>
                {feePercent > 0 && numAmount > 0 && (
                  <>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-espresso-muted">المبلغ قبل الخصم</span>
                      <span className="font-mono font-medium text-espresso">{grossFormatted}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-espresso-muted text-red">رسوم ({feePercent}%)</span>
                      <span className="font-mono font-medium text-red">-{feeFormatted}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-espresso-muted">{t('crypto.youReceive')}</span>
                  <span className="font-mono font-medium gold-text">{youReceiveFormatted}</span>
                </div>
              </div>

              {selectedWallet && walletAddressValue && (
                <div className="bg-ivory-dark rounded-lg p-3 mb-4 border border-gold-light">
                  <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                    أرسل المبلغ إلى: {getWalLabel(paymentMethod) || selectedWallet.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-espresso break-all flex-1">{walletAddressValue}</span>
                    <button onClick={() => copyToClipboard(walletAddressValue)} className="shrink-0 p-1 rounded-md text-espresso-faint hover:text-gold hover:bg-gold-subtle transition-colors" title="نسخ">
                      <CopyIcon size={16} />
                    </button>
                  </div>
                </div>
              )}

              {usdtAddress && (
                <div className="bg-ivory-dark rounded-lg p-3 mb-4 border border-gold-light">
                  <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">ستستلم USDT على</span>
                  <span className="text-sm font-mono text-espresso break-all">{usdtAddress}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="gold" className="flex-1" disabled={submitting} onClick={handleConfirm}>
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
          message="تم تقديم الطلب بنجاح"
          visible={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  )
}
