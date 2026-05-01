import { Link, useNavigate } from 'react-router-dom'
import { Settings, LogOut, Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import logo from '../assets/logo.svg'

export default function Navbar({ onNewTrip }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-40 bg-paper/90 backdrop-blur-sm border-b border-sand flex items-center justify-between px-6 py-4">
      <Link to="/dashboard" className="flex items-center gap-2">
        <img src={logo} alt="Wandr Logo" className="w-6 h-6" />
        <span className="font-display text-xl italic text-ink">Wandr</span>
      </Link>

      <div className="flex items-center gap-2">
        {onNewTrip && (
          <button onClick={onNewTrip} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
            <Plus size={14} /> New trip
          </button>
        )}
        <Link to="/settings" className="btn-ghost p-2">
          <Settings size={16} />
        </Link>
        <button onClick={handleSignOut} className="btn-ghost p-2 text-ink/40 hover:text-red-500">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  )
}
