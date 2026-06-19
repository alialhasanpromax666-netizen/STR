import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../store/AuthContext'
import GoldLogo from '../hallmarked/GoldLogo'
import TickerBar from '../hallmarked/TickerBar'
import { MenuIcon, XIcon, GlobeIcon, MessageCircleIcon, SendIcon, UserIcon, ClipboardTextIcon } from '../icons/Icons'

function UserMenu() {
  const { deviceId, phone } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-ivory-dark transition-colors duration-200"
      >
        <div className="w-7 h-7 rounded-full bg-gold-faint flex items-center justify-center text-gold text-xs font-heading font-bold">
          {deviceId.slice(-2).toUpperCase()}
        </div>
        <span className="text-sm font-heading font-medium text-espresso hidden sm:inline max-w-24 truncate">
          {phone || 'حسابي'}
        </span>
      </button>
      {open && (
        <div className="absolute top-full end-0 mt-1 w-48 bg-white border border-border rounded-xl shadow-lg py-1 z-50 animate-fade-up">
          <button
            onClick={() => { setOpen(false); navigate('/orders') }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-espresso hover:bg-ivory-dark transition-colors duration-200"
          >
            <ClipboardTextIcon size={16} />
            طلباتي
          </button>
          <button
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-espresso hover:bg-ivory-dark transition-colors duration-200"
          >
            <UserIcon size={16} />
            الملف الشخصي
          </button>
        </div>
      )}
    </div>
  )
}

function Header() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleLang = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(next)
  }

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/recharge', label: t('nav.recharge') },
    { path: '/crypto', label: t('nav.crypto') },
    { path: '/orders', label: t('nav.orders') },
    { path: '/how-it-works', label: t('nav.how') },
    { path: '/contact', label: t('nav.contact') },
  ]

  return (
    <>
      <div className="hidden md:block">
        <TickerBar />
      </div>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="section-tight flex items-center justify-between h-16 py-0">
          <Link to="/" className="flex items-center gap-2">
            <GoldLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-md text-sm font-heading font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-gold bg-gold-subtle'
                    : 'text-espresso-muted hover:text-espresso hover:bg-ivory-dark'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <UserMenu />
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-espresso-muted hover:text-espresso hover:bg-ivory-dark transition-colors duration-200 font-heading font-medium"
              aria-label="Toggle language"
            >
              <GlobeIcon size={14} />
              <span className="text-xs font-semibold">{i18n.language === 'ar' ? 'EN' : 'ع'}</span>
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md text-espresso-muted hover:text-espresso hover:bg-ivory-dark transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {menuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-espresso/10 animate-fade-up"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-0 end-0 h-full w-[calc(100%-3rem)] max-w-72 bg-white border-s border-border p-4 pt-20 sm:p-6 sm:pt-24 overflow-y-auto animate-fade-up">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-heading font-medium transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-gold bg-gold-subtle'
                      : 'text-espresso-muted hover:text-espresso hover:bg-ivory-dark'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="section-tight flex flex-col sm:flex-row items-center justify-between gap-3 py-6">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <GoldLogo size="sm" />
          <p className="caption">{t('footer.tagline')}</p>
        </div>
        <p className="caption">{t('footer.copyright')}</p>
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-espresso-faint hover:text-gold transition-colors duration-200"
            aria-label="WhatsApp"
          >
            <MessageCircleIcon size={18} />
          </a>
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-espresso-faint hover:text-gold transition-colors duration-200"
            aria-label="Telegram"
          >
            <SendIcon size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
