import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import logo from '../assets/logo.svg'

export default function AuthPage() {
  const { signInWithGoogle, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    const result = await signInWithMagicLink(email)
    if (result?.error) setError(result.error.message)
    else setSent(true)
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #C45C3A 0%, transparent 60%), radial-gradient(circle at 70% 80%, #2A6B8A 0%, transparent 50%)' }} />
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <img src={logo} alt="Wandr Logo" className="w-8 h-8 brightness-0 invert" />
          <span className="font-display text-3xl italic text-paper">Wandr</span>
        </Link>
        <div className="relative z-10">
          <blockquote className="font-display text-4xl font-light italic text-paper/80 leading-tight mb-6">
            "The world is a book, and those who do not travel read only one page."
          </blockquote>
          <cite className="font-body text-sm text-paper/40">— Saint Augustine</cite>
        </div>
        {/* Decorative grid */}
        <div className="absolute bottom-0 right-0 grid grid-cols-8 gap-1 p-8 opacity-10">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-paper rounded-full" />
          ))}
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 max-w-xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 text-ink/40 hover:text-ink text-sm font-body mb-12 transition-colors lg:hidden">
          <ArrowLeft size={14} /> Back
        </Link>

        {sent ? (
            <div className="text-center animate-fade-up">
              <div className="w-16 h-16 border-2 border-terracotta flex items-center justify-center mx-auto mb-6">
                <Mail size={24} className="text-terracotta"/>
              </div>
              <h2 className="font-display text-3xl font-semibold text-ink mb-3">Check your inbox</h2>
              <p className="font-body text-ink/60 mb-8">
                We've sent a magic link to <strong className="text-ink">{email}</strong>.<br/>
                Click it to sign in — no password needed.
              </p>
              <button onClick={() => setSent(false)} className="btn-ghost text-sm">
                Use a different email
              </button>
            </div>
        ) : (
            <>
              <h1 className="font-display text-4xl font-semibold text-ink mb-2">Welcome back</h1>
              <p className="font-body text-ink/50 mb-10">Sign in to start planning your next adventure.</p>

              {/* Google */}
              <button
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 border border-sand bg-white hover:bg-sand/40 text-ink font-body font-medium py-3 px-6 transition-all duration-200 mb-6"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-sand"/>
                <span className="font-body text-xs text-ink/30 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-sand"/>
              </div>

              {/* Magic link */}
              <form onSubmit={handleMagicLink}>
                <label htmlFor="email" className="block font-body text-sm font-medium text-ink/70 mb-2">Email address</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field mb-4"
                    required
                />
                {error && <p className="text-sm text-red-500 font-body mb-4">{error}</p>}
                <button type="submit" disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={16} className="animate-spin"/> : <Mail size={16}/>}
                  {loading ? 'Sending…' : 'Send magic link'}
                </button>
              </form>

              <p className="font-body text-xs text-ink/30 mt-6 text-center">
                No password needed. We'll email you a sign-in link.
              </p>
            </>
        )}
      </div>
    </div>
  )
}
