import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import CropCompareTable from '../components/CropCompareTable'
import { useAuth } from '../context/AuthContext'
import { compareCrops } from '../api/cropApi'
import { getMyFarm } from '../api/farmApi'
import { MOCK_CROP_COMPARISON } from '../mock/mockData'

const SEASONS = ['kharif', 'rabi', 'zaid']

const COMMON_CROPS = [
  { id: 1, name: 'Kapas (Cotton)'   },
  { id: 2, name: 'Gehu (Wheat)'     },
  { id: 3, name: 'Moong'            },
  { id: 4, name: 'Groundnut'        },
  { id: 5, name: 'Castor'           },
  { id: 6, name: 'Bajra'            },
  { id: 7, name: 'Jowar'            },
  { id: 8, name: 'Mustard'          },
]

export default function CropComparison() {
  const { isDemo }            = useAuth()
  const [season, setSeason]   = useState('kharif')
  const [landSize, setLandSize] = useState('')
  const [selected, setSelected] = useState([])
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const toggleCrop = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])

  const handleCompare = async () => {
    if (selected.length < 2) { setError('Select at least 2 crops to compare.'); return }
    if (!landSize)            { setError('Please enter land size.'); return }
    setError('')
    setLoading(true)

    if (isDemo) {
      // Simulate AI processing delay
      await new Promise((r) => setTimeout(r, 1500))
      setResults(MOCK_CROP_COMPARISON.slice(0, selected.length))
      setLoading(false)
      return
    }

    try {
      const farmRes = await getMyFarm()
      const farmId  = farmRes.data.farm?.id
      const res = await compareCrops({ farm_id: farmId, season, crop_ids: selected, land_size: parseFloat(landSize) })
      setResults(res.data.results || res.data.comparison || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Comparison failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        {isDemo && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
            <p className="text-xs text-amber-700 font-body">🧪 <strong>Demo Mode</strong> — clicking Compare will return sample ML results</p>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-gray-900">🌾 Crop Comparison</h1>
            <p className="text-sm text-gray-500 font-body mt-1">
              AI suitability, yield & profit comparison for your land
            </p>
          </div>

          <div className="card mb-6">
            <h2 className="font-heading font-semibold text-gray-800 mb-4">Configure Comparison</h2>

            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4 font-body">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="label">Season</label>
                <select className="input-field" value={season} onChange={(e) => setSeason(e.target.value)}>
                  {SEASONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Land Size (acres)</label>
                <input className="input-field" type="number" step="0.5" value={landSize}
                  onChange={(e) => setLandSize(e.target.value)} placeholder="e.g. 3.5" />
              </div>
            </div>

            <label className="label">Select Crops to Compare (min 2)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {COMMON_CROPS.map(({ id, name }) => (
                <button key={id} onClick={() => toggleCrop(id)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-body font-medium border transition-all
                    ${selected.includes(id)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary'
                    }`}>
                  {name}
                </button>
              ))}
            </div>

            <button onClick={handleCompare} disabled={loading} id="btn-compare-crops" className="btn-primary w-full sm:w-auto">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isDemo ? 'Running AI model…' : 'Analyzing with AI…'}
                </span>
              ) : '🤖 Compare Crops'}
            </button>
          </div>

          {results.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📊</span>
                <h2 className="font-heading font-semibold text-gray-800">Comparison Results</h2>
                <span className="badge-success">{results.length} crops</span>
              </div>
              <CropCompareTable results={results} />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
