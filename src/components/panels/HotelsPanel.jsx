import { Hotel, Star, Info, Sparkles } from 'lucide-react'

const TYPE_COLORS = {
  'Luxury Hotel': 'text-purple-600 border-purple-200',
  'Boutique Hotel': 'text-pink-600 border-pink-200',
  'Budget Hotel': 'text-blue-600 border-blue-200',
  'Hostel': 'text-forest border-green-200',
  'Apartment': 'text-ocean border-blue-200',
  'Guesthouse': 'text-amber-600 border-amber-200',
}

export default function HotelsPanel({ data, loading, onGenerate, noKey }) {
  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-sand">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-white p-6">
          <div className="shimmer h-5 w-1/2 mb-2 rounded" />
          <div className="shimmer h-4 w-full mb-2 rounded" />
          <div className="shimmer h-4 w-3/4 rounded" />
        </div>
      ))}
    </div>
  )

  if (!data) return (
    <div className="border border-dashed border-dust text-center py-20">
      <Hotel size={28} className="text-dust mx-auto mb-4" />
      <h3 className="font-display text-xl text-ink/50 mb-2">No accommodation yet</h3>
      <p className="font-body text-sm text-ink/30 max-w-sm mx-auto mb-8">
        Get AI-curated hotel, hostel, and apartment suggestions with estimated prices.
      </p>
      {!noKey && (
        <button onClick={onGenerate} className="btn-primary flex items-center gap-2 mx-auto">
          <Sparkles size={14} /> Generate suggestions
        </button>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Accommodation</h2>
        <button onClick={onGenerate} disabled={noKey} className="btn-ghost text-xs flex items-center gap-1.5">
          <Sparkles size={12} /> Regenerate
        </button>
      </div>

      {data.summary && (
        <p className="font-body text-sm text-ink/60 mb-6 leading-relaxed border-l-2 border-terracotta/40 pl-4">
          {data.summary}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-sand mb-6">
        {data.options?.map((opt, i) => (
          <div key={i} className="bg-white p-6 hover:bg-paper transition-colors group">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display text-lg font-semibold text-ink group-hover:text-terracotta transition-colors">
                {opt.name}
              </h3>
              <span className={`tag text-xs shrink-0 ${TYPE_COLORS[opt.type] || 'text-ink/50 border-ink/20'}`}>
                {opt.type}
              </span>
            </div>
            <p className="font-mono text-xs text-ink/40 mb-3">{opt.neighbourhood}</p>

            {opt.highlights && (
              <ul className="space-y-1 mb-4">
                {opt.highlights.map((h, j) => (
                  <li key={j} className="font-body text-xs text-ink/50 flex items-center gap-2">
                    <Star size={10} className="text-terracotta/50 shrink-0" /> {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between mt-auto">
              <div>
                <p className="font-display text-lg font-semibold text-ink">
                  {opt.estimatedPrice.currency} {opt.estimatedPrice.min}–{opt.estimatedPrice.max}
                </p>
                <p className="font-body text-xs text-ink/40">per {opt.estimatedPrice.per} (est.)</p>
              </div>
              {opt.bestFor && (
                <span className="font-mono text-xs text-ink/30 uppercase tracking-wide">{opt.bestFor}</span>
              )}
            </div>

            {opt.bookingTip && (
              <p className="font-body text-xs text-terracotta/70 italic mt-3 border-t border-sand pt-3">
                {opt.bookingTip}
              </p>
            )}
          </div>
        ))}
      </div>

      {data.neighbourhoodGuide && (
        <div className="bg-white border border-sand px-5 py-4 mb-4">
          <h3 className="font-body text-sm font-semibold text-ink mb-2">Neighbourhood guide</h3>
          <p className="font-body text-sm text-ink/60 leading-relaxed">{data.neighbourhoodGuide}</p>
        </div>
      )}

      {data.disclaimer && (
        <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200">
          <Info size={13} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="font-body text-xs text-amber-700">{data.disclaimer}</p>
        </div>
      )}
    </div>
  )
}
