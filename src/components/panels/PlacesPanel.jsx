import { MapPin, Clock, DollarSign, Lightbulb, Sparkles } from 'lucide-react'

const CATEGORY_COLORS = {
  Museum: 'text-blue-600 border-blue-200 bg-blue-50',
  Nature: 'text-forest border-green-200 bg-green-50',
  Food: 'text-amber-600 border-amber-200 bg-amber-50',
  History: 'text-purple-600 border-purple-200 bg-purple-50',
  Art: 'text-pink-600 border-pink-200 bg-pink-50',
  Adventure: 'text-terracotta border-orange-200 bg-orange-50',
  Nightlife: 'text-indigo-600 border-indigo-200 bg-indigo-50',
  Shopping: 'text-cyan-600 border-cyan-200 bg-cyan-50',
}

function PriceTag({ price }) {
  return (
    <span className="font-mono text-xs text-ink/50">
      {price === 'Free' ? <span className="text-forest font-medium">Free</span> : price}
    </span>
  )
}

export default function PlacesPanel({ data, loading, onGenerate, noKey }) {
  if (loading) return <LoadingState count={6} />

  if (!data) return (
    <EmptyState
      icon={MapPin}
      title="No places yet"
      desc="Generate AI-curated attractions, hidden gems, and must-see spots for your destination."
      onGenerate={onGenerate}
      noKey={noKey}
    />
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Places to visit</h2>
        <button onClick={onGenerate} disabled={noKey} className="btn-ghost text-xs flex items-center gap-1.5">
          <Sparkles size={12} /> Regenerate
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-sand">
        {data.places?.map((place, i) => (
          <div key={i} className="bg-white p-6 hover:bg-paper transition-colors duration-200 group">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-display text-xl font-semibold text-ink group-hover:text-terracotta transition-colors">
                {place.name}
              </h3>
              {place.category && (
                <span className={`tag text-xs shrink-0 ${CATEGORY_COLORS[place.category] || 'text-ink/50 border-ink/20'}`}>
                  {place.category}
                </span>
              )}
            </div>
            <p className="font-body text-sm text-ink/60 leading-relaxed mb-4">{place.description}</p>
            <div className="flex items-center gap-4 text-xs text-ink/40 mb-3">
              {place.estimatedDuration && (
                <span className="flex items-center gap-1"><Clock size={11} /> {place.estimatedDuration}</span>
              )}
              {place.priceRange && (
                <span className="flex items-center gap-1"><DollarSign size={11} /> <PriceTag price={place.priceRange} /></span>
              )}
              {place.bestTime && (
                <span className="text-ink/30">Best: {place.bestTime}</span>
              )}
            </div>
            {place.tip && (
              <div className="flex items-start gap-2 bg-terracotta/5 border border-terracotta/15 px-3 py-2">
                <Lightbulb size={12} className="text-terracotta mt-0.5 shrink-0" />
                <p className="font-body text-xs text-ink/60 italic">{place.tip}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function LoadingState({ count }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-sand">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6">
          <div className="shimmer h-6 w-3/4 mb-3 rounded" />
          <div className="shimmer h-4 w-full mb-2 rounded" />
          <div className="shimmer h-4 w-2/3 mb-4 rounded" />
          <div className="shimmer h-8 w-full rounded" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon: Icon, title, desc, onGenerate, noKey }) {
  return (
    <div className="border border-dashed border-dust text-center py-20">
      <Icon size={28} className="text-dust mx-auto mb-4" />
      <h3 className="font-display text-xl text-ink/50 mb-2">{title}</h3>
      <p className="font-body text-sm text-ink/30 max-w-sm mx-auto mb-8">{desc}</p>
      {!noKey && (
        <button onClick={onGenerate} className="btn-primary flex items-center gap-2 mx-auto">
          <Sparkles size={14} /> Generate suggestions
        </button>
      )}
    </div>
  )
}
