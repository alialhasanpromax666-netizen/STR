import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import NotesBanner from '../components/admin/NotesBanner'
import Button from '../components/ui/Button'
import { MessageCircleIcon, SendIcon, ExternalLinkIcon, CheckIcon } from '../components/icons/Icons'

export default function Contact() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setName('')
      setEmail('')
      setMessage('')
    }, 3000)
  }

  return (
    <div className="section">
      <div className="max-w-2xl mx-auto">
        <NotesBanner section="contact" />
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="h1 text-espresso">{t('contact.page.title')}</h1>
          <p className="body-secondary mt-2">{t('contact.page.desc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="luxury-card p-5 flex items-center gap-4 group animate-fade-up stagger-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gold-faint flex items-center justify-center text-gold flex-shrink-0 group-hover:bg-gold group-hover:text-white transition-all duration-300">
              <MessageCircleIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="h3 text-espresso mb-1">{t('contact.whatsapp.name')}</h3>
              <p className="caption">{t('contact.whatsapp.desc')}</p>
            </div>
            <ExternalLinkIcon size={16} className="text-espresso-faint flex-shrink-0" />
          </a>
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="luxury-card p-5 flex items-center gap-4 group animate-fade-up stagger-2"
          >
            <div className="w-12 h-12 rounded-xl bg-gold-faint flex items-center justify-center text-gold flex-shrink-0 group-hover:bg-gold group-hover:text-white transition-all duration-300">
              <SendIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="h3 text-espresso mb-1">{t('contact.telegram.name')}</h3>
              <p className="caption">{t('contact.telegram.desc')}</p>
            </div>
            <ExternalLinkIcon size={16} className="text-espresso-faint flex-shrink-0" />
          </a>
        </div>

        <div className="luxury-card p-6 animate-fade-up stagger-3">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-light flex items-center justify-center mx-auto mb-3">
                <CheckIcon size={24} className="text-emerald" />
              </div>
              <p className="h3 text-espresso">{t('form.submitted')}</p>
              <p className="body-secondary mt-1">{t('form.submittedDesc')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="caption block mb-1.5 font-medium text-espresso-muted">
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-luxury"
                  required
                />
              </div>
              <div>
                <label className="caption block mb-1.5 font-medium text-espresso-muted">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-luxury"
                  required
                />
              </div>
              <div>
                <label className="caption block mb-1.5 font-medium text-espresso-muted">
                  {t('contact.form.message')}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="input-luxury resize-none"
                  required
                />
              </div>
              <Button type="submit" variant="gold" className="w-full">
                {t('contact.form.send')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
