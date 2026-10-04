import { useEffect, useMemo, useState } from 'react'
import { getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import {
  ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, Camera, Check, ChevronDown,
  CircleHelp, Coffee, ImagePlus, LogOut, MoreHorizontal, Plus, ReceiptText,
  Settings2, Sparkles, Users, Wallet, X,
} from 'lucide-react'

type Member = { name: string; email: string; initials: string; color: string }
type Group = { id: string; name: string; type: string; image?: string; color: string; members: Member[] }
type SplitType = 'Equal' | 'Exact amounts' | 'Percentages' | 'Shares' | 'Adjusted'
type Expense = {
  id: string; groupId: string; title: string; amount: number; date: string; payer: string
  category: string; note: string; receipt?: string; splitType: SplitType; allocations: Record<string, number>
}
type Tab = 'home' | 'activity' | 'you'
type Modal = 'group' | 'expense' | 'detail' | 'settings' | null

const palette = ['#e7ad63', '#77a99b', '#cb8171', '#8593bc', '#c5a85d', '#a68ca4']
const maya: Member = { name: 'Maya Chen', email: 'maya@example.com', initials: 'MC', color: '#c97a63' }
const seedGroups: Group[] = [
  { id: 'italy', name: 'Italy, at last', type: 'Big trip', color: '#d7a15d', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=85', members: [maya, { name: 'Leo Park', email: 'leo@example.com', initials: 'LP', color: '#759e91' }, { name: 'Nina Flores', email: 'nina@example.com', initials: 'NF', color: '#a68ca4' }, { name: 'Sam Reed', email: 'sam@example.com', initials: 'SR', color: '#6887aa' }] },
  { id: 'apartment', name: 'Apartment 4B', type: 'Home', color: '#769d91', members: [maya, { name: 'Leo Park', email: 'leo@example.com', initials: 'LP', color: '#759e91' }, { name: 'Nina Flores', email: 'nina@example.com', initials: 'NF', color: '#a68ca4' }] },
  { id: 'weekend', name: 'Little lake weekend', type: 'Getaway', color: '#7b8baf', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85', members: [maya, { name: 'Sam Reed', email: 'sam@example.com', initials: 'SR', color: '#6887aa' }, { name: 'Ava Patel', email: 'ava@example.com', initials: 'AP', color: '#d29c57' }] },
]
const seedExpenses: Expense[] = [
  { id: 'e1', groupId: 'italy', title: 'Dinner at Trattoria', amount: 186.4, date: 'Today', payer: 'Maya Chen', category: 'Food & drink', note: 'The place by the little square', splitType: 'Equal', allocations: {} },
  { id: 'e2', groupId: 'apartment', title: 'Monthly groceries', amount: 74.82, date: 'Yesterday', payer: 'Leo Park', category: 'Groceries', note: '', splitType: 'Equal', allocations: {} },
  { id: 'e3', groupId: 'italy', title: 'Train to Florence', amount: 92, date: 'May 18', payer: 'Nina Flores', category: 'Transport', note: '', splitType: 'Equal', allocations: {} },
]
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
const freshId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const getStored = <T,>(key: string, fallback: T): T => {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) as T : fallback } catch { return fallback }
}

function App() {
  const [groups, setGroups] = useState<Group[]>(() => getStored('tandem-groups', seedGroups))
  const [expenses, setExpenses] = useState<Expense[]>(() => getStored('tandem-expenses', seedExpenses))
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [modal, setModal] = useState<Modal>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [search, setSearch] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => { localStorage.setItem('tandem-groups', JSON.stringify(groups)) }, [groups])
  useEffect(() => { localStorage.setItem('tandem-expenses', JSON.stringify(expenses)) }, [expenses])
  useEffect(() => { if (notice) { const timer = window.setTimeout(() => setNotice(''), 2800); return () => window.clearTimeout(timer) } }, [notice])

  const totalOwed = 48.2
  const totalOwing = 132.75
  const visibleGroups = groups.filter(group => group.name.toLowerCase().includes(search.toLowerCase()))
  const activeGroup = groups.find(group => group.id === selectedGroup) ?? groups[0]
  const activeExpense = expenses.find(expense => expense.id === selectedExpense) ?? null
  const groupExpenses = (groupId: string) => expenses.filter(expense => expense.groupId === groupId)

  const signIn = async () => {
    const env = import.meta.env
    if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_AUTH_DOMAIN || !env.VITE_FIREBASE_PROJECT_ID || !env.VITE_FIREBASE_APP_ID) {
      setNotice('Add Firebase credentials in .env to enable Google sign-in')
      return
    }
    try {
      const app = getApps().length ? getApps()[0] : initializeApp({
        apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID, appId: env.VITE_FIREBASE_APP_ID,
      })
      const result = await signInWithPopup(getAuth(app), new GoogleAuthProvider())
      setSignedIn(true)
      setNotice(`Signed in as ${result.user.displayName ?? result.user.email}`)
    } catch { setNotice('Google sign-in was cancelled or could not connect') }
  }

  const openGroup = (group: Group) => { setSelectedGroup(group.id); setModal('detail') }
  const openGroupEditor = (group?: Group) => { setEditingGroup(group ?? null); setModal('group') }
  const openExpenseEditor = (groupId?: string) => { setSelectedGroup(groupId ?? selectedGroup ?? groups[0]?.id ?? null); setModal('expense') }
  const saveGroup = (group: Group) => {
    setGroups(current => editingGroup ? current.map(item => item.id === group.id ? group : item) : [...current, group])
    setModal(null); setNotice(editingGroup ? 'Group updated' : 'Your new group is ready')
  }
  const saveExpense = (expense: Expense) => {
    setExpenses(current => [expense, ...current]); setModal(null); setNotice('Expense added')
  }
  const moveExpense = (expenseId: string, groupId: string) => {
    setExpenses(current => current.map(item => item.id === expenseId ? { ...item, groupId } : item))
    setSelectedGroup(groupId); setNotice('Expense moved to another group')
  }

  return (
    <main className="app-shell">
      <div className="phone-frame">
        <header className="topbar">
          <button className="brand" onClick={() => { setActiveTab('home'); setModal(null) }} aria-label="Tandem home"><span className="brand-mark">t</span><span>tandem</span></button>
          <div className="top-actions">
            <button className="icon-button help-button" aria-label="Help" onClick={() => setNotice('A little help goes a long way')}><CircleHelp size={20} /></button>
            <button className="profile-avatar" aria-label="Sign in with Google" onClick={signIn}>{signedIn ? 'MC' : <span>G</span>}</button>
          </div>
        </header>

        {activeTab === 'home' && <>
          <section className="welcome-row"><div><p className="eyebrow">SUNDAY, OCTOBER 4</p><h1>Good afternoon,<br /><em>Maya.</em></h1></div><button className="round-add" aria-label="Add expense" onClick={() => openExpenseEditor()}><Plus size={23} /></button></section>
          <section className="balance-panel">
            <div className="balance-top"><span className="balance-label">YOUR BALANCE</span><button className="plain-icon" onClick={() => setModal('settings')} aria-label="Balance settings"><MoreHorizontal size={21} /></button></div>
            <div className="balance-total">{money(totalOwing - totalOwed)}</div>
            <div className="balance-breakdown"><span><ArrowDownLeft size={15} /> You are owed <b>{money(totalOwing)}</b></span><span><ArrowUpRight size={15} /> You owe <b>{money(totalOwed)}</b></span></div>
            <div className="balance-rule"><i /></div>
          </section>
          <section className="section-block group-section">
            <div className="section-heading"><div><p className="eyebrow">YOUR PEOPLE</p><h2>Groups <span className="count-pill">{groups.length}</span></h2></div><button className="text-action" onClick={() => openGroupEditor()}><Plus size={16} /> New group</button></div>
            <label className="search-wrap"><span className="search-glyph">⌕</span><input aria-label="Search groups" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a group" /><kbd>⌘ K</kbd></label>
            <div className="group-list">{visibleGroups.map((group, index) => <button className="group-row" key={group.id} onClick={() => openGroup(group)}>
              <span className="group-thumb" style={{ backgroundColor: group.color, backgroundImage: group.image ? `url(${group.image})` : undefined }}><span className="thumb-sheen" /></span>
              <span className="group-copy"><span className="group-name">{group.name}</span><span className="group-meta">{group.type} <i /> {group.members.length} people</span></span>
              <span className="avatar-stack">{group.members.slice(0, 3).map(person => <i key={person.email} style={{ backgroundColor: person.color }}>{person.initials.slice(0, 1)}</i>)}{group.members.length > 3 && <i className="avatar-more">+{group.members.length - 3}</i>}</span><ChevronDown className="row-chevron" size={15} />
              {index === 0 && <span className="group-accent" />}
            </button>)}</div>
          </section>
          <section className="section-block recent-section">
            <div className="section-heading"><div><p className="eyebrow">THE LATEST</p><h2>Recent activity</h2></div><button className="see-all" onClick={() => setActiveTab('activity')}>See all <ArrowRight size={14} /></button></div>
            <ExpenseList expenses={expenses.slice(0, 3)} groups={groups} onSelect={expense => { setSelectedExpense(expense.id); setModal('detail') }} />
          </section>
        </>}

        {activeTab === 'activity' && <section className="page-content"><p className="eyebrow">THE PAPER TRAIL</p><h1 className="page-title">All activity<span>.</span></h1><p className="page-subtitle">Every shared moment, accounted for.</p><ExpenseList expenses={expenses} groups={groups} onSelect={expense => { setSelectedExpense(expense.id); setModal('detail') }} emptyText="No expenses just yet." /></section>}
        {activeTab === 'you' && <section className="page-content profile-page"><p className="eyebrow">YOUR CORNER</p><h1 className="page-title">A little about<br /><em>you.</em></h1><div className="profile-card"><div className="large-avatar">MC</div><div><h2>{signedIn ? 'Maya Chen' : 'Maya Chen'}</h2><span>{signedIn ? 'Google account connected' : 'maya@example.com'}</span></div><button className="plain-icon" onClick={() => setModal('settings')} aria-label="Settings"><Settings2 size={20} /></button></div><button className="account-action" onClick={signIn}><span className="google-g">G</span><span>{signedIn ? 'Google account connected' : 'Continue with Google'}</span><ArrowRight size={17} /></button><button className="account-action" onClick={() => setModal('settings')}><Wallet size={18} /><span>Payment and preferences</span><ArrowRight size={17} /></button><p className="profile-footnote">Good things are better shared.</p></section>}

        <nav className="bottom-nav" aria-label="Main navigation">
          <button className={activeTab === 'home' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('home')}><span className="nav-icon"><Wallet size={20} /></span><span>Home</span></button>
          <button className={activeTab === 'activity' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('activity')}><span className="nav-icon"><ReceiptText size={20} /></span><span>Activity</span></button>
          <button className="nav-add" aria-label="Add expense" onClick={() => openExpenseEditor()}><Plus size={25} /></button>
          <button className={activeTab === 'you' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('you')}><span className="nav-icon"><span className="nav-you">M</span></span><span>You</span></button>
          <button className="nav-item" onClick={() => { setActiveTab('home'); openGroupEditor() }}><span className="nav-icon"><Users size={20} /></span><span>Groups</span></button>
        </nav>

        {modal === 'group' && <GroupModal group={editingGroup} onClose={() => setModal(null)} onSave={saveGroup} />}
        {modal === 'expense' && <ExpenseModal groups={groups} initialGroupId={selectedGroup} onClose={() => setModal(null)} onSave={saveExpense} />}
        {modal === 'detail' && activeExpense ? <ExpenseDetail expense={activeExpense} groups={groups} onClose={() => { setModal(null); setSelectedExpense(null) }} onMove={moveExpense} /> : modal === 'detail' && activeGroup ? <GroupDetail group={activeGroup} expenses={groupExpenses(activeGroup.id)} onClose={() => { setModal(null); setSelectedExpense(null) }} onEdit={() => openGroupEditor(activeGroup)} onAddExpense={() => openExpenseEditor(activeGroup.id)} onSelectExpense={expense => setSelectedExpense(expense.id)} /> : null}
        {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} onSignIn={signIn} signedIn={signedIn} />}
        {notice && <div className="toast" role="status"><Check size={16} />{notice}</div>}
      </div>
      <div className="desktop-note"><Sparkles size={15} /> Made for the little screen in your pocket</div>
    </main>
  )
}

