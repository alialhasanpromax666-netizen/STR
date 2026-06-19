import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import Button from '../components/ui/Button'

export default function Login() {
  const { phone, setPhone } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [inputPhone, setInputPhone] = useState(phone)
  const redirect = searchParams.get('redirect') || '/orders'

  const handleSave = () => {
    setPhone(inputPhone)
    navigate(redirect, { replace: true })
  }

  return (
    <div className="section min-h-[60vh] flex items-center justify-center">
      <div className="luxury-card p-8 max-w-sm w-full text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-gold-faint flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="h2 text-espresso mb-2">تسجيل الدخول</h1>
        <p className="body-secondary mb-6">أدخل رقم هاتفك لمتابعة طلباتك</p>
        <input
          type="tel"
          value={inputPhone}
          onChange={(e) => setInputPhone(e.target.value)}
          placeholder="09XX XXX XXX"
          className="input-luxury w-full mb-4 text-center"
          dir="ltr"
        />
        <div className="flex gap-2">
          <Button variant="gold" className="flex-1" onClick={handleSave} disabled={!inputPhone.trim()}>
            دخول
          </Button>
          <Button variant="outline-gold" onClick={() => navigate(-1)}>رجوع</Button>
        </div>
      </div>
    </div>
  )
}
