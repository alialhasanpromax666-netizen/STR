export function fmt(num: number): string {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtCrypto(num: number): string {
  if (num < 0.01) return num.toFixed(8)
  if (num < 1) return num.toFixed(6)
  return num.toFixed(4)
}
