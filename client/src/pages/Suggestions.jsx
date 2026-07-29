import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import SuggestionCard from '../components/SuggestionCard'
import { useAuth } from '../context/AuthContext'
import { getSuggestions } from '../api/suggestionApi'
import { getMyFarm } from '../api/farmApi'
import { MOCK_SUGGESTIONS } from '../mock/mockData'

const CATEGORIES = ['all', 'irrigation', 'fertilizer', 'pest_risk', 'harvest']
const CAT_LABELS = {
  all: 'All', irrigation: '💧 Irrigation', fertilizer: '🧪 Fertilizer',
  pest_risk: '🐛 Pest Risk', harvest: '🌾 Harvest',
}

export default function Suggestions() {
  const { isDemo }                  = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [category, setCategory]     = useState('all')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (isDemo) {
      setSuggestions(MOCK_SUGGESTIONS)
      setLoading(false)
      return
    }
    getMyFarm()
      .then((res) => getSuggestions(res.data.farm?.id))
      .then((res) => setSuggestions(res.data.suggestions || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isDemo])

  const filtered = category === 'all'
    ? suggestions
    : suggestions.filter((s) => s.category === category)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        {isDemo && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
            <p className="text-xs text-amber-700 font-body">🧪 <strong>Demo Mode</strong> — ML-generated sample suggestions shown</p>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-gray-900">💡 AI Suggestions</h1>
            <p className="text-sm text-gray-500 font-body mt-1">Personalized farming advice from our ML models</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all font-body
                  ${category === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-secondary hover:text-secondary'
                  }`}
              >
                {CAT_LABELS[cat]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="card h-32 animate-pulse bg-gray-50" />)}
            </div>
          ) : filtered.length ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((s) => <SuggestionCard key={s.id} suggestion={s} />)}
            </div>
          ) : (
            <div className="card text-center py-16">
              <span className="text-5xl">🤖</span>
              <h3 className="font-heading font-semibold text-gray-700 mt-4">No Suggestions Yet</h3>
              <p className="text-sm text-gray-500 font-body mt-1">Check back after daily analysis runs.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
