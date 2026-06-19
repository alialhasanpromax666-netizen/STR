import { useEffect, useState } from 'react'

interface CountUpProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  decimals?: number
  locale?: string
}

export default function CountUp({
  end, duration = 1500, prefix = '', suffix = '',
  className = '', decimals = 0, locale = 'en-US',
}: CountUpProps) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let frameId: number

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(eased * end)
      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [end, duration])

  const display = value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  )
}