function ExpenseList({ expenses, groups, onSelect, emptyText = 'No activity to show.' }: { expenses: Expense[]; groups: Group[]; onSelect: (expense: Expense) => void; emptyText?: string }) {
  if (!expenses.length) return <div className="empty-state"><Coffee size={21} /><span>{emptyText}</span></div>
  return <div className="expense-list">{expenses.map(expense => {
    const group = groups.find(item => item.id === expense.groupId)
    return <button className="expense-row" key={expense.id} onClick={() => onSelect(expense)}><span className={`expense-icon ${expense.category.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')}`}><ReceiptText size={17} /></span><span className="expense-copy"><span className="expense-title">{expense.title}</span><span className="expense-meta">{group?.name ?? 'No group'} <i /> {expense.date}</span></span><span className="expense-amount"><b>{money(expense.amount)}</b><span>paid by {expense.payer.split(' ')[0]}</span></span><ArrowRight size={15} className="expense-arrow" /></button>
  })}</div>
}

function GroupModal({ group, onClose, onSave }: { group: Group | null; onClose: () => void; onSave: (group: Group) => void }) {
  const [name, setName] = useState(group?.name ?? '')
  const [type, setType] = useState(group?.type ?? 'Trip')
  const [emailInput, setEmailInput] = useState('')
  const [members, setMembers] = useState(group?.members ?? [maya])
  const [image, setImage] = useState(group?.image ?? '')
  const [color, setColor] = useState(group?.color ?? palette[1])
  const addEmails = () => {
    const emails = emailInput.split(/[\s,;]+/).map(value => value.trim().toLowerCase()).filter(value => value.includes('@'))
    setMembers(current => [...current, ...emails.filter(email => !current.some(person => person.email === email)).map((email, index) => {
      const namePart = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
      const initials = namePart.split(' ').map(part => part[0]).join('').slice(0, 2)
      return { name: namePart, email, initials, color: palette[(current.length + index) % palette.length] }
    })])
    setEmailInput('')
  }
  const readImage = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setImage(String(reader.result)); reader.readAsDataURL(file) }
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-sheet" onMouseDown={event => event.stopPropagation()}><div className="sheet-handle" /><div className="modal-heading"><div><p className="eyebrow">{group ? 'MAKE IT YOURS' : 'BETTER TOGETHER'}</p><h2>{group ? 'Edit your group' : 'A new group'}</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
    <form onSubmit={event => { event.preventDefault(); if (!name.trim()) return; onSave({ id: group?.id ?? freshId(), name: name.trim(), type, image: image || undefined, color, members }) }}>
      <label className="cover-upload" style={{ backgroundColor: color, backgroundImage: image ? `linear-gradient(#0002,#0002),url(${image})` : undefined }}><input type="file" accept="image/*" onChange={event => readImage(event.target.files?.[0])} /><span><ImagePlus size={19} /> {image ? 'Change cover photo' : 'Add a cover photo'}</span><Camera size={19} /></label>
      <div className="color-row">{palette.map(swatch => <button type="button" key={swatch} className={`color-swatch ${color === swatch ? 'chosen' : ''}`} style={{ backgroundColor: swatch }} onClick={() => setColor(swatch)} aria-label={`Choose color ${swatch}`} />)}</div>
      <label className="field-label">Group name<input required autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Weekend in the mountains" /></label>
      <label className="field-label">What's the occasion?<select value={type} onChange={event => setType(event.target.value)}>{['Trip', 'Big trip', 'Getaway', 'Home', 'Couple', 'Event', 'Other'].map(option => <option key={option}>{option}</option>)}</select></label>
      <label className="field-label">People <span className="soft-label">{members.length} in this group</span><div className="invite-input"><input value={emailInput} onChange={event => setEmailInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addEmails() } }} placeholder="Add by email address" type="text" /><button type="button" onClick={addEmails} aria-label="Add people"><Plus size={19} /></button></div></label>
      <div className="member-chips">{members.map(person => <span className="member-chip" key={person.email}><i style={{ backgroundColor: person.color }}>{person.initials.slice(0, 1)}</i>{person.name.split(' ')[0]}{person.email !== maya.email && <button type="button" onClick={() => setMembers(current => current.filter(item => item.email !== person.email))} aria-label={`Remove ${person.name}`}><X size={13} /></button>}</span>)}</div>
      <button className="primary-button" type="submit">{group ? 'Save changes' : 'Create group'} <ArrowRight size={17} /></button>
    </form>
  </section></div>
}

