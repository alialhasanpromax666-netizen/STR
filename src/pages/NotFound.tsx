import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="section text-center py-24 animate-fade-up">
      <p className="text-7xl md:text-9xl font-bold font-display text-gold/30 tracking-widest">404</p>
      <h1 className="h1 text-espresso mt-4">{t('notFound.desc')}</h1>
      <div className="mt-8">
        <Link to="/" className="btn-outline-gold inline-flex">
          {t('notFound.home')}
        </Link>
      </div>
    </div>
  )
}
