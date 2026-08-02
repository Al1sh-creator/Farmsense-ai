import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

const NAV_LINKS = [
  { label: 'Dashboard',       path: '/dashboard'       },
  { label: 'Alerts',          path: '/alerts'          },
  { label: 'Suggestions',     path: '/suggestions'     },
  { label: 'Crop Comparison', path: '/crop-comparison' },
  { label: 'Farm Profile',    path: '/farm-profile'    },
  { label: 'Settings',        path: '/settings'        },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { liveAlerts }   = useSocket() || {}
  const location         = useLocation()
  const unread           = liveAlerts?.length || 0

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <span className="font-heading font-bold text-primary text-lg">FarmSense AI</span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 font-body
                ${location.pathname === path
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-light hover:text-primary'
                }`}
            >
              {label === 'Alerts' && unread > 0 ? (
                <span className="relative">
                  {label}
                  <span className="absolute -top-2 -right-4 bg-danger text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unread}
                  </span>
                </span>
              ) : label}
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600 font-body">{user.name}</span>
            <button
              onClick={logout}
              id="btn-logout"
              className="text-sm text-danger hover:bg-danger/10 px-3 py-1.5 rounded-lg font-medium transition-all"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
