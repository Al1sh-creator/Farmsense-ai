/**
 * FieldCard — farm field status card
 * Props: field { id, name, crop_name, crop_stage, area_acres, soil_type, last_updated }
 *        onEdit (optional)
 */
export default function FieldCard({ field, onEdit }) {
  const stageColors = {
    sowing:    'badge-info',
    growing:   'badge-success',
    flowering: 'badge-warning',
    harvest:   'badge-danger',
  }

  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-200 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-heading font-semibold text-gray-800">{field.name}</h4>
          <p className="text-xs text-gray-500 font-body">{field.soil_type} soil</p>
        </div>
        <span className="text-2xl">🌱</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-body">Crop</span>
          <span className="text-sm font-medium text-gray-800 font-body">{field.crop_name || '—'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-body">Stage</span>
          {field.crop_stage ? (
            <span className={stageColors[field.crop_stage] || 'badge-info'}>
              {field.crop_stage}
            </span>
          ) : <span className="text-sm text-gray-400">—</span>}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-body">Area</span>
          <span className="text-sm font-stat font-medium text-gray-800">
            {field.area_acres} acres
          </span>
        </div>
      </div>

      {onEdit && (
        <button
          onClick={() => onEdit(field)}
          id={`btn-edit-field-${field.id}`}
          className="mt-4 w-full text-sm text-primary hover:bg-light rounded-lg py-2 font-medium transition-all"
        >
          Edit Field
        </button>
      )}
    </div>
  )
}
