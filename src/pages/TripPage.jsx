import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Sparkles, MapPin, Plane, Hotel, MessageSquare, Share2, Loader2, ChevronLeft, RefreshCw } from 'lucide-react'
import Navbar from '../components/Navbar'
import PlacesPanel from '../components/panels/PlacesPanel'
import FlightsPanel from '../components/panels/FlightsPanel'
import HotelsPanel from '../components/panels/HotelsPanel'
import ChatPanel from '../components/panels/ChatPanel'
import ShareModal from '../components/ShareModal.jsx'
import { useTrip } from '../hooks/useTrips.js'
import { generatePlaces, generateFlights, generateHotels, hasValidKey, getStoredProvider } from '../lib/ai'
import { format } from 'date-fns'

const TABS = [
  { id: 'places',  label: 'Places',  icon: MapPin },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'hotels',  label: 'Hotels',  icon: Hotel },
  { id: 'chat',    label: 'AI Chat', icon: MessageSquare },
]

export default function TripPage() {
  const { tripId } = useParams()
  const { trip, loading, saveSuggestions, getSuggestionByType } = useTrip(tripId)
  const [activeTab, setActiveTab] = useState('places')
  const [generating, setGenerating] = useState({})
  const [error, setError] = useState('')
  const [showShare, setShowShare] = useState(false)

  const noKey = !hasValidKey(getStoredProvider())

  const generate = async (type) => {
    if (!trip) return
    setError('')
    setGenerating(prev => ({ ...prev, [type]: true }))
    try {
      let result
      const dates = trip.start_date
        ? `${format(new Date(trip.start_date), 'MMM d')} – ${format(new Date(trip.end_date || trip.start_date), 'MMM d, yyyy')}`
        : 'flexible'

      if (type === 'places') result = await generatePlaces(trip.destination, dates, trip.interests)
      if (type === 'flights') result = await generateFlights(trip.origin || 'your city', trip.destination, trip.start_date, trip.end_date, trip.budget)
      if (type === 'hotels') result = await generateHotels(trip.destination, trip.start_date, trip.end_date, trip.budget, trip.group_size)

      await saveSuggestions(type, result)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(prev => ({ ...prev, [type]: false }))
    }
  }

  const generateAll = async () => {
    await Promise.allSettled([generate('places'), generate('flights'), generate('hotels')])
  }

  if (loading) return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-terracotta" />
    </div>
  )

  if (!trip) return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center">
        <p className="font-body text-ink/50 mb-4">Trip not found.</p>
        <Link to="/dashboard" className="btn-primary">Back to dashboard</Link>
      </div>
    </div>
  )

  const hasAny = ['places','flights','hotels'].some(t => getSuggestionByType(t))
  const tripContext = { destination: trip.destination, dates: `${trip.start_date} to ${trip.end_date}`, budget: trip.budget, interests: trip.interests }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Trip header */}
        <div className="mb-10 animate-fade-up">
          <Link to="/dashboard" className="flex items-center gap-2 text-ink/40 hover:text-ink text-sm font-body mb-6 transition-colors">
            <ChevronLeft size={14} /> All trips
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-5xl font-light text-ink">{trip.destination}</h1>
              {trip.country && <p className="font-body text-sm text-ink/40 uppercase tracking-widest mt-1">{trip.country}</p>}
              {trip.start_date && (
                <p className="font-mono text-xs text-ink/40 mt-3">
                  {format(new Date(trip.start_date), 'MMM d')} – {format(new Date(trip.end_date), 'MMM d, yyyy')}
                  {trip.budget && <> · {trip.budget}</>}
                  {trip.group_size > 1 && <> · {trip.group_size} people</>}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowShare(true)} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
                <Share2 size={14} /> Share
              </button>
              {!noKey && (
                <button
                  onClick={generateAll}
                  disabled={Object.values(generating).some(Boolean)}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                >
                  {Object.values(generating).some(Boolean)
                    ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                    : <><RefreshCw size={14} /> {hasAny ? 'Regenerate all' : 'Generate all'}</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red-200 bg-red-50 px-5 py-3 mb-6 font-body text-sm text-red-700 flex items-center justify-between">
            {error}
            <button onClick={() => setError('')} className="ml-4 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* No key warning */}
        {noKey && (
          <div className="border border-amber-300 bg-amber-50 px-5 py-4 mb-6 font-body text-sm text-amber-800 flex items-center gap-3">
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            <span>Add your AI API key in <Link to="/settings" className="underline font-medium">Settings</Link> to generate suggestions.</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-sand mb-8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 font-body text-sm font-medium border-b-2 transition-all duration-200 -mb-px
                ${activeTab === id
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-ink/40 hover:text-ink/70'
                }`}
            >
              <Icon size={14} />
              {label}
              {id !== 'chat' && getSuggestionByType(id) && (
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
              )}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="animate-fade-in">
          {activeTab === 'places' && (
            <PlacesPanel
              data={getSuggestionByType('places')}
              loading={generating.places}
              onGenerate={() => generate('places')}
              noKey={noKey}
            />
          )}
          {activeTab === 'flights' && (
            <FlightsPanel
              data={getSuggestionByType('flights')}
              loading={generating.flights}
              onGenerate={() => generate('flights')}
              noKey={noKey}
              origin={trip.origin}
            />
          )}
          {activeTab === 'hotels' && (
            <HotelsPanel
              data={getSuggestionByType('hotels')}
              loading={generating.hotels}
              onGenerate={() => generate('hotels')}
              noKey={noKey}
            />
          )}
          {activeTab === 'chat' && (
            <ChatPanel tripContext={tripContext} noKey={noKey} />
          )}
        </div>
      </main>

      {showShare && <ShareModal tripId={tripId} onClose={() => setShowShare(false)} />}
    </div>
  )
}
