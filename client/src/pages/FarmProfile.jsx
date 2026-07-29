import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import FieldCard from '../components/FieldCard'
import { useAuth } from '../context/AuthContext'
import { getMyFarm, addField, updateField, deleteField, getFields } from '../api/farmApi'
import { MOCK_FARM } from '../mock/mockData'

const SOIL_TYPES  = ['Black', 'Red', 'Alluvial', 'Laterite', 'Sandy', 'Loamy', 'Clayey']
const CROP_STAGES = ['sowing', 'growing', 'flowering', 'harvest']
const SEASONS     = ['kharif', 'rabi', 'zaid']

function FieldModal({ field, onClose, onSave, farmId, isDemo }) {
  const [form, setForm] = useState(
    field || { name: '', crop_name: '', crop_stage: 'growing', area_acres: '', soil_type: 'Black', season: 'kharif' }
  )
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 600))
      } else {
        if (field?.id) await updateField(field.id, form)
        else await addField(farmId, form)
      }
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
        <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">
          {field?.id ? 'Edit Field' : 'Add New Field'}
          {isDemo && <span className="ml-2 text-xs text-amber-600 font-body">(Demo)</span>}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="label">Field Name</label>
            <input className="input-field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="North Field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Crop</label>
              <input className="input-field" value={form.crop_name} onChange={(e) => set('crop_name', e.target.value)} placeholder="Kapas" />
            </div>
            <div>
              <label className="label">Stage</label>
              <select className="input-field" value={form.crop_stage} onChange={(e) => set('crop_stage', e.target.value)}>
                {CROP_STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Area (acres)</label>
              <input className="input-field" type="number" value={form.area_acres} onChange={(e) => set('area_acres', e.target.value)} placeholder="2.5" />
            </div>
            <div>
              <label className="label">Season</label>
              <select className="input-field" value={form.season} onChange={(e) => set('season', e.target.value)}>
                {SEASONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Soil Type</label>
            <select className="input-field" value={form.soil_type} onChange={(e) => set('soil_type', e.target.value)}>
              {SOIL_TYPES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save Field'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FarmProfile() {
  const { isDemo }    = useAuth()
  const [farm, setFarm]     = useState(null)
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(null)

  const reload = () => {
    setLoading(true)
    if (isDemo) {
      setFarm(MOCK_FARM)
      setFields(MOCK_FARM.fields)
      setLoading(false)
      return
    }
    getMyFarm()
      .then((res) => {
        setFarm(res.data.farm)
        return getFields(res.data.farm?.id)
      })
      .then((res) => setFields(res.data.fields || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(reload, [isDemo])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this field?')) return
    if (!isDemo) await deleteField(id)
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        {isDemo && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
            <p className="text-xs text-amber-700 font-body">🧪 <strong>Demo Mode</strong> — showing Patel Farm in Anand, Gujarat</p>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="font-heading font-bold text-2xl text-gray-900">🚜 Farm Profile</h1>
              <p className="text-sm text-gray-500 font-body mt-1">Your farm details and fields</p>
            </div>
            <button onClick={() => setModal('add')} id="btn-add-field" className="btn-primary text-sm">+ Add Field</button>
          </div>

          {/* Farm details */}
          {loading ? (
            <div className="card h-24 animate-pulse bg-gray-50 mb-6" />
          ) : farm && (
            <div className="card mb-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Farm Name',  value: farm.name },
                  { label: 'Location',   value: `${farm.village}, ${farm.district}, ${farm.state}` },
                  { label: 'Soil Type',  value: farm.soil_type },
                  { label: 'Total Area', value: `${farm.total_area_acres} acres` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 font-body uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 font-body">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="font-heading font-semibold text-gray-800 mb-3">Fields ({loading ? '…' : fields.length})</h2>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="card h-36 animate-pulse bg-gray-50" />)}
            </div>
          ) : fields.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((f) => (
                <div key={f.id} className="relative group">
                  <FieldCard field={f} onEdit={() => setModal(f)} />
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-danger text-xs hover:bg-danger/10 px-2 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <span className="text-4xl">🌱</span>
              <p className="text-sm text-gray-500 font-body mt-2">No fields yet. Add your first field!</p>
            </div>
          )}
        </main>
      </div>

      {modal && (
        <FieldModal
          field={modal === 'add' ? null : modal}
          farmId={farm?.id}
          isDemo={isDemo}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); reload() }}
        />
      )}
    </div>
  )
}
