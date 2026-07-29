import api from './apiClient'

export const getWeatherForecast = (farmId) =>
  api.get(`/api/weather/forecast?farm_id=${farmId}`)
