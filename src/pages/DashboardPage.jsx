import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Calendar, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Navbar from '../components/Navbar'
import NewTripModal from '../components/NewTripModal'
import { useTrips } from '../hooks/useTrips.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { hasValidKey, getStoredProvider } from '../lib/ai'

export default function DashboardPage() {
  const { user } = useAuth()
  const { trips, loading, createTrip, deleteTrip } = useTrips()
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const noKey = !hasValidKey(getStoredProvider())

  const handleCreate = async (data) => {
    const trip = await createTrip(data)
    setShowModal(false)
    return trip
  }

  const handleDelete = async (e, tripId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this trip? This cannot be undone.')) return
    setDeleting(tripId)
    try { await deleteTrip(tripId) } finally { setDeleting(null) }
  }

  const firstName = user?.email?.split('@')[0] || 'traveller'

  return (
    <div className="min-h-screen bg-paper">
      <Navbar onNewTrip={() => setShowModal(true)} />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-up">
          <p className="font-body text-sm text-ink/40 uppercase tracking-widest mb-2">Welcome back</p>
          <h1 className="font-display text-5xl font-light text-ink">
            Hello, <em className="text-terracotta">{firstName}</em>
          </h1>
        </div>

        {/* API key warning */}
        {noKey && (
          <Link to="/settings" className="flex items-center gap-3 border border-amber-300 bg-amber-50 px-5 py-4 mb-10 hover:bg-amber-100 transition-colors animate-fade-up stagger-1">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <p className="font-body text-sm text-amber-800">
              No AI provider key set. <strong>Add your API key in Settings</strong> to start generating suggestions.
            </p>
          </Link>
        )}

        {/* Trips grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-terracotta" />
          </div>
        ) : trips.length === 0 ? (
          <div className="border border-dashed border-dust text-center py-24 animate-fade-up stagger-2">
            <MapPin size={32} className="text-dust mx-auto mb-4" />
            <h2 className="font-display text-2xl text-ink/50 mb-2">No trips yet</h2>
            <p className="font-body text-sm text-ink/30 mb-8">Plan your first adventure.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 mx-auto">
              <Plus size={16} /> Create your first trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-sand">
            {/* New trip card */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-paper hover:bg-white transition-colors duration-200 p-8 flex flex-col items-center justify-center gap-3 min-h-48 border-2 border-dashed border-dust hover:border-terracotta group"
            >
              <div className="w-10 h-10 border border-dust group-hover:border-terracotta flex items-center justify-center transition-colors">
                <Plus size={18} className="text-dust group-hover:text-terracotta transition-colors" />
              </div>
              <span className="font-body text-sm text-ink/40 group-hover:text-ink/60">New trip</span>
            </button>

            {trips.map((trip, i) => (
              <Link
                key={trip.id}
                to={`/trip/${trip.id}`}
                className="bg-paper hover:bg-white transition-colors duration-200 p-8 group relative min-h-48 flex flex-col justify-between"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <MapPin size={16} className="text-terracotta mt-0.5" />
                    <button
                      onClick={e => handleDelete(e, trip.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500 text-ink/30"
                    >
                      {deleting === trip.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-ink mb-1 group-hover:text-terracotta transition-colors">
                    {trip.destination}
                  </h3>
                  {trip.country && (
                    <p className="font-body text-xs text-ink/40 uppercase tracking-wider mb-4">{trip.country}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-ink/40">
                  <Calendar size={12} />
                  <span className="font-mono text-xs">
                    {trip.start_date
                      ? `${format(new Date(trip.start_date), 'MMM d')} – ${format(new Date(trip.end_date), 'MMM d, yyyy')}`
                      : 'Dates TBD'
                    }
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <NewTripModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
