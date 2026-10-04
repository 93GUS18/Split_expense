import { useEffect, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, type User } from 'firebase/auth'
import {
  ArrowRight, Check, CircleHelp, IndianRupee, Menu,
  ContactRound, Plus, ReceiptText, Sparkles, Users, Wallet,
} from 'lucide-react'
import { getConfiguredAuth, signInWithGoogle, signOutOfGoogle } from './modules/auth/firebaseAuth'
import { LoginPage } from './modules/auth/LoginPage'
import { ExpenseDetail as FeatureExpenseDetail } from './modules/expenses/ExpenseDetail'
import { ExpenseList as FeatureExpenseList } from './modules/expenses/ExpenseList'
import { ExpenseModal as FeatureExpenseModal } from './modules/expenses/ExpenseModal'
import { GroupDetail as FeatureGroupDetail } from './modules/groups/GroupDetail'
import { GroupList as FeatureGroupList } from './modules/groups/GroupList'
import { GroupModal as FeatureGroupModal } from './modules/groups/GroupModal'
import { GroupShares, getMemberShare } from './modules/groups/GroupShares'
import { PeopleList } from './modules/people/PeopleList'
import { SettingsModal as FeatureSettingsModal } from './modules/settings/SettingsModal'
import { currencies, maya, seedExpenses, seedGroups } from './modules/shared/data'
import { getDriveScope, getOrCreateDriveFolder, loadDriveData, saveDriveData } from './modules/storage/googleDrive'
import type { AppMode, DriveConnection as DriveFolderConnection, DriveData as DriveStoredData, Expense, Group, Member, Modal, Tab, ThemeMode } from './modules/shared/models'
import { getStored, money, storeValue, todayDate } from './modules/shared/utils'
import { normalizeExpenses, normalizeGroups } from './modules/shared/migrations'

