import { useState } from 'react'
import { useAdmin } from '../../store/AdminContext'
import GoldLogo from '../../components/hallmarked/GoldLogo'
import Button from '../../components/ui/Button'

export default function LoginGate() {
  const { login } = useAdmin()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const ok = await login(password)
    setLoading(false)
    if (!ok) setError(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory p-4">
      <div className="luxury-card p-8 w-full max-w-sm animate-fade-up">
        <div className="text-center mb-6">
          <GoldLogo size="lg" />
          <p className="caption mt-3">لوحة الإدارة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="caption block mb-1.5 font-medium">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              className="input-luxury"
              placeholder="••••••••"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red mt-1.5">كلمة المرور غير صحيحة</p>
            )}
          </div>
          <Button variant="gold" type="submit" className="w-full" loading={loading}>
            دخول
          </Button>
        </form>
      </div>
    </div>
  )
}
