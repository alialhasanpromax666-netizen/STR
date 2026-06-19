import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdmin } from '../store/AdminContext'
import { useAuth } from '../store/AuthContext'
import NotesBanner from '../components/admin/NotesBanner'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { config, createOrder } = useAdmin()
  const { deviceId } = useAuth()

  const product = config.products.find((p) => p.id === id)

  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentProof, setPaymentProof] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const fileRef = useRef<HTMLInputElement>(null)

  const outOfStock = product ? (product.stock !== null && product.stock <= 0) : false
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

  const sypAmount = useMemo(() => {
    if (product) return product.priceUSD * quantity * config.usdtRate
    return 0
  }, [product, quantity, config.usdtRate])

  useEffect(() => {
    if (paymentMethod && !product?.paymentMethods.includes(paymentMethod)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaymentMethod('')
    }
  }, [paymentMethod, product])

  if (!product) {
    return (
      <div className="section">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="h2 mb-4">المنتج غير موجود</h2>
          <button className="btn-gold" onClick={() => navigate('/products')}>عودة إلى المنتجات</button>
        </div>
      </div>
    )
  }

  const visibleWallets = config.wallets.filter((w) => w.enabled && product.paymentMethods.includes(w.id))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('حجم الصورة كبير جداً. الحد الأقصى 2 ميغابايت.'); return }
    const reader = new FileReader()
    reader.onload = () => setPaymentProof(reader.result?.toString() ?? '')
    reader.readAsDataURL(file)
  }

  const canProceed = !outOfStock && !!paymentMethod && !!paymentProof && quantity > 0

  const handleProceed = () => {
    if (!canProceed || outOfStock) return
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    if (submitting) return
    if (outOfStock) return
    setSubmitting(true)
    createOrder({
      type: 'buy-product',
      phone: '',
      amount: quantity,
      usdtAmount: product.priceUSD * quantity,
      sypAmount,
      paymentMethod,
      paymentProof,
      walletAddress: selectedWallet?.value,
      userId: deviceId,
      productId: product.id,
      quantity,
    })
    setShowConfirm(false)
    setSubmitting(false)
    setPaymentProof('')
    setPaymentMethod('')
    setQuantity(1)
    setShowToast(true)
  }

  return (
    <div className="section">
      <div className="max-w-4xl mx-auto">
        <NotesBanner section="products" />
        <button className="btn-outline-gold text-sm mb-6" onClick={() => navigate('/products')}>← عودة إلى المنتجات</button>

        <div className="luxury-card p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {product.image ? (
                <div className="aspect-square rounded-xl overflow-hidden bg-espresso-faint">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square rounded-xl bg-espresso-faint flex items-center justify-center">
                  <span className="body-secondary">لا توجد صورة</span>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h1 className="h2 mb-2">{product.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <span className="mono gold-text text-2xl">${product.priceUSD.toFixed(2)}</span>
                <span className="pill-luxury text-sm">
                  {outOfStock ? 'نفذت الكمية' : product.stock === null ? 'متوفر' : `بقي ${product.stock}`}
                </span>
              </div>

              {product.description && (
                <p className="body-secondary mb-6 whitespace-pre-wrap">{product.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="body-secondary text-xs">طرق الدفع:</span>
                {product.paymentMethods.map((pm) => {
                  const wal = config.wallets.find((w) => w.id === pm)
                  return <span key={pm} className="pill-luxury text-xs">{wal?.label || pm}</span>
                })}
              </div>

              {outOfStock ? (
                <div className="bg-error/10 text-error rounded-lg p-4 text-center mb-6">
                  عذراً، هذا المنتج نفذت كميته
                </div>
              ) : (
                <div className="space-y-4 mt-auto">
                  <div>
                    <label className="block body-secondary text-xs mb-1">طريقة الدفع</label>
                    <select
                      className="input-luxury w-full"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="">اختر طريقة الدفع</option>
                      {visibleWallets.map((w) => (
                        <option key={w.id} value={w.id}>{w.label}</option>
                      ))}
                    </select>
                  </div>

                  {paymentMethod && walletAddressValue && (
                    <div className="bg-ivory-dark rounded-lg p-3 border border-gold-light">
                      <span className="text-xs text-espresso-muted block mb-1 font-heading font-semibold">
                        أرسل المبلغ إلى: {getWalLabel(paymentMethod) || selectedWallet?.label}
                      </span>
                      <span className="text-sm font-mono text-espresso break-all">{walletAddressValue}</span>
                    </div>
                  )}

                  <div>
                    <label className="block body-secondary text-xs mb-1">إثبات الدفع (مطلوب)</label>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="text-sm" />
                    {paymentProof && (
                      <div className="mt-2 relative inline-block">
                        <img src={paymentProof} alt="" className="h-20 w-20 object-cover rounded border border-border" />
                        <button className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs" onClick={() => setPaymentProof('')}>×</button>
                      </div>
                    )}
                  </div>

                  <button
                    className={`btn-gold w-full ${!canProceed ? 'opacity-50' : ''}`}
                    disabled={!canProceed}
                    onClick={handleProceed}
                  >
                    تأكيد الشراء
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(false)}>
            <div className="luxury-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="h4 mb-4">تأكيد الطلب</h3>
              <div className="space-y-2 mb-6 body-secondary text-sm">
                <p>المنتج: {product.name}</p>
                <p>السعر: <span className="gold-text">${(product.priceUSD * quantity).toFixed(2)}</span></p>
                <p>ما يعادل: {sypAmount.toLocaleString()} ل.س</p>
                <p>طريقة الدفع: {getWalLabel(paymentMethod) || selectedWallet?.label}</p>
                {walletAddressValue && (
                  <p>عنوان الدفع: <span className="text-xs font-mono break-all">{walletAddressValue}</span></p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="gold" onClick={handleConfirm}>تأكيد</Button>
                <Button variant="outline-gold" onClick={() => setShowConfirm(false)}>إلغاء</Button>
              </div>
            </div>
          </div>
        )}

        {showToast && (
          <Toast message="تم تقديم طلبك بنجاح" visible={showToast} onClose={() => setShowToast(false)} />
        )}
      </div>
    </div>
  )
}
