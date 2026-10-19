export interface WeatherLocation {
  name: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}

export interface CurrentWeather {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  pressure: number
  description: string
  icon: string
  low: number
  high: number
  timezone: string
}

interface GeocodingResponse {
  results?: WeatherLocation[]
}

interface ForecastResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    weather_code: number
    wind_speed_10m: number
    surface_pressure: number
  }
  daily: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
  timezone: string
}

export async function searchWeather(city: string): Promise<{
  location: WeatherLocation
  weather: CurrentWeather
}> {
  const query = city.trim()
  if (!query) {
    throw new Error('Enter a city or town to search.')
  }

  const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
  geocodingUrl.search = new URLSearchParams({
    name: query,
    count: '1',
    language: 'en',
    format: 'json',
  }).toString()

  const geocodingResponse = await fetch(geocodingUrl)
  if (!geocodingResponse.ok) {
    throw new Error('Could not search for that place. Please try again.')
  }

  const geocoding = (await geocodingResponse.json()) as GeocodingResponse
  const location = geocoding.results?.[0]
  if (!location) {
    throw new Error(`We couldn't find "${query}". Try another city.`)
  }

  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast')
  forecastUrl.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure',
    daily: 'temperature_2m_max,temperature_2m_min',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '1',
  }).toString()

  const forecastResponse = await fetch(forecastUrl)
  if (!forecastResponse.ok) {
    throw new Error('Weather data is unavailable right now. Please try again.')
  }

  const forecast = (await forecastResponse.json()) as ForecastResponse
  const code = forecast.current.weather_code

  return {
    location,
    weather: {
      temperature: forecast.current.temperature_2m,
      feelsLike: forecast.current.apparent_temperature,
      humidity: forecast.current.relative_humidity_2m,
      windSpeed: forecast.current.wind_speed_10m,
      pressure: forecast.current.surface_pressure,
      description: describeWeather(code),
      icon: weatherIcon(code),
      low: forecast.daily.temperature_2m_min[0],
      high: forecast.daily.temperature_2m_max[0],
      timezone: forecast.timezone,
    },
  }
}

function describeWeather(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if ([45, 48].includes(code)) return 'Fog'
  if ([51, 53, 55].includes(code)) return 'Drizzle'
  if ([56, 57].includes(code)) return 'Freezing drizzle'
  if ([61, 63, 65].includes(code)) return 'Rain'
  if ([66, 67].includes(code)) return 'Freezing rain'
  if ([71, 73, 75, 77].includes(code)) return 'Snow'
  if ([80, 81, 82].includes(code)) return 'Rain showers'
  if ([85, 86].includes(code)) return 'Snow showers'
  if (code === 95) return 'Thunderstorm'
  if ([96, 99].includes(code)) return 'Thunderstorm with hail'
  return 'Weather unavailable'
}

function weatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code === 1 || code === 2) return '🌤️'
  if (code === 3) return '☁️'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️'
  if ([95, 96, 99].includes(code)) return '⛈️'
  return '🌡️'
}
