interface TrustBadgeProps {
  icon: React.ReactNode
  title: string
  desc: string
}

export default function TrustBadge({ icon, title, desc }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gold-faint flex items-center justify-center text-gold flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="h4 text-espresso">{title}</p>
        <p className="caption">{desc}</p>
      </div>
    </div>
  )
}
