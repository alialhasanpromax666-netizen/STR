import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { PhoneIcon, ArrowUpDownIcon, ZapIcon } from '../components/icons/Icons'

export default function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    {
      icon: PhoneIcon,
      title: t('howItWorks.step1'),
      desc: t('howItWorks.step1Desc'),
    },
    {
      icon: ArrowUpDownIcon,
      title: t('howItWorks.step2'),
      desc: t('howItWorks.step2Desc'),
    },
    {
      icon: ZapIcon,
      title: t('howItWorks.step3'),
      desc: t('howItWorks.step3Desc'),
    },
  ]

  return (
    <div className="section">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="h1 text-espresso">{t('howItWorks.title')}</h1>
          <p className="body-secondary mt-2">{t('howItWorks.desc')}</p>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="luxury-card p-6 flex items-start gap-5 animate-fade-up"
              style={{ animationDelay: `${0.15 * (i + 1)}s` }}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gold-faint flex items-center justify-center text-gold flex-shrink-0">
                  <step.icon size={22} />
                </div>
                <div className="absolute -top-1 -end-1 w-6 h-6 rounded-full bg-gold text-white text-xs font-bold font-heading flex items-center justify-center">
                  {i + 1}
                </div>
              </div>
              <div>
                <h3 className="h3 text-espresso mb-1">{step.title}</h3>
                <p className="body-secondary">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 animate-fade-up stagger-4">
          <p className="body-secondary mb-4">{t('form.cta')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/recharge">
              <Button variant="gold">{t('nav.recharge')}</Button>
            </Link>
            <Link to="/crypto">
              <Button variant="outline-gold">{t('nav.crypto')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
