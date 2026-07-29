const CATEGORY_MAP = {
  irrigation:  { icon: '💧', color: 'text-info',      bg: 'bg-info/10'      },
  fertilizer:  { icon: '🧪', color: 'text-secondary', bg: 'bg-secondary/10' },
  pest_risk:   { icon: '🐛', color: 'text-warning',   bg: 'bg-warning/10'   },
  harvest:     { icon: '🌾', color: 'text-primary',   bg: 'bg-primary/10'   },
}

const PRIORITY_BADGE = {
  high:   'badge-danger',
  medium: 'badge-warning',
  low:    'badge-success',
}

/**
 * SuggestionCard — AI tip card
 * Props: suggestion { id, category, title, description, priority, created_at }
 */
export default function SuggestionCard({ suggestion }) {
  const cat = CATEGORY_MAP[suggestion.category] || {
    icon: '💡', color: 'text-gray-600', bg: 'bg-gray-100',
  }

  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-200 animate-slide-up">
      <div className="flex items-start gap-3">
        <span className={`text-2xl p-2.5 rounded-xl ${cat.bg} shrink-0`}>{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium capitalize font-body ${cat.color}`}>
              {suggestion.category?.replace('_', ' ')}
            </span>
            <span className={PRIORITY_BADGE[suggestion.priority] || 'badge-info'}>
              {suggestion.priority} priority
            </span>
          </div>
          <h4 className="mt-1.5 font-heading font-semibold text-gray-800 text-sm">
            {suggestion.title}
          </h4>
          <p className="mt-1 text-sm text-gray-600 font-body leading-relaxed">
            {suggestion.description}
          </p>
          <p className="mt-2 text-[11px] text-gray-400 font-mono">
            {new Date(suggestion.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
