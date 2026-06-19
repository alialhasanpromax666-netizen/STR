export default function GoldLogo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl'
  const barWidth = size === 'sm' ? 'w-6' : size === 'lg' ? 'w-16' : 'w-10'
  return (
    <div className={`flex flex-col items-center gap-0.5 ${className}`}>
      <span className={`${sizeClasses} font-display font-bold gold-text tracking-wider`}>
        STR
      </span>
      <div className={`${barWidth} h-0.5 bg-gold rounded-full`} />
    </div>
  )
}
