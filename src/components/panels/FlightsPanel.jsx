import { Plane, TrendingDown, Info, Sparkles } from 'lucide-react'

export default function FlightsPanel({ data, loading, onGenerate, noKey, origin }) {
  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white p-6">
          <div className="shimmer h-5 w-1/3 mb-3 rounded" />
          <div className="shimmer h-4 w-full mb-2 rounded" />
          <div className="shimmer h-4 w-2/3 rounded" />
        </div>
      ))}
    </div>
  )

  if (!data) return (
    <div className="border border-dashed border-dust text-center py-20">
      <Plane size={28} className="text-dust mx-auto mb-4" />
      <h3 className="font-display text-xl text-ink/50 mb-2">No flight estimates yet</h3>
      <p className="font-body text-sm text-ink/30 max-w-sm mx-auto mb-8">
        Get AI-generated price estimates and booking tips for your route.
        {!origin && ' Add your origin city to the trip for better estimates.'}
      </p>
      {!noKey && (
        <button onClick={onGenerate} className="btn-primary flex items-center gap-2 mx-auto">
          <Sparkles size={14} /> Generate estimates
        </button>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Flight estimates</h2>
        <button onClick={onGenerate} disabled={noKey} className="btn-ghost text-xs flex items-center gap-1.5">
          <Sparkles size={12} /> Regenerate
        </button>
      </div>

      {data.summary && (
        <p className="font-body text-sm text-ink/60 mb-6 leading-relaxed border-l-2 border-terracotta/40 pl-4">
          {data.summary}
        </p>
      )}

      <div className="space-y-3 mb-8">
        {data.routes?.map((route, i) => (
          <div key={i} className="bg-white border border-sand p-5 flex items-center gap-6">
            <div className="shrink-0">
              <span className={`tag text-xs ${i === 0 ? 'text-forest border-green-300' : 'text-ink/50 border-ink/20'}`}>
                {route.type}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-medium text-ink text-sm">{route.airline}</p>
              {route.duration && <p className="font-mono text-xs text-ink/40">{route.duration}</p>}
              {route.notes && <p className="font-body text-xs text-ink/40 mt-1 truncate">{route.notes}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-xl font-semibold text-ink">
                {route.estimatedPrice.currency} {route.estimatedPrice.min}–{route.estimatedPrice.max}
              </p>
              <p className="font-body text-xs text-ink/40">per person (est.)</p>
            </div>
          </div>
        ))}
      </div>

      {data.bestBookingTips?.length > 0 && (
        <div className="bg-white border border-sand p-5 mb-4">
          <h3 className="font-body text-sm font-semibold text-ink flex items-center gap-2 mb-3">
            <TrendingDown size={14} className="text-terracotta" /> Booking tips
          </h3>
          <ul className="space-y-2">
            {data.bestBookingTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 font-body text-sm text-ink/60">
                <span className="text-terracotta mt-0.5">·</span> {tip}
              </li>
            ))}
          </ul>
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
