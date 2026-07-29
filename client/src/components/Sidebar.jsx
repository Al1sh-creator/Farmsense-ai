import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { icon: '🏠', label: 'Dashboard',       to: '/dashboard'       },
  { icon: '🔔', label: 'Alerts',          to: '/alerts'          },
  { icon: '💡', label: 'Suggestions',     to: '/suggestions'     },
  { icon: '🌾', label: 'Crop Comparison', to: '/crop-comparison' },
  { icon: '🚜', label: 'Farm Profile',    to: '/farm-profile'    },
  { icon: '⚙️', label: 'Settings',        to: '/settings'        },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-gray-100 px-3 py-6 gap-1">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 mb-6">
        <span className="text-2xl">🌾</span>
        <span className="font-heading font-bold text-primary text-lg">FarmSense</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1">
        {LINKS.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="mt-auto px-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-body uppercase tracking-wide">Signed in as</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5 truncate">{user.name}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      )}
    </aside>
  )
}
