import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdmin } from '../../store/AdminContext'
import GoldLogo from '../../components/hallmarked/GoldLogo'
import { GlobeIcon, MenuIcon, XIcon } from '../../components/icons/Icons'
import Toast from '../../components/ui/Toast'

const tabs = [
  { key: 'dashboard', label: 'لوحة التحكم' },
  { key: 'orders',    label: 'الطلبات' },
  { key: 'services',  label: 'الخدمات' },
  { key: 'products',  label: 'المنتجات' },
  { key: 'wallets',   label: 'عناوين الدفع' },
  { key: 'rates',     label: 'سعر الصرف' },
  { key: 'content',   label: 'المحتوى' },
  { key: 'blocked',   label: 'الحظر' },
  { key: 'security',  label: 'الأمان' },
]

interface AdminLayoutProps {
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
}

export default function AdminLayout({ activeTab, onTabChange, children }: AdminLayoutProps) {
  const { i18n } = useTranslation()
  const { logout, config } = useAdmin()
  const [menuOpen, setMenuOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    const handler = () => setToastVisible(true)
    window.addEventListener('str:config-save-error', handler)
    return () => window.removeEventListener('str:config-save-error', handler)
  }, [])

  const toggleLang = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(next)
  }

  const handleTab = (key: string) => {
    onTabChange(key)
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-3 md:px-6 h-12 md:h-14">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1.5 rounded-md text-espresso-muted hover:text-espresso hover:bg-ivory-dark transition-colors"
              aria-label="القائمة"
            >
              {menuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
            <GoldLogo size="sm" />
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <span className="caption text-[11px] md:text-xs">
              شراء:
              <span className="mono font-semibold text-emerald me-1">{(config.buyRate || config.usdtRate).toLocaleString()}</span>
            </span>
            <span className="caption text-[11px] md:text-xs">
              بيع:
              <span className="mono font-semibold text-red me-1">{(config.sellRate || config.usdtRate).toLocaleString()}</span>
            </span>
            <button onClick={toggleLang} className="flex items-center gap-1 px-1.5 md:px-2 py-1 rounded-md text-espresso-muted hover:text-espresso hover:bg-ivory-dark transition-colors text-xs md:text-sm font-heading">
              <GlobeIcon size={12} />
              {i18n.language === 'ar' ? 'EN' : 'ع'}
            </button>
            <button onClick={logout} className="px-2 md:px-3 py-1 rounded-md text-xs md:text-sm text-espresso-muted hover:text-red hover:bg-error-faint transition-colors font-heading">
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`fixed md:static inset-x-0 top-0 md:top-14 z-50 bg-white border-b md:border-e md:border-b-0 border-border shadow-lg md:shadow-none transition-all duration-200 ${
          menuOpen ? 'block' : 'hidden md:block'
        }`}>
          <nav className="flex-col gap-1 p-3 pt-14 md:pt-4 md:p-4 overflow-y-auto w-full md:w-56 max-h-screen">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTab(tab.key)}
                className={`whitespace-nowrap shrink-0 w-full text-start px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-heading font-medium transition-colors duration-200 ${
                  activeTab === tab.key
                    ? 'bg-gold text-white'
                    : 'text-espresso-muted hover:text-espresso hover:bg-ivory-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setMenuOpen(false)} />
        )}

        <main className="flex-1 p-3 md:p-6 min-w-0">
          {children}
        </main>
      </div>

      <Toast
        message="فشل حفظ الإعدادات. تحقق من اتصال الخادم."
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
        type="error"
        duration={4000}
      />
    </div>
  )
}
