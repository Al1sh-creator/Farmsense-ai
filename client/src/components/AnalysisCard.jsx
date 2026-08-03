import React from 'react'

export default function AnalysisCard({ analysis }) {
  if (!analysis) return null

  const { crop_recommendation, fertilizer_plan, yield_prediction, profit_estimate } = analysis

  return (
    <div className="card bg-gradient-to-br from-green-50 to-emerald-100 border-emerald-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold text-emerald-900 text-lg flex items-center gap-2">
          <span>🧠</span> AI Analysis Results
        </h2>
        <span className="text-xs font-medium text-emerald-700 bg-emerald-200/50 px-2.5 py-1 rounded-full">
          {new Date(analysis.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 p-3 rounded-xl">
          <p className="text-xs text-emerald-700 font-medium mb-1">Recommended Crop</p>
          <p className="font-heading font-bold text-gray-900 text-lg capitalize">{crop_recommendation.recommended_crop}</p>
        </div>
        
        <div className="bg-white/60 p-3 rounded-xl">
          <p className="text-xs text-emerald-700 font-medium mb-1">Fertilizer Plan</p>
          <p className="font-heading font-bold text-gray-900 text-lg capitalize">{fertilizer_plan.recommended_fertilizer}</p>
          <p className="text-xs text-gray-500 mt-1">{fertilizer_plan.quantity}</p>
        </div>

        <div className="bg-white/60 p-3 rounded-xl">
          <p className="text-xs text-emerald-700 font-medium mb-1">Predicted Yield</p>
          <p className="font-heading font-bold text-gray-900 text-lg">{yield_prediction.yield_per_acre} Qt/Ac</p>
          <p className="text-xs text-gray-500 mt-1 capitalize">{yield_prediction.confidence} Confidence</p>
        </div>

        <div className="bg-white/60 p-3 rounded-xl">
          <p className="text-xs text-emerald-700 font-medium mb-1">Irrigation Need</p>
          <p className="font-heading font-bold text-gray-900 text-lg capitalize">{analysis.irrigation_plan.irrigation_need}</p>
        </div>
      </div>
    </div>
  )
}
