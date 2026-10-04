import { useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, Camera, Check, Plus, X } from 'lucide-react'
import type { Expense, Group, Member, SplitType } from '../shared/models'
import { maya } from '../shared/data'
import { currencySymbol, freshId, money, todayDate } from '../shared/utils'

type Props = { groups: Group[]; initialGroupId: string | null; currentMember: Member; currency: string; onClose: () => void; onSave: (expense: Expense) => void }

export function ExpenseModal({ groups, initialGroupId, currentMember, currency, onClose, onSave }: Props) {
  const group = groups.find(item => item.id === initialGroupId) ?? groups[0]
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(todayDate)
  const [groupId, setGroupId] = useState(group?.id ?? '')
  const currentGroup = groups.find(item => item.id === groupId) ?? group
  const [payer, setPayer] = useState(currentMember.name)
  const [splitType, setSplitType] = useState<SplitType>('Equal')
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState('')
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const numericAmount = Number(amount) || 0
  const people = currentGroup?.members ?? [maya]
  const selectedPayer = people.some(person => person.name === payer) ? payer : (people.find(person => person.id === currentMember.id) ?? people[0])?.name ?? currentMember.name
  const splitOptions: SplitType[] = ['Equal', 'Exact amounts', 'Percentages', 'Shares', 'Adjusted']
  const totalEntry = useMemo(() => Object.values(allocations).reduce((sum, value) => sum + (Number(value) || 0), 0), [allocations])
  const splitIsValid = splitType === 'Equal' || splitType === 'Shares' ||
    (splitType === 'Percentages' ? Math.abs(totalEntry - 100) < 0.01 : Math.abs(totalEntry - numericAmount) < 0.01)
  const readReceipt = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setReceipt(String(reader.result)); reader.readAsDataURL(file) }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || numericAmount <= 0 || !currentGroup || !splitIsValid) return
    const computed: Record<string, number> = {}
    if (splitType === 'Equal') people.forEach(person => { computed[person.id] = numericAmount / people.length })
    else if (splitType === 'Percentages') people.forEach(person => { computed[person.id] = numericAmount * (Number(allocations[person.id]) || 0) / 100 })
    else if (splitType === 'Shares') { const enteredShares = people.reduce((sum, person) => sum + (Number(allocations[person.id]) || 0), 0); people.forEach(person => { computed[person.id] = enteredShares ? numericAmount * (Number(allocations[person.id]) || 0) / enteredShares : numericAmount / people.length }) }
    else people.forEach(person => { computed[person.id] = Number(allocations[person.id]) || 0 })
    onSave({ id: freshId(), groupId, title: title.trim(), amount: numericAmount, date: expenseDate, payer: selectedPayer, category: 'Other', note, receipt: receipt || undefined, splitType, allocations: computed })
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-sheet tall-sheet" onMouseDown={event => event.stopPropagation()}><div className="sheet-handle" /><div className="modal-heading"><div><p className="eyebrow">MAKE IT COUNT</p><h2>Add an expense</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
    <form onSubmit={submit}>
      <label className="field-label">What was it for?<input autoFocus required value={title} onChange={event => setTitle(event.target.value)} placeholder="Dinner, train tickets..." /></label>
      <label className="field-label amount-label">Amount<span className="amount-input"><span>{currencySymbol(currency)}</span><input required min="0.01" step="0.01" type="number" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0.00" /></span></label>
      <label className="field-label">Date<input required type="date" max={todayDate()} value={expenseDate} onChange={event => setExpenseDate(event.target.value)} /></label>
      <div className="two-fields"><label className="field-label">In group<select value={groupId} onChange={event => setGroupId(event.target.value)}>{groups.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="field-label">Paid by<select value={selectedPayer} onChange={event => setPayer(event.target.value)}>{people.map(person => <option key={person.id}>{person.name}</option>)}</select></label></div>
      <div className="split-header"><span className="field-label">Split it</span><span className="soft-label">{people.length} people</span></div><div className="split-options">{splitOptions.map(option => <button key={option} type="button" className={splitType === option ? 'split-option selected' : 'split-option'} onClick={() => { setSplitType(option); setAllocations({}) }}>{option}</button>)}</div>
      {splitType !== 'Equal' && <div className="allocations">{people.map(person => <label key={person.id} className="allocation-row"><i style={{ backgroundColor: person.color }}>{person.initials.slice(0, 1)}</i><span>{person.name.split(' ')[0]}{person.name === payer ? <small> · paid</small> : ''}</span><span className="allocation-input"><input type="number" min="0" step={splitType === 'Percentages' ? '1' : '0.01'} placeholder={splitType === 'Shares' ? '1' : splitType === 'Percentages' ? '0' : '0.00'} value={allocations[person.id] ?? ''} onChange={event => setAllocations(current => ({ ...current, [person.id]: event.target.value }))} />{splitType === 'Percentages' ? '%' : splitType === 'Shares' ? 'shares' : currencySymbol(currency)}</span></label>)}<div className="allocation-total"><span>{splitType === 'Percentages' ? 'Total percentage' : splitType === 'Shares' ? 'Total shares' : 'Amount assigned'}</span><b>{splitType === 'Percentages' ? `${totalEntry}%` : splitType === 'Shares' ? totalEntry || people.length : money(totalEntry, currency)}</b></div>{(splitType === 'Exact amounts' || splitType === 'Adjusted') && totalEntry > 0 && Math.abs(totalEntry - numericAmount) > 0.01 && <p className="validation-note">Assigned amounts should add up to {money(numericAmount, currency)}.</p>}</div>}
      <label className="field-label">A note <span className="soft-label">Optional</span><textarea rows={2} value={note} onChange={event => setNote(event.target.value)} placeholder="Add a detail everyone will remember" /></label>
      <label className={`receipt-upload ${receipt ? 'has-receipt' : ''}`}><input type="file" accept="image/*" onChange={event => readReceipt(event.target.files?.[0])} />{receipt ? <><img src={receipt} alt="Receipt preview" /><span>Receipt attached · tap to change</span><Check size={17} /></> : <><Camera size={19} /><span>Add a receipt photo</span><Plus size={17} /></>}</label>
      <button className="primary-button" type="submit" disabled={!groups.length || !splitIsValid}>Add to {currentGroup?.name ?? 'group'} <ArrowRight size={17} /></button>
    </form>
  </section></div>
}
