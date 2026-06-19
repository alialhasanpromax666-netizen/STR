import { useState, useEffect } from 'react'
import { useAdmin } from '../../store/AdminContext'
import type { NoteSection, NoteType } from '../../store/types'
import { generateId } from '../../store/types'
import Button from '../../components/ui/Button'
import { XIcon, InfoIcon, WarningIcon, MegaphoneIcon } from '../../components/icons/Icons'
import type { IconProps } from '@phosphor-icons/react'

const sections: { key: NoteSection; label: string }[] = [
  { key: 'home', label: 'الرئيسية' },
  { key: 'recharge', label: 'الشحن' },
  { key: 'crypto', label: 'العملات' },
  { key: 'products', label: 'المنتجات' },
  { key: 'orders', label: 'الطلبات' },
  { key: 'contact', label: 'جهات الاتصال' },
  { key: 'all', label: 'جميع الصفحات' },
]

const noteTypes: { key: NoteType; label: string }[] = [
  { key: 'info', label: 'إعلام' },
  { key: 'warning', label: 'تنبيه' },
  { key: 'alert', label: 'تحذير' },
]

const noteIcons: Record<NoteType, React.ComponentType<IconProps>> = {
  info: InfoIcon,
  warning: WarningIcon,
  alert: MegaphoneIcon,
}

const noteStyles: Record<NoteType, string> = {
  info: 'bg-gold-subtle border-gold-light',
  warning: 'bg-amber-50 border-amber-200',
  alert: 'bg-error-faint border-error',
}

