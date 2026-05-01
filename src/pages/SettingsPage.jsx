import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Save, Trash2, ExternalLink, Check, ChevronLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import {
  PROVIDERS, getStoredProvider, setStoredProvider,
  getStoredKey, setStoredKey, clearStoredKey, hasValidKey
} from '../lib/ai'

function ProviderCard({ provider, isActive, onSelect }) {
  const [showKey, setShowKey] = useState(false)
  const [key, setKey] = useState(getStoredKey(provider.id))
  const [saved, setSaved] = useState(hasValidKey(provider.id))

  const save = () => {
    if (key.trim()) {
      setStoredKey(provider.id, key.trim())
      setSaved(true)
      onSelect(provider.id)
    }
  }

  const clear = () => {
    clearStoredKey(provider.id)
    setKey('')
    setSaved(false)
  }

  return (
    <div className={`border transition-all duration-200 ${isActive ? 'border-terracotta' : 'border-sand bg-white'}`}>
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${saved ? 'bg-forest' : 'bg-dust'}`} />
          <h3 className="font-display text-lg font-semibold text-ink">{provider.name}</h3>
          {isActive && <span className="tag text-xs text-terracotta border-terracotta/30">Active</span>}
        </div>
        <div className="flex items-center gap-2">
          <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer"
            className="font-body text-xs text-ink/40 hover:text-ink flex items-center gap-1 transition-colors">
            Get key <ExternalLink size={11} />
          </a>
          {!isActive && saved && (
            <button onClick={() => onSelect(provider.id)} className="btn-secondary text-xs py-1.5 px-3">
              Use this
            </button>
          )}
        </div>
      </div>

      <div className="px-6 pb-5 border-t border-sand pt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={e => { setKey(e.target.value); setSaved(false) }}
              placeholder={provider.placeholder}
              className="input-field font-mono text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button onClick={save} disabled={!key.trim()} className="btn-primary py-3 px-4 flex items-center gap-1.5">
            {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
          </button>
          {saved && (
            <button onClick={clear} className="btn-ghost py-3 px-3 text-ink/30 hover:text-red-500">
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <p className="font-body text-xs text-ink/30 mt-2">
          Stored only in your browser's localStorage. Never sent to any server.
        </p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeProvider, setActiveProvider] = useState(getStoredProvider())

  const handleSelect = (id) => {
    setStoredProvider(id)
    setActiveProvider(id)
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/dashboard" className="flex items-center gap-2 text-ink/40 hover:text-ink text-sm font-body mb-10 transition-colors">
          <ChevronLeft size={14} /> Dashboard
        </Link>

        <h1 className="font-display text-4xl font-light text-ink mb-2">Settings</h1>
        <p className="font-body text-sm text-ink/50 mb-12">Configure your AI provider. Keys live in your browser only.</p>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-body text-xs font-semibold text-ink/40 uppercase tracking-widest">AI Providers</h2>
            <div className="flex-1 h-px bg-sand" />
          </div>
          <div className="space-y-3">
            {Object.values(PROVIDERS).map(provider => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isActive={activeProvider === provider.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </section>

        <section className="border border-sand bg-white px-6 py-5">
          <h2 className="font-body text-sm font-semibold text-ink mb-2">Privacy note</h2>
          <p className="font-body text-sm text-ink/50 leading-relaxed">
            Your API keys are stored exclusively in your browser's <code className="font-mono text-xs bg-sand px-1.5 py-0.5">localStorage</code>.
            They are never transmitted to Wandr's servers. All AI requests go directly from your browser to the provider's API.
            Clearing your browser data will remove your keys.
          </p>
        </section>
      </main>
    </div>
  )
}
