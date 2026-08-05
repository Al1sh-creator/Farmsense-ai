import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import SidebarWeather from './SidebarWeather'

const LINKS = [
  { icon: '🏠', label: 'Dashboard',       to: '/dashboard'       },
  { icon: '🔔', label: 'Alerts',          to: '/alerts'          },
  { icon: '💡', label: 'Suggestions',     to: '/suggestions'     },
  { icon: '🌾', label: 'Crop Comparison', to: '/crop-comparison' },
  { icon: '🚜', label: 'Farm Profile',    to: '/farm-profile'    },
  { icon: '🌤️', label: 'Weather',         to: '/weather'         },
  { icon: '🏛️', label: 'Govt Schemes',    to: '/schemes'         },
  { icon: '🌿', label: 'Disease Detection', to: '/disease-detection' },
  { icon: '⚙️', label: 'Settings',        to: '/settings'        },
]

export default function Sidebar() {
  const { user, isDemo } = useAuth()
  const { liveAlerts }   = useSocket() || {}
  const unread           = liveAlerts?.length || 0
  const location         = useLocation()
  const isWeatherPage    = location.pathname === '/weather'

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-gray-100 py-5">

      {/* Logo */}
      <div className="flex items-center gap-2 px-5 mb-6">
        <span className="text-2xl">🌾</span>
        <span className="font-heading font-bold text-primary text-lg">FarmSense AI</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 px-3">
        {LINKS.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-base">{icon}</span>
            <span className="flex-1">{label}</span>
            {label === 'Alerts' && unread > 0 && (
              <span className="bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Weather widget — hide on /weather page */}
      {!isDemo && !isWeatherPage && user?.profile_completed && (
        <SidebarWeather />
      )}

      {/* Demo placeholder */}
      {isDemo && (
        <div className="mt-auto border-t border-gray-100 px-4 pt-3 pb-4">
          <p className="text-[10px] text-amber-600 font-body uppercase tracking-wide mb-1">🧪 Demo Mode</p>
          <p className="text-xs text-gray-400">Showing Ramesh Patel's farm data</p>
        </div>
      )}
    </aside>
  )
}
