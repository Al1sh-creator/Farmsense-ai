import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createFarm, addField } from '../api/farmApi'
import { useAuth } from '../context/AuthContext'

const STEPS = ['Personal Info', 'Farm Location', 'First Field']

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
]

const SOIL_TYPES   = ['Black', 'Red', 'Alluvial', 'Laterite', 'Sandy', 'Loamy', 'Clayey']
const CROP_STAGES  = ['sowing', 'growing', 'flowering', 'harvest']
const SEASONS      = ['kharif', 'rabi', 'zaid']

export default function Onboarding() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  // Form data
  const [farmData, setFarmData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    state: 'Gujarat',
    district: '',
    taluka: '',
    village: '',
    pincode: '',
    soil_type: 'Black',
    total_area_acres: '',
    latitude: '',
    longitude: '',
  })
  const [fieldData, setFieldData] = useState({
    name: 'Field 1',
    crop_name: '',
    crop_stage: 'growing',
    area_acres: '',
    soil_type: 'Black',
    season: 'kharif',
  })

  const setFarm  = (k, v) => setFarmData((p) => ({ ...p, [k]: v }))
  const setField = (k, v) => setFieldData((p) => ({ ...p, [k]: v }))

  const handleNext = () => { setError(''); setStep((s) => s + 1) }
  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const farmRes = await createFarm(farmData)
      const farmId  = farmRes.data.farm?.id
      if (farmId && fieldData.crop_name) {
        await addField(farmId, fieldData)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${i < step ? 'bg-secondary text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-primary' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-secondary' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 animate-slide-up">
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-1">{STEPS[step]}</h2>
          <p className="text-sm text-gray-500 mb-6 font-body">Step {step + 1} of {STEPS.length}</p>

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-5 font-body">
              {error}
            </div>
          )}

          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" value={farmData.name}
                  onChange={(e) => setFarm('name', e.target.value)} placeholder="Ramesh Patel" />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input className="input-field" value={farmData.phone}
                  onChange={(e) => setFarm('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">Total Farm Area (acres)</label>
                <input className="input-field" type="number" value={farmData.total_area_acres}
                  onChange={(e) => setFarm('total_area_acres', e.target.value)} placeholder="e.g. 5" />
              </div>
            </div>
          )}

          {/* Step 1: Farm Location */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label">State</label>
                <select className="input-field" value={farmData.state} onChange={(e) => setFarm('state', e.target.value)}>
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">District</label>
                  <input className="input-field" value={farmData.district}
                    onChange={(e) => setFarm('district', e.target.value)} placeholder="Anand" />
                </div>
                <div>
                  <label className="label">Taluka</label>
                  <input className="input-field" value={farmData.taluka}
                    onChange={(e) => setFarm('taluka', e.target.value)} placeholder="Anklav" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Village</label>
                  <input className="input-field" value={farmData.village}
                    onChange={(e) => setFarm('village', e.target.value)} placeholder="Karamsad" />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input className="input-field" value={farmData.pincode}
                    onChange={(e) => setFarm('pincode', e.target.value)} placeholder="388325" />
                </div>
              </div>
              <div>
                <label className="label">Soil Type</label>
                <select className="input-field" value={farmData.soil_type} onChange={(e) => setFarm('soil_type', e.target.value)}>
                  {SOIL_TYPES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Latitude (optional)</label>
                  <input className="input-field" type="number" step="0.0001" value={farmData.latitude}
                    onChange={(e) => setFarm('latitude', e.target.value)} placeholder="22.4707" />
                </div>
                <div>
                  <label className="label">Longitude (optional)</label>
                  <input className="input-field" type="number" step="0.0001" value={farmData.longitude}
                    onChange={(e) => setFarm('longitude', e.target.value)} placeholder="72.9677" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: First Field */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">Field Name</label>
                <input className="input-field" value={fieldData.name}
                  onChange={(e) => setField('name', e.target.value)} placeholder="North Field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Current Crop</label>
                  <input className="input-field" value={fieldData.crop_name}
                    onChange={(e) => setField('crop_name', e.target.value)} placeholder="Kapas" />
                </div>
                <div>
                  <label className="label">Crop Stage</label>
                  <select className="input-field" value={fieldData.crop_stage} onChange={(e) => setField('crop_stage', e.target.value)}>
                    {CROP_STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Area (acres)</label>
                  <input className="input-field" type="number" value={fieldData.area_acres}
                    onChange={(e) => setField('area_acres', e.target.value)} placeholder="2.5" />
                </div>
                <div>
                  <label className="label">Season</label>
                  <select className="input-field" value={fieldData.season} onChange={(e) => setField('season', e.target.value)}>
                    {SEASONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-body">
                * You can add more fields later from Farm Profile
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={handleBack} className="btn-outline flex-1">← Back</button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={handleNext} className="btn-primary flex-1">Continue →</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting up…
                  </span>
                ) : 'Finish Setup 🚀'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
