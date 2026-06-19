import { useState, useEffect, useCallback } from 'react'
import { useAdmin } from '../../store/AdminContext'
import Button from '../../components/ui/Button'
import Toast from '../../components/ui/Toast'
import { ClockIcon } from '../../components/icons/Icons'

export default function Security() {
  const { adminSessions, fetchSessions, changePassword } = useAdmin()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(false)

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 10000)
    return () => clearInterval(interval)
  }, [fetchSessions])

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 4) { setError('كلمة المرور الجديدة قصيرة جداً (4 أحرف على الأقل)'); return }
    if (newPassword !== confirmPassword) { setError('كلمة المرور الجديدة وتأكيدها غير متطابقين'); return }
    setSaving(true)
    const ok = await changePassword(oldPassword, newPassword)
    setSaving(false)
    if (ok) {
      setOldPassword(''); setNewPassword(''); setConfirmPassword('')
      setToast(true)
    } else {
      setError('فشل تغيير كلمة المرور. تحقق من كلمة المرور القديمة')
    }
  }, [oldPassword, newPassword, confirmPassword, changePassword])

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="h2 text-espresso">الأمان</h2>

      <div className="luxury-card p-5">
        <h3 className="h3 text-espresso mb-4">الجلسات النشطة</h3>
        <p className="caption mb-4">الأجهزة المتصلة بلوحة الإدارة حالياً</p>
        {adminSessions.length === 0 ? (
          <p className="body-secondary">لا توجد جلسات نشطة</p>
        ) : (
          <div className="space-y-2">
            {adminSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      s.isActive ? 'bg-emerald' : 'bg-espresso-faint'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-espresso truncate">
                      {s.userAgent ? s.userAgent.split('/')[0] || s.userAgent.slice(0, 40) : 'متصفح'}
                    </p>
                    <p className="text-xs text-espresso-muted mt-0.5 flex items-center gap-1">
                      <ClockIcon size={10} />
                      {new Date(s.lastHeartbeat).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-espresso-faint flex-shrink-0 truncate max-w-24" dir="ltr">
                  {s.ip || '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="luxury-card p-5">
        <h3 className="h3 text-espresso mb-4">تغيير كلمة المرور</h3>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
          <div>
            <label className="caption block mb-1.5 font-medium">كلمة المرور القديمة</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input-luxury"
              required
            />
          </div>
          <div>
            <label className="caption block mb-1.5 font-medium">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-luxury"
              minLength={4}
              required
            />
          </div>
          <div>
            <label className="caption block mb-1.5 font-medium">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-luxury"
              minLength={4}
              required
            />
          </div>
          {error && <p className="text-sm text-red">{error}</p>}
          <Button variant="gold" type="submit" loading={saving}>
            حفظ كلمة المرور
          </Button>
        </form>
      </div>

      <Toast
        message="تم تغيير كلمة المرور بنجاح"
        visible={toast}
        onClose={() => setToast(false)}
      />
    </div>
  )
}
