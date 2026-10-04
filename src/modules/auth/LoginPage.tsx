import { ArrowRight, IndianRupee } from 'lucide-react'
import './login.css'

type Props = { onSignIn: () => void; onDemo: () => void; notice: string; loading?: boolean }

export function LoginPage({ onSignIn, onDemo, notice, loading = false }: Props) {
  return <main className="login-screen"><section className="login-content"><div className="login-brand"><span className="login-mark"><IndianRupee size={20} strokeWidth={2.5} /></span><span>tandem</span></div><p className="eyebrow">SHARED EXPENSES, MADE SIMPLE</p><h1>{loading ? 'Checking your account…' : 'Make room for the good stuff.'}</h1><p className="login-copy">Keep shared spending together and see each person’s share clearly.</p>{notice && <p className="login-notice" role="alert">{notice}</p>}<button className="login-primary" type="button" onClick={onSignIn} disabled={loading}><span className="login-google">G</span><span>Continue with Google</span><ArrowRight size={17} /></button><button className="login-demo" type="button" onClick={onDemo} disabled={loading}>Continue with demo data</button><p className="login-storage-note">Adding or changing expenses requires connecting a Google Drive folder.</p></section></main>
}
