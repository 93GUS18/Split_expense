export type Member = { id: string; name: string; email?: string; initials: string; color: string }
export type Group = { id: string; name: string; type: string; image?: string; color: string; startDate?: string; endDate?: string; settled?: Record<string, number>; members: Member[] }
export type SplitType = 'Equal' | 'Exact amounts' | 'Percentages' | 'Shares' | 'Adjusted'
export type Expense = {
  id: string; groupId: string; title: string; amount: number; date: string; payer: string
  category: string; note: string; receipt?: string; splitType: SplitType; allocations: Record<string, number>
}
export type DriveData = { version: 1; savedAt: string; groups: Group[]; expenses: Expense[]; currency: string }
export type DriveConnection = { token: string; folderId: string; fileId: string | null }
export type Tab = 'home' | 'activity' | 'groups' | 'people'
export type AppMode = 'demo' | 'user'
export type ThemeMode = 'light' | 'dark'
export type Modal = 'group' | 'expense' | 'detail' | 'settings' | null
