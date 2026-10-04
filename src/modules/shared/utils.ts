export const money = (value: number, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
export const currencySymbol = (currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(0).find(part => part.type === 'currency')?.value ?? currency
export const freshId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
export const todayDate = () => {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}
export const formatDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (date.getFullYear() !== new Date().getFullYear()) options.year = 'numeric'
  return new Intl.DateTimeFormat('en-US', options).format(date)
}
export const getStored = <T,>(key: string, fallback: T): T => {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) as T : fallback } catch { return fallback }
}
export const storeValue = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { return }
}
