import { Link } from 'react-router-dom'
import { Sparkles, Users, Lock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-sand">
        <span className="font-display text-2xl italic text-ink">Wandr</span>
        <div className="flex items-center gap-6">
          <Link to="/auth" className="font-body text-sm text-ink/60 hover:text-ink transition-colors">Sign in</Link>
          <Link to="/auth" className="btn-primary text-sm py-2 px-5">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-8 pt-24 pb-32 max-w-5xl mx-auto">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-terracotta/5 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-ocean/5 translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="tag text-terracotta border-terracotta/40 mb-8 animate-fade-up stagger-1">
            AI-powered travel planning
          </div>

          <h1 className="font-display text-7xl md:text-8xl font-light leading-[0.95] text-ink mb-8 animate-fade-up stagger-2">
            Plan trips.<br />
            <em className="text-terracotta not-italic font-semibold">Share</em> the<br />
            adventure.
          </h1>

          <p className="font-body text-lg text-ink/60 max-w-md mb-12 animate-fade-up stagger-3">
            Generate AI-curated places, flight estimates, and accommodation suggestions — then share and plan together with your travel crew.
          </p>

          <div className="flex items-center gap-4 animate-fade-up stagger-4">
            <Link to="/auth" className="btn-primary">Start planning free</Link>
            <span className="font-body text-sm text-ink/40">Your API key. Your data.</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-sand">
          {[
            { icon: Sparkles, title: 'AI-generated', desc: 'Places, flights, and hotels suggested by the AI provider of your choice — OpenAI, Anthropic, or Gemini.', color: 'terracotta' },
            { icon: Users, title: 'Collaborative', desc: 'Share trips with friends or groups. Set view-only or edit permissions. Real-time sync via Firebase.', color: 'ocean' },
            { icon: Lock, title: 'Your keys, your data', desc: 'API keys never leave your browser. Stored in localStorage only. No vendor lock-in.', color: 'forest' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-paper p-8 group hover:bg-white transition-colors duration-300">
              <div className={`w-10 h-10 flex items-center justify-center border border-${color}/30 mb-6 group-hover:border-${color} transition-colors`}>
                <Icon size={18} className={`text-${color}`} />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink mb-3">{title}</h3>
              <p className="font-body text-sm text-ink/60 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sand px-8 py-6 flex items-center justify-between">
        <span className="font-display text-lg italic text-ink/40">Wandr</span>
        <span className="font-mono text-xs text-ink/30">Built with React + Firebase</span>
      </footer>
    </div>
  )
}