function ExpenseModal({ groups, initialGroupId, onClose, onSave }: { groups: Group[]; initialGroupId: string | null; onClose: () => void; onSave: (expense: Expense) => void }) {
  const group = groups.find(item => item.id === initialGroupId) ?? groups[0]
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [groupId, setGroupId] = useState(group?.id ?? '')
  const currentGroup = groups.find(item => item.id === groupId) ?? group
  const [payer, setPayer] = useState(maya.name)
  const [splitType, setSplitType] = useState<SplitType>('Equal')
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState('')
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const numericAmount = Number(amount) || 0
  const people = currentGroup?.members ?? [maya]
  const splitOptions: SplitType[] = ['Equal', 'Exact amounts', 'Percentages', 'Shares', 'Adjusted']
  const totalEntry = useMemo(() => Object.values(allocations).reduce((sum, value) => sum + (Number(value) || 0), 0), [allocations])
  const splitIsValid = splitType === 'Equal' || splitType === 'Shares' ||
    (splitType === 'Percentages' ? Math.abs(totalEntry - 100) < 0.01 : Math.abs(totalEntry - numericAmount) < 0.01)
  const readReceipt = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setReceipt(String(reader.result)); reader.readAsDataURL(file) }
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim() || numericAmount <= 0 || !currentGroup || !splitIsValid) return
    const computed: Record<string, number> = {}
    if (splitType === 'Equal') people.forEach(person => { computed[person.email] = numericAmount / people.length })
    else if (splitType === 'Percentages') people.forEach(person => { computed[person.email] = numericAmount * (Number(allocations[person.email]) || 0) / 100 })
    else if (splitType === 'Shares') { const enteredShares = people.reduce((sum, person) => sum + (Number(allocations[person.email]) || 0), 0); people.forEach(person => { computed[person.email] = enteredShares ? numericAmount * (Number(allocations[person.email]) || 0) / enteredShares : numericAmount / people.length }) }
    else people.forEach(person => { computed[person.email] = Number(allocations[person.email]) || 0 })
    onSave({ id: freshId(), groupId, title: title.trim(), amount: numericAmount, date: 'Today', payer, category: 'Other', note, receipt: receipt || undefined, splitType, allocations: computed })
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-sheet tall-sheet" onMouseDown={event => event.stopPropagation()}><div className="sheet-handle" /><div className="modal-heading"><div><p className="eyebrow">MAKE IT COUNT</p><h2>Add an expense</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
    <form onSubmit={submit}>
      <label className="field-label">What was it for?<input autoFocus required value={title} onChange={event => setTitle(event.target.value)} placeholder="Dinner, train tickets..." /></label>
      <label className="field-label amount-label">Amount<span className="amount-input"><span>$</span><input required min="0.01" step="0.01" type="number" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0.00" /></span></label>
      <div className="two-fields"><label className="field-label">In group<select value={groupId} onChange={event => setGroupId(event.target.value)}>{groups.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="field-label">Paid by<select value={payer} onChange={event => setPayer(event.target.value)}>{people.map(person => <option key={person.email}>{person.name}</option>)}</select></label></div>
      <div className="split-header"><span className="field-label">Split it</span><span className="soft-label">{people.length} people</span></div><div className="split-options">{splitOptions.map(option => <button key={option} type="button" className={splitType === option ? 'split-option selected' : 'split-option'} onClick={() => { setSplitType(option); setAllocations({}) }}>{option}</button>)}</div>
      {splitType !== 'Equal' && <div className="allocations">{people.map(person => <label key={person.email} className="allocation-row"><i style={{ backgroundColor: person.color }}>{person.initials.slice(0, 1)}</i><span>{person.name.split(' ')[0]}{person.name === payer ? <small> · paid</small> : ''}</span><span className="allocation-input"><input type="number" min="0" step={splitType === 'Percentages' ? '1' : '0.01'} placeholder={splitType === 'Shares' ? '1' : splitType === 'Percentages' ? '0' : '0.00'} value={allocations[person.email] ?? ''} onChange={event => setAllocations(current => ({ ...current, [person.email]: event.target.value }))} />{splitType === 'Percentages' ? '%' : splitType === 'Shares' ? 'shares' : '$'}</span></label>)}<div className="allocation-total"><span>{splitType === 'Percentages' ? 'Total percentage' : splitType === 'Shares' ? 'Total shares' : 'Amount assigned'}</span><b>{splitType === 'Percentages' ? `${totalEntry}%` : splitType === 'Shares' ? totalEntry || people.length : money(totalEntry)}</b></div>{(splitType === 'Exact amounts' || splitType === 'Adjusted') && totalEntry > 0 && Math.abs(totalEntry - numericAmount) > 0.01 && <p className="validation-note">Assigned amounts should add up to {money(numericAmount)}.</p>}</div>}
      <label className="field-label">A note <span className="soft-label">Optional</span><textarea rows={2} value={note} onChange={event => setNote(event.target.value)} placeholder="Add a detail everyone will remember" /></label>
      <label className={`receipt-upload ${receipt ? 'has-receipt' : ''}`}><input type="file" accept="image/*" onChange={event => readReceipt(event.target.files?.[0])} />{receipt ? <><img src={receipt} alt="Receipt preview" /><span>Receipt attached · tap to change</span><Check size={17} /></> : <><Camera size={19} /><span>Add a receipt photo</span><Plus size={17} /></>}</label>
      <button className="primary-button" type="submit" disabled={!groups.length || !splitIsValid}>Add to {currentGroup?.name ?? 'group'} <ArrowRight size={17} /></button>
    </form>
  </section></div>
}

