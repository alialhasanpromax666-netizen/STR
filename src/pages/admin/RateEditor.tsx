import { useState } from 'react'
import { useAdmin } from '../../store/AdminContext'
import Button from '../../components/ui/Button'

export default function RateEditor() {
  const { config, updateBuyRate, updateSellRate, updateFee, saveConfig } = useAdmin()
  const [buyRate, setBuyRate] = useState((config.buyRate || config.usdtRate + 2).toString())
  const [sellRate, setSellRate] = useState((config.sellRate || config.usdtRate - 2).toString())
  const [fee, setFee] = useState(config.feePercent.toString())
  const [saved, setSaved] = useState(false)

  const spread = (parseFloat(buyRate) || 0) - (parseFloat(sellRate) || 0)

  function doSave() {
    const b = parseFloat(buyRate)
    const s = parseFloat(sellRate)
    if (b > 0 && s > 0) {
      updateBuyRate(b)
      updateSellRate(s)
      saveConfig()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  function handleSaveFee() {
    const num = parseFloat(fee)
    if (num >= 0) {
      updateFee(num)
      saveConfig()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const effectiveBuy = parseFloat(buyRate) / (1 - parseFloat(fee) / 100)
  const effectiveSell = parseFloat(sellRate) * (1 - parseFloat(fee) / 100)

  return (
    <div>
      <h2 className="h2 text-espresso mb-6">إدارة سعر الصرف</h2>

      <div className="max-w-lg space-y-6">
        <div className="luxury-card p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="caption block mb-2 font-medium text-emerald">سعر الشراء (USD → SYP)</label>
              <input
                type="number"
                value={buyRate}
                onChange={(e) => setBuyRate(e.target.value)}
                className="input-luxury font-mono text-lg"
                min="1"
              />
              <p className="text-xs text-espresso-faint mt-1.5">
                1 USD = {parseInt(buyRate || '0', 10).toLocaleString()} ل.س
              </p>
              <p className="text-xs text-espresso-faint">
                المستخدم يدفع هذا السعر لشراء USDT
              </p>
            </div>
            <div>
              <label className="caption block mb-2 font-medium text-red">سعر البيع (SYP → USD)</label>
              <input
                type="number"
                value={sellRate}
                onChange={(e) => setSellRate(e.target.value)}
                className="input-luxury font-mono text-lg"
                min="1"
              />
              <p className="text-xs text-espresso-faint mt-1.5">
                1 USD = {parseInt(sellRate || '0', 10).toLocaleString()} ل.س
              </p>
              <p className="text-xs text-espresso-faint">
                المستخدم يحصل على هذا السعر عند بيع USDT
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gold-subtle rounded-lg mb-4">
            <span className="caption font-medium">الفرق (Spread)</span>
            <span className="mono gold-text font-semibold">{spread.toLocaleString()} ل.س</span>
          </div>

          <Button variant="gold" onClick={doSave} className="w-full">
            {saved ? 'تم الحفظ ✓' : 'حفظ الأسعار'}
          </Button>

          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="h4 text-espresso mb-3">حسابات سريعة</h4>
            <div className="flex flex-wrap gap-2">
              {[128, 130, 132, 134, 136, 140, 144, 148, 150, 155, 160].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setBuyRate((r + 2).toString())
                    setSellRate((r - 2).toString())
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-colors duration-200 border ${
                    parseInt(buyRate || '0', 10) === r + 2 && parseInt(sellRate || '0', 10) === r - 2
                      ? 'bg-gold text-white border-gold'
                      : 'bg-white text-espresso-muted border-border hover:border-gold'
                  }`}
                >
                  {r.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <label className="caption block mb-2 font-medium">نسبة الرسوم (%)</label>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="input-luxury font-mono text-lg"
                min="0"
                step="0.1"
              />
              {parseFloat(fee) > 0 && (
                <p className="text-xs text-espresso-faint mt-1.5">
                  سعر الشراء الفعلي: 1 USD = {effectiveBuy.toFixed(2)} ل.س | سعر البيع الفعلي: 1 USD = {effectiveSell.toFixed(2)} ل.س
                </p>
              )}
            </div>
            <Button variant="gold" onClick={handleSaveFee} className="mt-0.5">
              {saved ? 'تم الحفظ ✓' : 'حفظ'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
