import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import Button from '../components/ui/Button'

export default function Profile() {
  const { deviceId, phone, setPhone } = useAuth()
  const navigate = useNavigate()
  const [editPhone, setEditPhone] = useState(phone)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setPhone(editPhone)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="section">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="h1 text-espresso">الملف الشخصي</h1>
          <p className="body-secondary mt-2">معلومات جهازك</p>
        </div>

        <div className="luxury-card p-6 animate-fade-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gold-faint flex items-center justify-center text-gold font-heading text-xl">
              {deviceId.slice(-2).toUpperCase()}
            </div>
            <div>
              <h2 className="h3 text-espresso">الجهاز الحالي</h2>
              <p className="caption">{phone || 'رقم الهاتف غير مضبوط'}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-ivory-dark rounded-lg">
              <span className="caption">معرف الجهاز</span>
              <span className="text-sm font-mono text-espresso-muted">{deviceId.slice(-8)}</span>
            </div>
            <div className="p-3 bg-ivory-dark rounded-lg">
              <span className="caption block mb-1.5">رقم الهاتف</span>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="09XX XXX XXX"
                className="input-luxury w-full text-sm"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="gold" onClick={handleSave}>
              {saved ? 'تم الحفظ ✓' : 'حفظ رقم الهاتف'}
            </Button>
            <Button variant="outline-gold" onClick={() => navigate('/orders')}>
              طلباتي
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
