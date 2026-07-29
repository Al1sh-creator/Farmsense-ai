import api from './apiClient'

export const getSuggestions = (farmId) => api.get(`/api/suggestions?farm_id=${farmId}`)