function GroupDetail({ group, expenses, onClose, onEdit, onAddExpense, onSelectExpense }: { group: Group; expenses: Expense[]; onClose: () => void; onEdit: () => void; onAddExpense: () => void; onSelectExpense: (expense: Expense) => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-sheet detail-sheet" onMouseDown={event => event.stopPropagation()}><div className="sheet-handle" /><div className="group-hero" style={{ backgroundColor: group.color, backgroundImage: group.image ? `linear-gradient(0deg,#173b397a,#173b3905),url(${group.image})` : undefined }}><button className="hero-back" onClick={onClose} aria-label="Back"><ArrowLeft size={19} /></button><button className="hero-edit" onClick={onEdit} aria-label="Edit group"><Settings2 size={18} /></button><div><span className="hero-type">{group.type}</span><h2>{group.name}</h2><span className="hero-members"><Users size={15} /> {group.members.length} people</span></div></div><div className="detail-actions"><button className="primary-button" onClick={onAddExpense}><Plus size={18} /> Add an expense</button><button className="invite-action" onClick={onEdit}><Users size={17} /><span>Add people</span><ArrowRight size={16} /></button></div><div className="detail-list-heading"><div><p className="eyebrow">THE GROUP TAB</p><h3>Expenses</h3></div><span>{expenses.length} total</span></div><ExpenseList expenses={expenses} groups={[group]} onSelect={onSelectExpense} emptyText="No expenses in this group yet." /></section></div>
}

function ExpenseDetail({ expense, groups, onClose, onMove }: { expense: Expense; groups: Group[]; onClose: () => void; onMove: (expenseId: string, groupId: string) => void }) {
  const group = groups.find(item => item.id === expense.groupId)
  const [moveOpen, setMoveOpen] = useState(false)
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-sheet expense-detail-sheet" onMouseDown={event => event.stopPropagation()}><div className="sheet-handle" /><div className="modal-heading"><div><p className="eyebrow">{group?.name ?? 'SHARED EXPENSE'}</p><h2>{expense.title}</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div><div className="detail-amount">{money(expense.amount)}<span>{expense.date}</span></div><div className="paid-line"><span className="paid-avatar">{expense.payer.split(' ').map(word => word[0]).join('')}</span><span><b>{expense.payer}</b> paid the whole thing</span></div><div className="split-summary"><div className="split-summary-head"><span>Split · {expense.splitType}</span><span>{Object.keys(expense.allocations).length || group?.members.length || 0} people</span></div>{group?.members.map(person => <div className="split-person" key={person.email}><i style={{ backgroundColor: person.color }}>{person.initials.slice(0, 1)}</i><span>{person.name}</span><b>{money(expense.allocations[person.email] ?? expense.amount / Math.max(1, group.members.length))}</b></div>)}</div>{expense.note && <div className="note-card"><span className="eyebrow">A LITTLE NOTE</span><p>{expense.note}</p></div>}{expense.receipt && <div className="receipt-preview"><img src={expense.receipt} alt="Attached receipt" /><span>Receipt photo</span></div>}<button className="move-button" onClick={() => setMoveOpen(value => !value)}><ArrowRight size={17} /><span>Move to another group</span><ChevronDown size={16} /></button>{moveOpen && <div className="move-list">{groups.filter(item => item.id !== expense.groupId).map(item => <button key={item.id} onClick={() => onMove(expense.id, item.id)}><span className="move-dot" style={{ backgroundColor: item.color }} />{item.name}<ArrowRight size={15} /></button>)}</div>}</section></div>
}

function SettingsModal({ onClose, onSignIn, signedIn }: { onClose: () => void; onSignIn: () => void; signedIn: boolean }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-sheet settings-sheet" onMouseDown={event => event.stopPropagation()}><div className="sheet-handle" /><div className="modal-heading"><div><p className="eyebrow">YOUR PREFERENCES</p><h2>Settings</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div><div className="settings-profile"><div className="large-avatar">MC</div><div><b>Maya Chen</b><span>maya@example.com</span></div></div><button className="settings-row" onClick={onSignIn}><span className="google-g">G</span><span>{signedIn ? 'Google account connected' : 'Connect Google account'}</span><ArrowRight size={17} /></button><div className="settings-row static"><Wallet size={18} /><span>Currency</span><b>USD $</b></div><div className="settings-row static"><LogOut size={18} /><span>Local demo mode</span><b>On</b></div><p className="settings-note">Your demo groups and expenses are saved on this device.</p></section></div>
}

export default App
