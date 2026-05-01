import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, MapPin, AlertCircle } from 'lucide-react'
import { useShareTrip } from '../hooks/useTrips.js'

export default function JoinPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { joinViaToken } = useShareTrip(null)
  const [status, setStatus] = useState('joining') // joining | error
  const [error, setError] = useState('')

  useEffect(() => {
    const join = async () => {
      try {
        const tripId = await joinViaToken(token)
        navigate(`/trip/${tripId}`, { replace: true })
      } catch (err) {
        setStatus('error')
        setError(err.message)
      }
    }
    join()
  }, [token])

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center max-w-sm px-6">
        {status === 'joining' ? (
          <>
            <MapPin size={28} className="text-terracotta mx-auto mb-4 animate-float" />
            <h2 className="font-display text-2xl font-semibold text-ink mb-2">Joining trip…</h2>
            <p className="font-body text-sm text-ink/40 mb-6">Verifying your invite link.</p>
            <Loader2 size={20} className="animate-spin text-terracotta mx-auto" />
          </>
        ) : (
          <>
            <AlertCircle size={28} className="text-red-400 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-semibold text-ink mb-2">Can't join</h2>
            <p className="font-body text-sm text-ink/50 mb-6">{error}</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
