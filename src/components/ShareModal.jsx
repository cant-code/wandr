import { useState } from 'react'
import { X, Link2, Copy, Check, Loader2, Users, Eye } from 'lucide-react'
import { useShareTrip } from '../hooks/useTrips.js'

export default function ShareModal({ tripId, onClose }) {
  const { createShareLink } = useShareTrip(tripId)
  const [permission, setPermission] = useState<Permission>('viewer')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const url = await createShareLink(permission)
      setLink(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-paper border border-sand w-full max-w-md shadow-2xl animate-fade-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand">
          <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2">
            <Link2 size={18} className="text-terracotta" /> Share trip
          </h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><X size={18} /></button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Permission toggle */}
          <div>
            <label className="block font-body text-sm font-medium text-ink/70 mb-3">Permission level</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: 'viewer', icon: Eye, label: 'View only', desc: 'Can see suggestions, not edit' },
                  { value: 'collaborator', icon: Users, label: 'Collaborator', desc: 'Can add and regenerate suggestions' },
                ]
              ).map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setPermission(value)}
                  className={`p-4 text-left border transition-all duration-200
                    ${permission === value ? 'border-terracotta bg-terracotta/5' : 'border-sand bg-white hover:border-dust'}`}
                >
                  <Icon size={14} className={`mb-2 ${permission === value ? 'text-terracotta' : 'text-ink/40'}`} />
                  <p className="font-body text-sm font-medium text-ink">{label}</p>
                  <p className="font-body text-xs text-ink/40 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Link */}
          {link ? (
            <div>
              <label className="block font-body text-sm font-medium text-ink/70 mb-2">Share link (expires in 7 days)</label>
              <div className="flex items-center gap-2">
                <input value={link} readOnly className="input-field text-xs flex-1 bg-sand/30" />
                <button onClick={copy} className="btn-primary py-3 px-4 shrink-0 flex items-center gap-2">
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {error && <p className="font-body text-sm text-red-500 mb-3">{error}</p>}
              <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><Link2 size={14} /> Generate invite link</>}
              </button>
            </div>
          )}

          <p className="font-body text-xs text-ink/30 text-center">
            Anyone with the link can join if they have a Wandr account.
          </p>
        </div>
      </div>
    </div>
  )
}
