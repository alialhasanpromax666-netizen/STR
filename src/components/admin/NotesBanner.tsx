import { useAdmin } from '../../store/AdminContext'
import type { NoteSection, NoteType } from '../../store/types'
import { InfoIcon, WarningIcon, MegaphoneIcon } from '../icons/Icons'
import type { IconProps } from '@phosphor-icons/react'

const noteIcons: Record<NoteType, React.ComponentType<IconProps>> = {
  info: InfoIcon,
  warning: WarningIcon,
  alert: MegaphoneIcon,
}

const noteStyles: Record<NoteType, string> = {
  info: 'bg-gold-subtle border-gold-light text-espresso',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  alert: 'bg-error-faint border-error text-error',
}

const noteIconColors: Record<NoteType, string> = {
  info: 'text-gold',
  warning: 'text-amber-600',
  alert: 'text-error',
}

export default function NotesBanner({ section }: { section: NoteSection }) {
  const { config } = useAdmin()
  const notes = config.notes.filter(
    (n) => n.active && (n.section === section || n.section === 'all')
  )
  if (notes.length === 0) return null
  return (
    <div className="space-y-3 mb-6">
      {notes.map((note) => {
        const Icon = noteIcons[note.type] || InfoIcon
        return (
          <div
            key={note.id}
            className={`flex items-start gap-3 p-4 rounded-xl border ${noteStyles[note.type] || noteStyles.info}`}
          >
            <div className={`shrink-0 mt-0.5 ${noteIconColors[note.type] || noteIconColors.info}`}>
              <Icon size={20} weight="fill" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-heading font-semibold">{note.title}</p>
              <p className="text-sm mt-0.5 opacity-80">{note.content}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
