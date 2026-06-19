import { useState, useEffect } from 'react'
import { CRYPTOS } from '../../store/types'

const CACHE_KEY = 'str-crypto-prices'
const CACHE_TTL = 60_000

export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  priceUSD: number
  priceSYP: number
}

export function useCryptoPrices(usdtRate: number) {
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchPrices = async () => {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_TTL) {
            if (mounted) {
              setPrices(data)
              setLastUpdated(new Date(timestamp))
              setLoading(false)
            }
            return
          }
        }

        const ids = CRYPTOS.map((c) => c.coingeckoId).join(',')
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        )
        const json = await res.json()

        const mapped: CryptoPrice[] = CRYPTOS.map((c) => {
          const priceUSD = json[c.coingeckoId]?.usd ?? 0
          return {
            id: c.id,
            symbol: c.symbol,
            name: c.name,
            priceUSD,
            priceSYP: priceUSD * usdtRate,
          }
        })

        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: mapped, timestamp: Date.now() })
        )

        if (mounted) {
          setPrices(mapped)
          setLastUpdated(new Date())
          setLoading(false)
        }
      } catch {
        if (mounted) setLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, CACHE_TTL)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [usdtRate])

  return { prices, loading, lastUpdated }
}