export default function ContentEditor() {
  const { config, updateHeroTitle, updateHeroSub, addNote, updateNote, deleteNote, toggleNoteActive, saveConfig } = useAdmin()
  const [title, setTitle] = useState(config.heroTitle)
  const [sub, setSub] = useState(config.heroSub)
  const [saved, setSaved] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editNoteId, setEditNoteId] = useState<string | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteSection, setNoteSection] = useState<NoteSection>('home')
  const [noteType, setNoteType] = useState<NoteType>('info')

  useEffect(() => {
    setTitle(config.heroTitle)
    setSub(config.heroSub)
  }, [config.heroTitle, config.heroSub])

  const handleSave = () => {
    updateHeroTitle(title)
    updateHeroSub(sub)
    saveConfig()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditNoteId(null)
    setNoteTitle('')
    setNoteContent('')
    setNoteSection('home')
    setNoteType('info')
  }

  const handleAddNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return
    if (editNoteId) {
      updateNote(editNoteId, { title: noteTitle.trim(), content: noteContent.trim(), section: noteSection, type: noteType })
    } else {
      addNote({
        id: generateId('note-'),
        title: noteTitle.trim(),
        content: noteContent.trim(),
        section: noteSection,
        type: noteType,
        active: true,
        createdAt: new Date().toISOString(),
      })
    }
    saveConfig()
    resetForm()
  }

  const handleToggleNote = (id: string) => {
    toggleNoteActive(id)
    saveConfig()
  }

  const handleDeleteNote = (id: string) => {
    deleteNote(id)
    saveConfig()
  }

  const handleEdit = (id: string) => {
    const note = config.notes.find((n) => n.id === id)
    if (!note) return
    setEditNoteId(id)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setNoteSection(note.section)
    setNoteType(note.type)
    setShowForm(true)
  }

  return (
    <div>
      <h2 className="h2 text-espresso mb-6">إدارة المحتوى</h2>

      <div className="max-w-lg space-y-6 mb-10">
        <div className="luxury-card p-6">
          <label className="caption block mb-2 font-medium">عنوان الصفحة الرئيسية</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-luxury"
          />
          <div className="mt-3 p-3 bg-gold-faint rounded-lg">
            <p className="text-xs text-espresso-muted mb-1">معاينة:</p>
            <p className="h4 text-espresso">{title}</p>
          </div>
        </div>

        <div className="luxury-card p-6">
          <label className="caption block mb-2 font-medium">الوصف الفرعي</label>
          <input
            type="text"
            value={sub}
            onChange={(e) => setSub(e.target.value)}
            className="input-luxury"
          />
          <div className="mt-3 p-3 bg-gold-faint rounded-lg">
            <p className="text-xs text-espresso-muted mb-1">معاينة:</p>
            <p className="body-secondary">{sub}</p>
          </div>
        </div>

        <Button variant="gold" onClick={handleSave}>
          {saved ? 'تم الحفظ ✓' : 'حفظ التغييرات'}
        </Button>
      </div>

      <div className="border-t border-border pt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="h3 text-espresso">الملاحظات</h3>
          <button type="button"
            onClick={() => { resetForm(); setShowForm(true) }}
            className="btn-outline-gold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1.5"
          >
            إضافة ملاحظة
          </button>
        </div>

        {showForm && (
          <div className="luxury-card p-5 mb-6 animate-fade-up">
            <div className="space-y-4">
              <div>
                <label className="caption block mb-1.5 font-medium">القسم</label>
                <select
                  value={noteSection}
                  onChange={(e) => setNoteSection(e.target.value as NoteSection)}
                  className="input-luxury w-full"
                >
                  {sections.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="caption block mb-1.5 font-medium">النوع</label>
                <div className="flex gap-2">
                  {noteTypes.map((nt) => (
                    <button type="button"
                      key={nt.key}
                      onClick={() => setNoteType(nt.key)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-heading font-medium transition-colors border ${
                        noteType === nt.key
                          ? 'bg-gold text-white border-gold'
                          : 'bg-white text-espresso-muted border-border'
                      }`}
                    >
                      {nt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="caption block mb-1.5 font-medium">العنوان</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="input-luxury w-full"
                  placeholder="عنوان الملاحظة..."
                  autoFocus
                />
              </div>
              <div>
                <label className="caption block mb-1.5 font-medium">المحتوى</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="input-luxury w-full resize-none"
                  rows={3}
                  placeholder="نص الملاحظة..."
                />
              </div>
              <div className="flex gap-2">
                <Button variant="gold" onClick={handleAddNote} disabled={!noteTitle.trim() || !noteContent.trim()}>
                  {editNoteId ? 'تحديث' : 'إضافة'}
                </Button>
                <Button variant="outline-gold" onClick={resetForm}>إلغاء</Button>
              </div>
            </div>
          </div>
        )}

        {config.notes.length === 0 ? (
          <p className="text-sm text-espresso-faint">لا توجد ملاحظات بعد</p>
        ) : (
          <div className="space-y-3">
            {config.notes.map((note) => {
              const Icon = noteIcons[note.type] || InfoIcon
              return (
                <div key={note.id} className={`luxury-card p-4 flex items-start gap-3 ${noteStyles[note.type] || noteStyles.info}`}>
                  <div className="shrink-0 mt-0.5">
                    <Icon size={18} weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-heading font-semibold">{note.title}</span>
                      <span className="text-[10px] text-espresso-faint font-mono bg-white/50 px-1.5 py-0.5 rounded">
                        {sections.find((s) => s.key === note.section)?.label || note.section}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        note.type === 'info' ? 'bg-gold-faint text-gold' :
                        note.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red'
                      }`}>
                        {noteTypes.find((nt) => nt.key === note.type)?.label || note.type}
                      </span>
                    </div>
                    <p className="text-sm opacity-80">{note.content}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <button type="button"
                        onClick={() => handleToggleNote(note.id)}
                        className="toggle"
                        data-on={note.active ? 'true' : 'false'}
                        aria-label={note.active ? 'إيقاف الملاحظة' : 'تفعيل الملاحظة'}
                      />
                    </label>
                    <button type="button"
                      onClick={() => handleEdit(note.id)}
                      className="p-1.5 rounded-md text-espresso-faint hover:text-gold transition-colors"
                      title="تعديل"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      </svg>
                    </button>
                    <button type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-md text-espresso-faint hover:text-red transition-colors"
                      title="حذف"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
