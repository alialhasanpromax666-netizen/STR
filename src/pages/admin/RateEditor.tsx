import { useState } from 'react'
import { useAdmin } from '../../store/AdminContext'
import Button from '../../components/ui/Button'

export default function RateEditor() {
  const { config, updateRate, updateFee, saveConfig } = useAdmin()
  const [rate, setRate] = useState(config.usdtRate.toString())
  const [fee, setFee] = useState(config.feePercent.toString())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const num = parseFloat(rate)
    if (num > 0) {
      updateRate(num)
      saveConfig()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleSaveFee = () => {
    const num = parseFloat(fee)
    if (num >= 0) {
      updateFee(num)
      saveConfig()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const effectiveRate = parseInt(rate, 10) / (1 - parseFloat(fee) / 100)

  return (
    <div>
      <h2 className="h2 text-espresso mb-6">إدارة سعر الصرف</h2>

      <div className="max-w-lg space-y-6">
        <div className="luxury-card p-6">
          <label className="caption block mb-2 font-medium">سعر صرف USD → SYP</label>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="input-luxury font-mono text-lg"
                min="1"
              />
              <p className="text-xs text-espresso-faint mt-1.5">
                1 USD = {parseInt(rate, 10).toLocaleString()} ل.س
              </p>
            </div>
            <Button variant="gold" onClick={handleSave} className="mt-0.5">
              {saved ? 'تم الحفظ ✓' : 'حفظ'}
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="h4 text-espresso mb-3">حسابات سريعة</h4>
            <div className="flex flex-wrap gap-2">
              {[130, 140, 144, 150, 155, 160].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRate(r.toString())
                    updateRate(r)
                    setSaved(true)
                    setTimeout(() => setSaved(false), 2000)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-colors duration-200 border ${
                    parseInt(rate, 10) === r
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
                  السعر الفعلي: 1 USD = {effectiveRate.toFixed(2)} ل.س (بما في ذلك {fee}% رسوم)
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