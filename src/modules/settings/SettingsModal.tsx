import { ArrowRight, Check, Cloud, HardDrive, LogOut, Wallet, X } from 'lucide-react'
import type { User } from 'firebase/auth'
import type { AppMode, ThemeMode } from '../shared/models'
import { currencies } from '../shared/data'

type Props = {
  onClose: () => void
  onSignOut: () => void
  user: User | null
  profileName: string
  profileInitials: string
  appMode: AppMode
  onModeChange: (mode: AppMode) => void
  onSelectUserMode: () => void
  currency: string
  onCurrencyChange: (currency: string) => void
  themeMode: ThemeMode
  onThemeModeChange: (mode: ThemeMode) => void
  driveStatus: string
  driveConnected: boolean
  onConnectDrive: () => void
}

export function SettingsModal({ onClose, onSignOut, user, profileName, profileInitials, appMode, onModeChange, onSelectUserMode, currency, onCurrencyChange, themeMode, onThemeModeChange, driveStatus, driveConnected, onConnectDrive }: Props) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-sheet settings-sheet" onMouseDown={event => event.stopPropagation()}><div className="sheet-handle" /><div className="modal-heading"><div><p className="eyebrow">YOUR PREFERENCES</p><h2>Settings</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
    <div className="settings-profile"><div className="large-avatar">{profileInitials}</div><div><b>{profileName}</b><span>{user?.email ?? 'Local demo profile'}</span></div></div>
    <section className="settings-preference"><p className="preference-label">Account mode</p><div className="mode-options" role="group" aria-label="Account mode"><button type="button" className={appMode === 'demo' ? 'mode-option selected' : 'mode-option'} aria-pressed={appMode === 'demo'} onClick={() => onModeChange('demo')}>Demo</button><button type="button" className={appMode === 'user' ? 'mode-option selected' : 'mode-option'} aria-pressed={appMode === 'user'} onClick={onSelectUserMode}>User</button></div><span className="preference-hint">{appMode === 'user' ? user?.email ?? 'Connect a Google account to continue' : 'Sample data saved on this device'}</span></section>
    <section className="settings-preference"><p className="preference-label">Appearance</p><div className="mode-options" role="group" aria-label="Appearance"><button type="button" className={themeMode === 'light' ? 'mode-option selected' : 'mode-option'} aria-pressed={themeMode === 'light'} onClick={() => onThemeModeChange('light')}>Light</button><button type="button" className={themeMode === 'dark' ? 'mode-option selected' : 'mode-option'} aria-pressed={themeMode === 'dark'} onClick={() => onThemeModeChange('dark')}>Dark</button></div></section>
    <label className="settings-row currency-row"><Wallet size={18} /><span>Display currency</span><select aria-label="Display currency" value={currency} onChange={event => onCurrencyChange(event.target.value)}>{currencies.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
    <section className="drive-storage"><div className="drive-storage-heading"><HardDrive size={18} /><div><b>Google Drive folder</b><span>{driveConnected ? 'Tandem Expenses' : 'Connect one folder for ongoing storage'}</span></div></div><p className="drive-status" role="status">{driveStatus}</p><button className="drive-action primary-button" type="button" onClick={onConnectDrive}>{driveConnected ? <Check size={17} /> : <Cloud size={17} />}{driveConnected ? 'Drive folder connected' : 'Connect Google Drive folder'}</button><p className="drive-help">Groups, expenses, and currency sync to the Tandem Expenses folder in your Google Drive. Changes are saved automatically when connected.</p><details className="drive-instructions"><summary>Google Drive setup instructions</summary><ol><li>Enable Google Drive API in the Google Cloud project used by Firebase.</li><li>Configure the OAuth consent screen and add your account as a test user if needed.</li><li>Connect the folder and approve Tandem's Google Drive file access.</li></ol></details></section>
    {user && <button className="settings-row signout-row" onClick={onSignOut}><LogOut size={18} /><span>Sign out of Google</span><ArrowRight size={17} /></button>}
  </section></div>
}
