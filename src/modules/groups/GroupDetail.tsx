import { ArrowLeft, ArrowRight, Plus, Settings2, Users } from 'lucide-react'
import type { Expense, Group } from '../shared/models'
import { ExpenseList } from '../expenses/ExpenseList'
import { formatDate } from '../shared/utils'

type Props = { group: Group; expenses: Expense[]; currency: string; onClose: () => void; onEdit: () => void; onAddExpense: () => void; onSelectExpense: (expense: Expense) => void }

export function GroupDetail({ group, expenses, currency, onClose, onEdit, onAddExpense, onSelectExpense }: Props) {
  const dateRange = [group.startDate, group.endDate].filter((date): date is string => Boolean(date)).map(formatDate).join(' - ')
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-sheet detail-sheet" onMouseDown={event => event.stopPropagation()}><div className="sheet-handle" /><div className="group-hero" style={{ backgroundColor: group.color, backgroundImage: group.image ? `linear-gradient(0deg,#173b397a,#173b3905),url(${group.image})` : undefined }}><button className="hero-back" onClick={onClose} aria-label="Back"><ArrowLeft size={19} /></button><button className="hero-edit" onClick={onEdit} aria-label="Edit group"><Settings2 size={18} /></button><div><span className="hero-type">{group.type}</span><h2>{group.name}</h2><span className="hero-members"><Users size={15} /> {group.members.length} people</span>{dateRange && <span className="hero-dates">{dateRange}</span>}</div></div><div className="detail-actions"><button className="primary-button" onClick={onAddExpense}><Plus size={18} /> Add an expense</button><button className="invite-action" onClick={onEdit}><Users size={17} /><span>Add people</span><ArrowRight size={16} /></button></div><div className="detail-list-heading"><div><p className="eyebrow">THE GROUP TAB</p><h3>Expenses</h3></div><span>{expenses.length} total</span></div><ExpenseList expenses={expenses} groups={[group]} currency={currency} onSelect={onSelectExpense} emptyText="No expenses in this group yet." /></section></div>
}
