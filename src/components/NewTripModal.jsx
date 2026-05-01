import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function NewTripModal({ onClose, onCreate }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    destination: '', country: '', origin: '',
    start_date: '', end_date: '', budget: '', interests: '', group_size: 1,
  })

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const trip = await onCreate(form)
      navigate(`/trip/${trip.id}`)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-paper border border-sand w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-sand">
          <h2 className="font-display text-2xl font-semibold text-ink">Plan a new trip</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="input-destination" className="block font-body text-sm font-medium text-ink/70 mb-1.5">Destination *</label>
              <input
                id="input-destination"
                className="input-field"
                placeholder="e.g. Lisbon"
                value={form.destination}
                onChange={e => set('destination', e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="input-country" className="block font-body text-sm font-medium text-ink/70 mb-1.5">Country</label>
              <input
                id="input-country"
                className="input-field"
                placeholder="Portugal"
                value={form.country}
                onChange={e => set('country', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="input-origin" className="block font-body text-sm font-medium text-ink/70 mb-1.5">Flying from</label>
              <input
                id="input-origin"
                className="input-field"
                placeholder="New York"
                value={form.origin}
                onChange={e => set('origin', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-start" className="block font-body text-sm font-medium text-ink/70 mb-1.5">Start date</label>
              <input
                id="input-start"
                type="date"
                className="input-field"
                value={form.start_date}
                onChange={e => set('start_date', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="input-end" className="block font-body text-sm font-medium text-ink/70 mb-1.5">End date</label>
              <input
                id="input-end"
                type="date"
                className="input-field"
                value={form.end_date} onChange={e => set('end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-budget" className="block font-body text-sm font-medium text-ink/70 mb-1.5">Budget</label>
              <input
                id="input-budget"
                className="input-field"
                placeholder="e.g. $2000"
                value={form.budget}
                onChange={e => set('budget', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="input-group" className="block font-body text-sm font-medium text-ink/70 mb-1.5">Group size</label>
              <input
                id="input-group"
                type="number"
                min={1}
                max={20}
                className="input-field"
                value={form.group_size}
                onChange={e => set('group_size', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="input-interests" className="block font-body text-sm font-medium text-ink/70 mb-1.5">Interests</label>
            <input
              id="input-interests"
              className="input-field"
              placeholder="e.g. history, food, beaches, nightlife"
              value={form.interests}
              onChange={e => set('interests', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : 'Create trip'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
