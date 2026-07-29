import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import api from '../api/apiClient'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [prefs, setPrefs]       = useState({ email_alerts: true, sms_alerts: false, alert_types: ['weather', 'pest', 'irrigation', 'harvest'] })
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    api.get('/api/notifications/prefs')
      .then((res) => setPrefs(res.data.prefs || prefs))
      .catch(() => {}) // Use defaults if not set yet
      .finally(() => setLoading(false))
  }, [])

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const toggleType = (type) => {
    setPrefs((p) => ({
      ...p,
      alert_types: p.alert_types.includes(type)
        ? p.alert_types.filter((t) => t !== type)
        : [...p.alert_types, type],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await api.put('/api/notifications/prefs', prefs)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const ALERT_TYPES = [
    { key: 'weather',    label: 'Weather Alerts',    icon: '🌦️' },
    { key: 'pest',       label: 'Pest Risk Alerts',  icon: '🐛' },
    { key: 'irrigation', label: 'Irrigation Alerts', icon: '💧' },
    { key: 'harvest',    label: 'Harvest Alerts',    icon: '🌾' },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-gray-900">⚙️ Settings</h1>
            <p className="text-sm text-gray-500 font-body mt-1">Manage your notification preferences</p>
          </div>

          {/* Account info */}
          <div className="card mb-5">
            <h2 className="font-heading font-semibold text-gray-800 mb-3">Account</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-body">Name</span>
                <span className="text-sm font-medium text-gray-800 font-body">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-body">Email</span>
                <span className="text-sm font-medium text-gray-800 font-body">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-body">Phone</span>
                <span className="text-sm font-medium text-gray-800 font-body">{user?.phone || '—'}</span>
              </div>
            </div>
          </div>

          {/* Notification channels */}
          <div className="card mb-5">
            <h2 className="font-heading font-semibold text-gray-800 mb-4">Notification Channels</h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2].map(i => <div key={i} className="h-12 animate-pulse bg-gray-50 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { key: 'email_alerts', label: 'Email Notifications', icon: '📧', desc: `Alerts sent to ${user?.email}` },
                  { key: 'sms_alerts',   label: 'SMS Notifications',   icon: '📱', desc: `Alerts sent to ${user?.phone || 'your phone'}` },
                ].map(({ key, label, icon, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-background">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 font-body">{label}</p>
                        <p className="text-xs text-gray-400 font-body">{desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggle(key)}
                      id={`toggle-${key}`}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200
                        ${prefs[key] ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                        ${prefs[key] ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alert types */}
          <div className="card mb-6">
            <h2 className="font-heading font-semibold text-gray-800 mb-4">Alert Types</h2>
            <div className="space-y-2">
              {ALERT_TYPES.map(({ key, label, icon }) => (
                <label key={key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-background cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    id={`alert-type-${key}`}
                    checked={prefs.alert_types.includes(key)}
                    onChange={() => toggleType(key)}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-body text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button onClick={handleSave} disabled={saving} id="btn-save-settings" className="btn-primary">
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
            {saved && (
              <span className="text-sm text-secondary font-body animate-fade-in">
                ✓ Settings saved!
              </span>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
