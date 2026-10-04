import { ArrowRight, Coffee, ReceiptText } from 'lucide-react'
import type { Expense, Group } from '../shared/models'
import { formatDate, money } from '../shared/utils'

export function ExpenseList({ expenses, groups, currency, onSelect, emptyText = 'No activity to show.' }: { expenses: Expense[]; groups: Group[]; currency: string; onSelect: (expense: Expense) => void; emptyText?: string }) {
  if (!expenses.length) return <div className="empty-state"><Coffee size={21} /><span>{emptyText}</span></div>
  return <div className="expense-list">{expenses.map(expense => {
    const group = groups.find(item => item.id === expense.groupId)
    return <button className="expense-row" key={expense.id} onClick={() => onSelect(expense)}><span className={`expense-icon ${expense.category.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')}`}><ReceiptText size={17} /></span><span className="expense-copy"><span className="expense-title">{expense.title}</span><span className="expense-meta">{group?.name ?? 'No group'} <i /> {formatDate(expense.date)}</span></span><span className="expense-amount"><b>{money(expense.amount, currency)}</b><span>paid by {expense.payer.split(' ')[0]}</span></span><ArrowRight size={15} className="expense-arrow" /></button>
  })}</div>
}
