import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 h-14 flex items-center justify-end px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 font-body">{user.name}</span>
        </div>
        <button
          onClick={logout}
          id="btn-logout"
          className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium transition-all"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