function App() {
  const loadGroups = () => normalizeGroups(getStored('tandem-groups', seedGroups))
  const [groups, setGroups] = useState<Group[]>(loadGroups)
  const [expenses, setExpenses] = useState<Expense[]>(() => normalizeExpenses(getStored('tandem-expenses', seedExpenses), loadGroups()))
  const [appMode, setAppMode] = useState<AppMode>(() => getStored('tandem-mode', 'demo') === 'user' ? 'user' : 'demo')
  const [currency, setCurrency] = useState<string>(() => {
    const saved = getStored('tandem-currency', 'USD')
    return currencies.includes(saved) ? saved : 'USD'
  })
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getStored('tandem-theme-mode', 'light') === 'dark' ? 'dark' : 'light')
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [modal, setModal] = useState<Modal>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [search, setSearch] = useState('')
  const [activityGroupFilter, setActivityGroupFilter] = useState('all')
  const [activityPayerFilter, setActivityPayerFilter] = useState('all')
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all')
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [demoEntry, setDemoEntry] = useState(false)
  const [notice, setNotice] = useState('')
  const [driveConnection, setDriveConnection] = useState<DriveFolderConnection | null>(null)
  const [driveStatus, setDriveStatus] = useState('Google Drive folder not connected')

  useEffect(() => {
    const auth = getConfiguredAuth()
    if (!auth) {
      setAuthReady(true)
      return
    }
    return onAuthStateChanged(auth, nextUser => {
      setUser(nextUser)
      setAuthReady(true)
    })
  }, [])
  useEffect(() => { localStorage.setItem('tandem-groups', JSON.stringify(groups)) }, [groups])
  useEffect(() => { localStorage.setItem('tandem-expenses', JSON.stringify(expenses)) }, [expenses])
  useEffect(() => { storeValue('tandem-mode', appMode) }, [appMode])
  useEffect(() => { storeValue('tandem-currency', currency) }, [currency])
  useEffect(() => { storeValue('tandem-theme-mode', themeMode) }, [themeMode])
  useEffect(() => { if (notice) { const timer = window.setTimeout(() => setNotice(''), 2800); return () => window.clearTimeout(timer) } }, [notice])

  useEffect(() => {
    if (!driveConnection) return
    let active = true
    setDriveStatus('Syncing changes to Google Drive…')
    const timer = window.setTimeout(async () => {
      try {
        const data: DriveStoredData = { version: 1, savedAt: new Date().toISOString(), groups, expenses, currency }
        const fileId = await saveDriveData(driveConnection.token, driveConnection.folderId, driveConnection.fileId, data)
        if (!active) return
        if (fileId !== driveConnection.fileId) setDriveConnection(current => current ? { ...current, fileId } : null)
        setDriveStatus(`Synced to Tandem Expenses at ${new Date().toLocaleTimeString()}`)
      } catch (error) {
        if (!active) return
        const message = error instanceof Error ? error.message : 'Google Drive sync failed.'
        setDriveStatus(message)
        if (message.includes('expired') || message.includes('denied')) setDriveConnection(null)
      }
    }, 700)
    return () => { active = false; window.clearTimeout(timer) }
  }, [driveConnection, groups, expenses, currency])

  const activeGroups = groups.filter(group => !group.endDate || group.endDate >= todayDate())
  const visibleGroups = activeGroups.filter(group => group.name.toLowerCase().includes(search.toLowerCase()))
  const activeGroup = groups.find(group => group.id === selectedGroup) ?? groups[0]
  const activeExpense = expenses.find(expense => expense.id === selectedExpense) ?? null
  const groupExpenses = (groupId: string) => expenses.filter(expense => expense.groupId === groupId)
  const activityPayers = [...new Set(groups.flatMap(group => group.members.map(member => member.name)).concat(expenses.map(expense => expense.payer)))].sort()
  const activityCategories = [...new Set(expenses.map(expense => expense.category))].sort()
  const activityExpenses = expenses.filter(expense =>
    (activityGroupFilter === 'all' || expense.groupId === activityGroupFilter) &&
    (activityPayerFilter === 'all' || expense.payer === activityPayerFilter) &&
    (activityCategoryFilter === 'all' || expense.category === activityCategoryFilter),
  )
  const profileName = appMode === 'user' ? user?.displayName || user?.email?.split('@')[0] || 'Your account' : maya.name
  const profileInitials = profileName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
  const accountMember: Member = user ? { id: user.uid, name: user.displayName || user.email?.split('@')[0] || 'Your account', initials: (user.displayName || user.email?.split('@')[0] || 'U').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(), color: maya.color } : maya
  const currentMember: Member = appMode === 'user' ? accountMember : maya
  const updateAppMode = (mode: AppMode) => { storeValue('tandem-mode', mode); setAppMode(mode) }
  const updateCurrency = (value: string) => { storeValue('tandem-currency', value); setCurrency(value) }
  const updateThemeMode = (mode: ThemeMode) => { storeValue('tandem-theme-mode', mode); setThemeMode(mode) }

  useEffect(() => {
    if (!user) return
    const sourceMember = appMode === 'user' ? maya : accountMember
    const targetMember = appMode === 'user' ? accountMember : maya
    setGroups(current => current.map(group => ({
      ...group,
      members: group.members.map(member => member.id === sourceMember.id ? targetMember : member),
      settled: group.settled && Object.prototype.hasOwnProperty.call(group.settled, sourceMember.id)
        ? Object.fromEntries(Object.entries(group.settled).map(([memberId, amount]) => [memberId === sourceMember.id ? targetMember.id : memberId, amount]))
        : group.settled,
    })))
    setExpenses(current => current.map(expense => ({
      ...expense,
      payer: expense.payer === sourceMember.name ? targetMember.name : expense.payer,
      allocations: Object.fromEntries(Object.entries(expense.allocations).map(([memberId, amount]) => [memberId === sourceMember.id ? targetMember.id : memberId, amount])),
    })))
  }, [user, appMode])

  const signIn = async () => {
    try {
      const result = await signInWithGoogle()
      setUser(result.user)
      setDemoEntry(false)
      updateAppMode('user')
      setActiveTab('home')
      setModal(null)
      setNotice(`Signed in as ${result.user.displayName ?? result.user.email}`)
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Google sign-in was cancelled or could not connect') }
  }
  const logOut = async () => {
    try {
      await signOutOfGoogle()
      updateAppMode('demo')
      setDemoEntry(false)
      setDriveConnection(null)
      setDriveStatus('Google Drive folder not connected')
      setNotice('Signed out of Google')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not sign out') }
  }

  const openGroup = (group: Group) => { setSelectedGroup(group.id); setModal('detail') }
  const openGroupEditor = (group?: Group) => {
    if (!requireDriveStorage(group ? 'Editing a group' : 'Adding a group')) return
    setEditingGroup(group ?? null)
    setModal('group')
  }
  const openExpenseEditor = (groupId?: string) => {
    if (!requireDriveStorage('Adding an expense')) return
    let targetGroupId = groupId
    if (!targetGroupId) {
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())
      const monthlyGroup = activeGroups.find(group => group.name === monthName)
      if (monthlyGroup) targetGroupId = monthlyGroup.id
      else {
        const newGroup: Group = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: monthName, type: 'Monthly', color: currentMember.color, members: [currentMember] }
        setGroups(current => [newGroup, ...current])
        targetGroupId = newGroup.id
      }
    }
    setSelectedGroup(targetGroupId)
    setModal('expense')
  }
  const saveGroup = (group: Group) => {
    if (!requireDriveStorage('Saving a group')) return
    setGroups(current => editingGroup ? current.map(item => item.id === group.id ? group : item) : [...current, group])
    setModal(null); setNotice(editingGroup ? 'Group updated' : 'Your new group is ready')
  }
  const settleMemberShare = (groupId: string, memberId: string) => {
    if (!requireDriveStorage('Settling a share')) return
    const group = groups.find(item => item.id === groupId)
    if (!group) return
    const member = group.members.find(item => item.id === memberId)
    const outstanding = Math.max(0, getMemberShare(group, expenses, memberId) - (group.settled?.[memberId] ?? 0))
    if (!member || outstanding <= 0 || !window.confirm(`Mark ${member.name}'s ${money(outstanding, currency)} share as settled?`)) return
    setGroups(current => current.map(item => item.id === groupId ? {
      ...item,
      settled: { ...item.settled, [memberId]: (item.settled?.[memberId] ?? 0) + outstanding },
    } : item))
    setNotice(`${member.name}'s share settled`)
  }
  const saveExpense = (expense: Expense) => {
    if (!requireDriveStorage('Saving an expense')) return
    setExpenses(current => [expense, ...current]); setModal(null); setNotice('Expense added')
  }
  const moveExpense = (expenseId: string, groupId: string) => {
    if (!requireDriveStorage('Moving an expense')) return
    setExpenses(current => current.map(item => item.id === expenseId ? { ...item, groupId } : item))
    setSelectedGroup(groupId); setNotice('Expense moved to another group')
  }
  const deleteGroup = (groupId: string) => {
    if (!requireDriveStorage('Deleting a group')) return
    const group = groups.find(item => item.id === groupId)
    if (!group || !window.confirm(`Delete "${group.name}" and all its expenses? This cannot be undone.`)) return
    setGroups(current => current.filter(item => item.id !== groupId))
    setExpenses(current => current.filter(item => item.groupId !== groupId))
    setSelectedGroup(null)
    setSelectedExpense(null)
    setModal(null)
    setNotice('Group deleted')
  }
  const selectUserMode = () => {
    if (user) {
      updateAppMode('user')
      setNotice('User mode enabled')
    } else {
      updateAppMode('user')
      signIn()
    }
  }
  const requireDriveStorage = (action: string) => {
    if (driveConnection) return true
    setDriveStatus('Connect the Tandem Expenses folder before making changes')
    setModal('settings')
    setNotice(`${action} requires a connected Google Drive folder`)
    return false
  }
  const connectDriveFolder = async () => {
    setDriveStatus('Connecting to Google Drive…')
    try {
      const result = await signInWithGoogle(getDriveScope())
      const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken
      if (!token) throw new Error('Google Drive access was not granted. Approve file access and reconnect.')
      setUser(result.user)
      setDemoEntry(false)
      updateAppMode('user')
      const folderId = await getOrCreateDriveFolder(token)
      const stored = await loadDriveData(token, folderId)
      let fileId = stored.fileId
      if (stored.data) {
        if (stored.data.version !== 1 || !Array.isArray(stored.data.groups) || !Array.isArray(stored.data.expenses)) throw new Error('The Tandem Drive folder contains an unsupported data file.')
        const restoredGroups = normalizeGroups(stored.data.groups as Group[])
        setGroups(restoredGroups)
        setExpenses(normalizeExpenses(stored.data.expenses as Expense[], restoredGroups))
        if (stored.data.currency && currencies.includes(stored.data.currency)) updateCurrency(stored.data.currency)
      } else {
        fileId = await saveDriveData(token, folderId, null, { version: 1, savedAt: new Date().toISOString(), groups, expenses, currency })
      }
      setDriveConnection({ token, folderId, fileId })
      setDriveStatus('Connected to the Tandem Expenses folder')
      setNotice('Google Drive folder connected')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not connect Google Drive storage'
      setDriveStatus(message)
      setNotice(message)
    }
  }

  if (!authReady) return <LoginPage loading onSignIn={signIn} onDemo={() => setDemoEntry(true)} notice="" />
  if (!user && !demoEntry) return <LoginPage onSignIn={signIn} onDemo={() => { updateAppMode('demo'); setDemoEntry(true) }} notice={notice} />

  return (
    <main className="app-shell" data-theme={themeMode} data-theme-color="orange">
      <div className="phone-frame">
        <header className="topbar">
          <button className="brand" onClick={() => { setActiveTab('home'); setModal(null) }} aria-label="Tandem home"><span className="brand-mark"><IndianRupee size={15} strokeWidth={2.5} /></span><span>tandem</span></button>
          <div className="top-actions">
            <button className="icon-button help-button" aria-label="Help" onClick={() => setNotice('A little help goes a long way')}><CircleHelp size={20} /></button>
            <button className="icon-button settings-shortcut" aria-label="Settings" title="Settings" onClick={() => setModal('settings')}><Menu size={21} /></button>
          </div>
        </header>

        {activeTab === 'home' && <>
          <section className="welcome-row"><div><p className="eyebrow">SUNDAY, OCTOBER 4</p><h1>Good afternoon,<br /><em>{profileName.split(/\s+/)[0]}.</em></h1></div><button className="round-add" aria-label="Add expense" onClick={() => openExpenseEditor()}><Plus size={23} /></button></section>
          <section className="section-block group-shares-home"><div className="section-heading"><div><p className="eyebrow">YOUR ACTIVE GROUPS</p><h2>Member shares</h2></div><button className="text-action" onClick={() => openGroupEditor()}><Plus size={16} /> New group</button></div><GroupShares groups={activeGroups} expenses={expenses} currency={currency} onSelectGroup={openGroup} onSettle={settleMemberShare} /></section>
        </>}

        {activeTab === 'activity' && <section className="page-content"><p className="eyebrow">THE PAPER TRAIL</p><h1 className="page-title">All activity<span>.</span></h1><p className="page-subtitle">Every shared moment, accounted for.</p><div className="activity-filters" aria-label="Filter activity"><label>Group<select value={activityGroupFilter} onChange={event => setActivityGroupFilter(event.target.value)}><option value="all">All groups</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label><label>Person<select value={activityPayerFilter} onChange={event => setActivityPayerFilter(event.target.value)}><option value="all">Everyone</option>{activityPayers.map(name => <option key={name} value={name}>{name}</option>)}</select></label><label>Category<select value={activityCategoryFilter} onChange={event => setActivityCategoryFilter(event.target.value)}><option value="all">All categories</option>{activityCategories.map(category => <option key={category} value={category}>{category}</option>)}</select></label></div><FeatureExpenseList expenses={activityExpenses} groups={groups} currency={currency} onSelect={expense => { setSelectedExpense(expense.id); setModal('detail') }} emptyText="No expenses match these filters." /></section>}
        {activeTab === 'groups' && <section className="page-content groups-page"><div className="section-heading"><div><p className="eyebrow">YOUR PEOPLE</p><h1 className="page-title">Groups<span>.</span></h1></div><button className="text-action" onClick={() => openGroupEditor()}><Plus size={16} /> New group</button></div><label className="search-wrap"><span className="search-glyph">⌕</span><input aria-label="Search groups" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a group" /></label><FeatureGroupList groups={visibleGroups} onSelect={openGroup} /></section>}
        {activeTab === 'people' && <PeopleList groups={activeGroups} />}
        <nav className="bottom-nav" aria-label="Main navigation">
          <button className={activeTab === 'home' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('home')}><span className="nav-icon"><Wallet size={20} /></span><span>Home</span></button>
          <button className={activeTab === 'activity' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('activity')}><span className="nav-icon"><ReceiptText size={20} /></span><span>Activity</span></button>
          <button className="nav-add" aria-label="Add expense" onClick={() => openExpenseEditor()}><Plus size={25} /></button>
          <button className={activeTab === 'groups' ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveTab('groups'); setModal(null) }}><span className="nav-icon"><Users size={20} /></span><span>Groups</span></button>
          <button className={activeTab === 'people' ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveTab('people'); setModal(null) }}><span className="nav-icon"><ContactRound size={20} /></span><span>People</span></button>
        </nav>

        {modal === 'group' && <FeatureGroupModal group={editingGroup} currentMember={currentMember} onClose={() => setModal(null)} onSave={saveGroup} onDelete={deleteGroup} />}
        {modal === 'expense' && <FeatureExpenseModal groups={groups} initialGroupId={selectedGroup} currentMember={currentMember} currency={currency} onClose={() => setModal(null)} onSave={saveExpense} />}
        {modal === 'detail' && activeExpense ? <FeatureExpenseDetail expense={activeExpense} groups={groups} currency={currency} onClose={() => { setModal(null); setSelectedExpense(null) }} onMove={moveExpense} /> : modal === 'detail' && activeGroup ? <FeatureGroupDetail group={activeGroup} expenses={groupExpenses(activeGroup.id)} currency={currency} onClose={() => { setModal(null); setSelectedExpense(null) }} onEdit={() => openGroupEditor(activeGroup)} onAddExpense={() => openExpenseEditor(activeGroup.id)} onSelectExpense={expense => setSelectedExpense(expense.id)} /> : null}
        {modal === 'settings' && <FeatureSettingsModal onClose={() => setModal(null)} onSignOut={logOut} user={user} profileName={profileName} profileInitials={profileInitials} appMode={appMode} onModeChange={updateAppMode} onSelectUserMode={selectUserMode} currency={currency} onCurrencyChange={updateCurrency} themeMode={themeMode} onThemeModeChange={updateThemeMode} driveStatus={driveStatus} driveConnected={Boolean(driveConnection)} onConnectDrive={connectDriveFolder} />}
        {notice && <div className="toast" role="status"><Check size={16} />{notice}</div>}
      </div>
      <div className="desktop-note"><Sparkles size={15} /> Made for the little screen in your pocket</div>
    </main>
  )
}

export default App
