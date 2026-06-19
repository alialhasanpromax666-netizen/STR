import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdmin } from '../store/AdminContext'
import { useAuth } from '../store/AuthContext'
import NotesBanner from '../components/admin/NotesBanner'
import { CRYPTOS, type CryptoAsset } from '../store/types'
import { useCryptoPrices } from '../components/hallmarked/useCryptoPrices'
import { fmt, fmtCrypto } from '../utils/format'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { XIcon, CopyIcon } from '../components/icons/Icons'
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
} from '../components/icons/Icons'

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

export default function Crypto() {
  const { t } = useTranslation()
  const { config, createOrder } = useAdmin()
  const { deviceId } = useAuth()
  const { prices, loading, lastUpdated } = useCryptoPrices(config.usdtRate)

  const [tab, setTab] = useState<'buy' | 'sell'>('buy')
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAsset | null>(null)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [receiveInfo, setReceiveInfo] = useState('')
  const [cryptoAddress, setCryptoAddress] = useState('')
  const [paymentProof, setPaymentProof] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const buyRate = config.buyRate || config.usdtRate || 0
  const sellRate = config.sellRate || config.usdtRate || 0
  const cryptoService = config.services.find((s) => s.id === 'crypto-buy')
  const feePercent = cryptoService?.feePercent ?? config.feePercent
  const feeMultiplier = 1 - feePercent / 100
  const numAmount = Math.max(0, parseFloat(amount) || 0)
  const currentPriceUSD = selectedCrypto ? prices.find((p) => p.id === selectedCrypto.id)?.priceUSD ?? 0 : 0

  const isBuy = tab === 'buy'
  const grossReceive = isBuy
    ? (currentPriceUSD > 0 ? numAmount / currentPriceUSD : 0)
    : (currentPriceUSD > 0 ? numAmount * currentPriceUSD : 0)
  const youReceiveValue = grossReceive * feeMultiplier
  const feeAmount = grossReceive - youReceiveValue
  const usdtAmount = isBuy ? numAmount : youReceiveValue

  const minAmount = isBuy ? 1 : 0.0001
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
    if (!cryptoService) return false
    return cryptoService.allowedWallets.includes(w.id)
  })

  useEffect(() => {
    if (paymentMethod && !visibleWallets.some((w) => w.id === paymentMethod)) {
      setPaymentMethod('')
    }
  }, [paymentMethod, visibleWallets])

  useEffect(() => {
    setAmount('')
    setPaymentMethod('')
    setReceiveInfo('')
    setCryptoAddress('')
    setPaymentProof('')
    setShowConfirm(false)
  }, [tab])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('حجم الصورة كبير جداً. الحد الأقصى 2 ميغابايت.'); return }
    const reader = new FileReader()
    reader.onload = () => setPaymentProof(reader.result?.toString() ?? '')
    reader.readAsDataURL(file)
  }

  const canProceed = selectedCrypto && !!cryptoAddress && !!numAmount && !!paymentMethod && !!paymentProof && !belowMin && (isBuy || !!receiveInfo)

  const handleProceed = () => {
    if (!canProceed) return
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    if (submitting) return
    if (!selectedCrypto) return
    setSubmitting(true)
    if (isBuy) {
      createOrder({
        type: 'buy-crypto',
        phone: cryptoAddress,
        operator: selectedCrypto.id,
        amount: numAmount,
        usdtAmount: numAmount,
        sypAmount: numAmount * buyRate,
        paymentMethod,
        paymentProof,
        walletAddress: walletAddressValue,
        userId: deviceId,
      })
    } else {
      createOrder({
        type: 'sell-crypto',
        phone: cryptoAddress,
        operator: selectedCrypto.id,
        amount: numAmount,
        usdtAmount: usdtAmount,
        sypAmount: usdtAmount * sellRate,
        paymentMethod,
        paymentProof,
        walletAddress: receiveInfo,
        note: `استلام: ${selectedWallet?.label || paymentMethod} - ${receiveInfo}`,
        userId: deviceId,
      })
    }
    setShowConfirm(false)
    setSubmitting(false)
    setAmount('')
    setPaymentProof('')
    setCryptoAddress('')
    setPaymentMethod('')
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

  const cryptoWalletId = selectedCrypto ? `crypto-${selectedCrypto.id}` : null
  const ourWallet = cryptoWalletId ? config.wallets.find((w) => w.id === cryptoWalletId) : null

  if (!selectedCrypto) {
    return (
      <div className="section">
        <div className="max-w-4xl mx-auto">
          <NotesBanner section="crypto" />
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="h1 text-espresso">{t('crypto.title')}</h1>
            <p className="body-secondary mt-2">{t('crypto.desc')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-fade-up stagger-1">
            {CRYPTOS.map((crypto, i) => {
              const price = prices.find((p) => p.id === crypto.id)
              const Icon = iconMap[crypto.id] || BtcIcon
              return (
                <button
                  key={crypto.id}
                  onClick={() => setSelectedCrypto(crypto)}
                  className="luxury-card p-4 text-center hover:border-gold transition-all duration-300 group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex justify-center mb-3">
                    <Icon size={36} className="text-gold group-hover:scale-110 transition-transform duration-300" weight="fill" />
                  </div>
                  <div className="h4 text-espresso text-sm mb-1">{crypto.symbol.toUpperCase()}</div>
                  <div className="text-[10px] text-espresso-muted mb-2">{crypto.name}</div>
                  {loading ? (
                    <div className="text-xs text-espresso-faint animate-pulse">...</div>
                  ) : (
                    <div className="text-sm font-mono font-bold gold-text">
                      {price ? `$${fmt(price.priceUSD)}` : '—'}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {lastUpdated && (
            <p className="text-center mt-6 text-[10px] text-espresso-faint">
              {t('crypto.priceUpdated', { seconds: Math.floor((Date.now() - lastUpdated.getTime()) / 1000) })}
            </p>
          )}
        </div>
      </div>
    )
  }

  const Icon = iconMap[selectedCrypto.id] || BtcIcon

  return (
    <div className="section">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 animate-fade-up">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Icon size={32} className="text-gold" weight="fill" />
            <h1 className="h1 text-espresso">
              {isBuy ? t('crypto.buy') : t('crypto.sell')} {selectedCrypto.symbol.toUpperCase()}
            </h1>
          </div>
          <button
            onClick={() => setSelectedCrypto(null)}
            className="text-xs text-espresso-muted hover:text-gold transition-colors underline"
          >
            ← {t('crypto.selectCrypto')}
          </button>
        </div>

        <div className="flex justify-center gap-2 mb-6 animate-fade-up stagger-1">
          <button
            onClick={() => setTab('buy')}
            className={`pill-luxury ${tab === 'buy' ? 'pill-luxury-active' : ''}`}
          >
            {t('crypto.buy')}
          </button>
          <button
            onClick={() => setTab('sell')}
            className={`pill-luxury ${tab === 'sell' ? 'pill-luxury-active' : ''}`}
          >
            {t('crypto.sell')}
          </button>
        </div>

        <div className="luxury-card p-5 animate-fade-up">
          <div className="space-y-4">
            <div>
              <label className="caption block mb-1.5 font-medium">
                {t('crypto.amount')} ({isBuy ? 'USD' : selectedCrypto.symbol.toUpperCase()})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-luxury font-mono text-lg"
                placeholder={isBuy ? `min $1` : `min ${minAmount}`}
                min={0}
                step={isBuy ? '1' : 'any'}
              />
              {belowMin && (
                <p className="text-xs text-red mt-1.5">
                  الحد الأدنى {isBuy ? `1 USD` : `${fmtCrypto(minAmount)} ${selectedCrypto.symbol.toUpperCase()}`}
                </p>
              )}
            </div>

            <div className="divider-gold" />

            <div className="flex justify-between items-center">
              <span className="caption">{t('crypto.rate')}</span>
              <span className="price-badge">
                1 {selectedCrypto.symbol.toUpperCase()} = {currentPriceUSD > 0 ? `$${fmt(currentPriceUSD)}` : '—'}
              </span>
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
                    <span className="caption">{isBuy ? t('crypto.youPay') : t('crypto.youSell')}</span>
                    <span className="h4 text-espresso">
                      {isBuy ? `${fmt(numAmount)} USD` : `${fmtCrypto(numAmount)} ${selectedCrypto.symbol.toUpperCase()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="caption">المبلغ قبل الخصم</span>
                    <span className="text-sm font-mono text-espresso">
                      {isBuy ? `${fmtCrypto(grossReceive)} ${selectedCrypto.symbol.toUpperCase()}` : `${fmt(grossReceive)} USD`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="caption text-red">رسوم ({feePercent}%)</span>
                    <span className="text-sm font-mono text-red">
                      -{isBuy ? `${fmtCrypto(feeAmount)} ${selectedCrypto.symbol.toUpperCase()}` : `${fmt(feeAmount)} USD`}
                    </span>
                  </div>
                  <div className="border-t border-gold/30 pt-2 flex justify-between items-center">
                    <span className="caption font-heading font-semibold">{t('crypto.youReceive')}</span>
                    <span className="h3 gold-text mono">
                      {isBuy ? `${fmtCrypto(youReceiveValue)} ${selectedCrypto.symbol.toUpperCase()}` : `${fmt(youReceiveValue)} USD`}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="caption">{isBuy ? t('crypto.youPay') : t('crypto.youSell')}</span>
                    <span className="h4 text-espresso">
                      {isBuy ? `${fmt(numAmount)} USD` : `${fmtCrypto(numAmount)} ${selectedCrypto.symbol.toUpperCase()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="caption">{t('crypto.youReceive')}</span>
                    <span className="h3 gold-text mono">
                      {isBuy ? `${fmtCrypto(youReceiveValue)} ${selectedCrypto.symbol.toUpperCase()}` : `${fmt(youReceiveValue)} USD`}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="caption block mb-1.5 font-medium">
                {isBuy ? t('form.paymentMethod') : 'طريقة الاستلام'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {visibleWallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => { setPaymentMethod(w.id); setReceiveInfo('') }}
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
            </div>

            {isBuy && paymentMethod && walletAddressValue && (
              <div className="bg-ivory-dark rounded-lg p-3 border border-gold-light">
                <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                  {t('form.transferTo')} {getWalLabel(paymentMethod) || selectedWallet?.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-espresso break-all flex-1">{walletAddressValue}</span>
                  <button onClick={() => copyToClipboard(walletAddressValue)} className="shrink-0 p-1 rounded-md text-espresso-faint hover:text-gold hover:bg-gold-subtle transition-colors" title="نسخ">
                    <CopyIcon size={16} />
                  </button>
                </div>
              </div>
            )}

            {!isBuy && paymentMethod && (
              <div className="bg-ivory-dark rounded-lg p-3 border border-gold-light">
                <span className="text-xs text-espresso-muted block mb-1.5 font-heading font-semibold">
                  عنوان محفظتك لاستلام {getWalLabel(paymentMethod) || selectedWallet?.label || 'المبلغ'}
                </span>
                <input
                  type="text"
                  value={receiveInfo}
                  onChange={(e) => setReceiveInfo(e.target.value)}
                  className="input-luxury font-mono text-sm w-full"
                  placeholder={`أدخل عنوان ${selectedWallet?.label || 'المحفظة'}...`}
                  autoFocus
                />
              </div>
            )}

            <div className="divider-gold" />

            {!isBuy && ourWallet && (
              <div className="bg-ivory-dark rounded-lg p-3 border border-gold-light">
                <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                  أرسل {selectedCrypto.symbol.toUpperCase()} إلى عنواننا
                </span>
                {ourWallet.value ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-espresso break-all flex-1">{ourWallet.value}</span>
                      <button onClick={() => copyToClipboard(ourWallet.value)} className="shrink-0 p-1 rounded-md text-espresso-faint hover:text-gold hover:bg-gold-subtle transition-colors" title="نسخ">
                        <CopyIcon size={16} />
                      </button>
                    </div>
                    {ourWallet.charLimit && (
                      <span className="text-[10px] text-espresso-faint block mt-1">{ourWallet.value.length}/{ourWallet.charLimit} حرف</span>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-espresso-faint">لم يتم تعيين عنوان المحفظة بعد من قبل الإدارة</p>
                )}
              </div>
            )}

            <div>
              <label className="caption block mb-1.5 font-medium">
                {isBuy ? t('crypto.yourAddress') : `عنوان محفظة ${selectedCrypto.symbol.toUpperCase()} الخاصة بك`}
              </label>
              <input
                type="text"
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                className="input-luxury font-mono text-sm"
                placeholder={t('crypto.addressPlaceholder', { crypto: selectedCrypto.symbol.toUpperCase() })}
              />
              {ourWallet && ourWallet.charLimit && (
                <span className="text-[10px] text-espresso-faint block mt-1">الحد الأقصى: {ourWallet.charLimit} حرف</span>
              )}
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
                <span className="text-espresso-muted">{isBuy ? t('crypto.youPay') : t('crypto.youSell')}</span>
                <span className="font-mono font-medium text-espresso">
                  {isBuy ? `${fmt(numAmount)} USD` : `${fmtCrypto(numAmount)} ${selectedCrypto.symbol.toUpperCase()}`}
                </span>
              </div>
              {feePercent > 0 && numAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-espresso-muted">المبلغ قبل الخصم</span>
                    <span className="font-mono font-medium text-espresso">
                      {isBuy ? `${fmtCrypto(grossReceive)} ${selectedCrypto.symbol.toUpperCase()}` : `${fmt(grossReceive)} USD`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-espresso-muted text-red">رسوم ({feePercent}%)</span>
                    <span className="font-mono font-medium text-red">
                      -{isBuy ? `${fmtCrypto(feeAmount)} ${selectedCrypto.symbol.toUpperCase()}` : `${fmt(feeAmount)} USD`}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-espresso-muted">{t('crypto.youReceive')}</span>
                <span className="font-mono font-medium gold-text">
                  {isBuy ? `${fmtCrypto(youReceiveValue)} ${selectedCrypto.symbol.toUpperCase()}` : `${fmt(youReceiveValue)} USD`}
                </span>
              </div>
            </div>

            {isBuy && paymentMethod && walletAddressValue && (
              <div className="bg-ivory-dark rounded-lg p-3 mb-4 border border-gold-light">
                <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                  {t('form.transferTo')} {getWalLabel(paymentMethod) || selectedWallet?.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-espresso break-all flex-1">{walletAddressValue}</span>
                  <button onClick={() => copyToClipboard(walletAddressValue)} className="shrink-0 p-1 rounded-md text-espresso-faint hover:text-gold hover:bg-gold-subtle transition-colors" title="نسخ">
                    <CopyIcon size={16} />
                  </button>
                </div>
              </div>
            )}

            {!isBuy && receiveInfo && (
              <div className="bg-ivory-dark rounded-lg p-3 mb-4 border border-gold-light">
                <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                  ستستلم المبلغ على {getWalLabel(paymentMethod) || selectedWallet?.label || paymentMethod}
                </span>
                <span className="text-sm font-mono text-espresso break-all">{receiveInfo}</span>
              </div>
            )}

            {!isBuy && ourWallet && ourWallet.value && (
              <div className="bg-ivory-dark rounded-lg p-3 mb-4 border border-gold-light">
                <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                  أرسل {selectedCrypto.symbol.toUpperCase()} إلى عنواننا
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-espresso break-all flex-1">{ourWallet.value}</span>
                  <button onClick={() => copyToClipboard(ourWallet.value)} className="shrink-0 p-1 rounded-md text-espresso-faint hover:text-gold hover:bg-gold-subtle transition-colors" title="نسخ">
                    <CopyIcon size={16} />
                  </button>
                </div>
              </div>
            )}

            {cryptoAddress && (
              <div className="bg-ivory-dark rounded-lg p-3 mb-4 border border-gold-light">
                <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                  {isBuy ? `ستستلم ${selectedCrypto.symbol.toUpperCase()} على` : `عنوان محفظتك (${selectedCrypto.symbol.toUpperCase()})`}
                </span>
                <span className="text-sm font-mono text-espresso break-all">{cryptoAddress}</span>
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
        message={`تم تقديم طلب ${isBuy ? 'شراء' : 'بيع'} ${selectedCrypto.symbol.toUpperCase()} بنجاح`}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}
