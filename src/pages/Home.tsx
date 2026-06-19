import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAdmin } from '../store/AdminContext'
import NotesBanner from '../components/admin/NotesBanner'
import GoldLogo from '../components/hallmarked/GoldLogo'
import PriceCard from '../components/hallmarked/PriceCard'
import TrustBadge from '../components/hallmarked/TrustBadge'
import CountUp from '../components/hallmarked/CountUp'
import Button from '../components/ui/Button'
import { ZapIcon, ShieldIcon, ClockIcon, PhoneIcon, DollarSignIcon, StarIcon, BankIcon, WalletIcon, ShoppingCartIcon } from '../components/icons/Icons'

const serviceLinks: Record<string, string> = {
  mtn: '/recharge',
  syriatel: '/recharge',
  'mtn-cash': '/recharge',
  'syriatel-cash': '/recharge',
  'sham-cash-usd': '/recharge',
  'sham-cash-syp': '/recharge',
  'crypto-buy': '/crypto',
}

const serviceIcons: Record<string, typeof PhoneIcon> = {
  mtn: PhoneIcon,
  syriatel: PhoneIcon,
  'mtn-cash': WalletIcon,
  'syriatel-cash': WalletIcon,
  'sham-cash-usd': WalletIcon,
  'sham-cash-syp': WalletIcon,
  'crypto-buy': DollarSignIcon,
}

export default function Home() {
  const { t } = useTranslation()
  const { config } = useAdmin()
  const rate = config.usdtRate

  const homeServices = config.services.filter((s) => s.active)

  return (
    <div>
      <section className="section text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 start-1/4 w-64 h-64 bg-gold-faint rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-10 end-1/4 w-48 h-48 bg-gold-faint rounded-full blur-3xl opacity-20" />
        </div>

        <div className="relative">
          <div className="flex justify-center mb-4 animate-fade-up">
            <GoldLogo size="lg" />
          </div>

          <div className="animate-fade-up stagger-1">
            <h1 className="h1 text-espresso max-w-3xl mx-auto">
              <span className="gold-text">{config.heroTitle || t('home.hero.usdtPrice')}</span>
            </h1>
          </div>

          <div className="mt-6 animate-fade-up stagger-2">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-gold-subtle border border-gold-light rounded-xl px-4 sm:px-6 py-3">
              <span className="caption gold-text">1 USD</span>
              <span className="text-2xl font-bold mono gold-text">
                <CountUp end={rate} duration={2000} decimals={0} />
              </span>
              <span className="body-secondary">{t('crypto.syp')}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up stagger-3">
            <Link to="/crypto">
              <Button variant="gold" className="gap-2">
                <DollarSignIcon size={16} />
                {t('home.hero.buy')}
              </Button>
            </Link>
            <Link to="/recharge">
              <Button variant="outline-gold" className="gap-2">
                <PhoneIcon size={16} />
                {t('home.hero.recharge')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <NotesBanner section="home" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PriceCard
            label="USD / SYP"
            usdtPrice="1.00"
            sypPrice={rate.toLocaleString()}
            trend="up"
            usdtLabel={t('crypto.usdt')}
            sypLabel={t('crypto.syp')}
            className="animate-fade-up stagger-2"
          />
          <PriceCard
            label="SYP / USD"
            usdtPrice={(1 / rate).toFixed(6)}
            sypPrice="1"
            usdtLabel={t('crypto.usdt')}
            sypLabel={t('crypto.syp')}
            className="animate-fade-up stagger-3"
          />
        </div>
      </section>

      <section className="section">
        <div className="text-center mb-8 animate-fade-up stagger-3">
          <h2 className="h2 text-espresso">
            <span className="gold-border-bottom">{t('home.services.title')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {homeServices.map((svc, i) => {
            const Icon = serviceIcons[svc.id] || DollarSignIcon
            const link = serviceLinks[svc.id] || `/service/${svc.id}`
            return (
              <Link
                key={svc.id}
                to={link}
                className={`luxury-card p-5 flex items-start gap-4 group animate-fade-up`}
                style={{ animationDelay: `${0.15 * (i + 4)}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gold-faint flex items-center justify-center flex-shrink-0 text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="h3 text-espresso mb-1">{svc.name}</h3>
                  {svc.maintenance && (
                    <span className="text-xs text-gold bg-gold-subtle px-2 py-0.5 rounded font-heading">قيد الصيانة</span>
                  )}
                </div>
              </Link>
            )
          })}

          <Link to="/products" className="luxury-card p-5 flex items-start gap-4 group animate-fade-up stagger-7">
            <div className="w-12 h-12 rounded-xl bg-gold-faint flex items-center justify-center flex-shrink-0 text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300">
              <ShoppingCartIcon size={20} />
            </div>
            <div>
              <h3 className="h3 text-espresso mb-1">المنتجات</h3>
              <p className="body-secondary">تصفح منتجاتنا المتاحة للشراء</p>
            </div>
          </Link>

          <Link to="/how-it-works" className="luxury-card p-5 flex items-start gap-4 group animate-fade-up stagger-8">
            <div className="w-12 h-12 rounded-xl bg-gold-faint flex items-center justify-center flex-shrink-0 text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300">
              <StarIcon size={20} />
            </div>
            <div>
              <h3 className="h3 text-espresso mb-1">{t('home.services.how')}</h3>
              <p className="body-secondary">{t('home.services.howDesc')}</p>
            </div>
          </Link>

          <Link to="/contact" className="luxury-card p-5 flex items-start gap-4 group animate-fade-up stagger-9">
            <div className="w-12 h-12 rounded-xl bg-gold-faint flex items-center justify-center flex-shrink-0 text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300">
              <BankIcon size={20} />
            </div>
            <div>
              <h3 className="h3 text-espresso mb-1">{t('home.services.contact')}</h3>
              <p className="body-secondary">{t('home.services.contactDesc')}</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="section-tight">
        <div className="max-w-2xl mx-auto luxury-card p-8 animate-fade-up stagger-9">
          <div className="flex items-center gap-2 justify-center mb-8">
            <h2 className="h2 text-espresso">
              <span className="gold-border-bottom">{t('home.trust.instant')}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TrustBadge
              icon={<ZapIcon size={18} />}
              title={t('home.trust.instant')}
              desc={t('home.trust.instantDesc')}
            />
            <TrustBadge
              icon={<ShieldIcon size={18} />}
              title={t('home.trust.secure')}
              desc={t('home.trust.secureDesc')}
            />
            <TrustBadge
              icon={<ClockIcon size={18} />}
              title={t('home.trust.support')}
              desc={t('home.trust.supportDesc')}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
