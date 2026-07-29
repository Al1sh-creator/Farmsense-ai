import api from './apiClient'

// Body: { farm_id, season, crop_ids[], land_size }
export const compareCrops = (data) => api.post('/api/crops/compare', data)
