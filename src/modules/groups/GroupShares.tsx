import { ArrowRight, Check, Users } from 'lucide-react'
import type { Expense, Group } from '../shared/models'
import { formatDate, money } from '../shared/utils'
import './groupShares.css'

export function getMemberShare(group: Group, expenses: Expense[], memberId: string) {
  const groupExpenses = expenses.filter(expense => expense.groupId === group.id)
  if (!group.members.length) return 0
  return groupExpenses.reduce((total, expense) => {
    const allocations = expense.allocations
    if (!Object.keys(allocations).length) return total + expense.amount / group.members.length
    const member = group.members.find(person => person.id === memberId)
    return total + (allocations[memberId] ?? (member?.email ? allocations[member.email] : undefined) ?? 0)
  }, 0)
}

type Props = {
  groups: Group[]
  expenses: Expense[]
  currency: string
  onSelectGroup: (group: Group) => void
  onSettle: (groupId: string, memberId: string) => void
}

export function GroupShares({ groups, expenses, currency, onSelectGroup, onSettle }: Props) {
  if (!groups.length) return <div className="empty-state"><Users size={21} /><span>No active groups yet.</span></div>
  return <div className="group-shares-list">{groups.map(group => {
    const groupExpenses = expenses.filter(expense => expense.groupId === group.id)
    const dateRange = [group.startDate, group.endDate].filter((date): date is string => Boolean(date)).map(formatDate).join(' - ')
    return <section className="group-share-section" key={group.id}>
      <div className="group-share-heading"><div><span className="group-share-type">{group.type}</span><h2>{group.name}</h2>{dateRange && <span className="group-share-dates">{dateRange}</span>}</div><button className="group-share-open" onClick={() => onSelectGroup(group)} aria-label={`Open ${group.name}`}><ArrowRight size={17} /></button></div>
      {!groupExpenses.length && <p className="group-share-empty">No transactions yet.</p>}<div className="member-share-list">{group.members.map(member => {
        const share = getMemberShare(group, expenses, member.id)
        const settled = group.settled?.[member.id] ?? 0
        const outstanding = Math.max(0, share - settled)
        return <div className="member-share-row" key={member.id}><i className="member-share-avatar" style={{ backgroundColor: member.color }}>{member.initials.slice(0, 1)}</i><span className="member-share-name">{member.name}</span><span className="member-share-amount">{money(share, currency)}</span><button className={outstanding > 0 ? 'settle-share' : 'settle-share settled'} type="button" disabled={outstanding <= 0} onClick={() => onSettle(group.id, member.id)}>{outstanding > 0 ? `Settle ${money(outstanding, currency)}` : share > 0 ? <><Check size={14} /> Settled</> : 'No dues'}</button></div>
      })}</div>
      <div className="group-share-footer"><span>{groupExpenses.length} {groupExpenses.length === 1 ? 'transaction' : 'transactions'}</span><span>Total {money(groupExpenses.reduce((sum, expense) => sum + expense.amount, 0), currency)}</span></div>
    </section>
  })}</div>
}
