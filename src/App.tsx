import { FormEvent, useState } from 'react'
import {
  CurrentWeather,
  searchWeather,
  WeatherLocation,
} from './weather'

type Unit = 'C' | 'F'

const popularCities = ['London', 'Tokyo', 'New York', 'Nairobi']

function convertTemperature(value: number, unit: Unit): number {
  return unit === 'F' ? (value * 9) / 5 + 32 : value
}

function getLocalTime(timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date())
}

function App() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState<WeatherLocation | null>(null)
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const [unit, setUnit] = useState<Unit>('C')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(city: string) {
    setQuery(city)
    setError('')
    setIsLoading(true)

    try {
      const result = await searchWeather(city)
      setLocation(result.location)
      setWeather(result.weather)
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : 'Something went wrong while loading the weather.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void handleSearch(query)
  }

  const temperature = (value: number) =>
    Math.round(convertTemperature(value, unit))
  const placeName = location
    ? [location.name, location.country].filter(Boolean).join(', ')
    : ''

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Weatherly home">
          <span className="brand__icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M8.5 22.5a6.5 6.5 0 0 1 .6-13 8.5 8.5 0 0 1 16.3 2.1 5.5 5.5 0 0 1-.9 10.9H8.5Z" />
              <path d="m12 26-1 2m8-2-1 2m8-2-1 2" />
            </svg>
          </span>
          <span>weatherly</span>
        </a>
        <span className="topbar__tagline">A little closer to the sky.</span>
      </header>

      <section className="weather-page">
        <div className="page-heading">
          <span className="eyebrow">YOUR PERSONAL WEATHER</span>
          <h1>Weather, wherever you are.</h1>
          <p>Find current conditions for any place in the world.</p>
        </div>

        <form className="search-form" onSubmit={submitSearch}>
          <label className="search-form__field">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <span className="sr-only">Search for a city</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a city or town..."
              autoComplete="off"
            />
          </label>
          <button className="search-form__button" type="submit" disabled={isLoading}>
            {isLoading ? <span className="spinner" aria-label="Loading" /> : 'Search'}
          </button>
        </form>

        <div className="quick-search" aria-label="Popular cities">
          <span>Try:</span>
          {popularCities.map((city) => (
            <button
              className="city-chip"
              key={city}
              onClick={() => void handleSearch(city)}
              type="button"
              disabled={isLoading}
            >
              {city}
            </button>
          ))}
        </div>

        {error && (
          <p className="error-message" role="alert">
            <span aria-hidden="true">!</span> {error}
          </p>
        )}

        {weather && location ? (
          <section className="weather-card" aria-label={`Weather in ${placeName}`}>
            <div className="weather-card__main">
              <div className="weather-card__topline">
                <div>
                  <span className="eyebrow eyebrow--light">CURRENT CONDITIONS</span>
                  <h2>{placeName}</h2>
                  <p className="weather-card__time">
                    Local time <span>{getLocalTime(weather.timezone)}</span>
                  </p>
                </div>
                <div className="unit-toggle" aria-label="Temperature unit">
                  <button
                    className={unit === 'C' ? 'is-selected' : ''}
                    onClick={() => setUnit('C')}
                    type="button"
                    aria-pressed={unit === 'C'}
                  >
                    °C
                  </button>
                  <span />
                  <button
                    className={unit === 'F' ? 'is-selected' : ''}
                    onClick={() => setUnit('F')}
                    type="button"
                    aria-pressed={unit === 'F'}
                  >
                    °F
                  </button>
                </div>
              </div>

              <div className="weather-card__current">
                <div>
                  <div className="temperature">
                    {temperature(weather.temperature)}
                    <span>°{unit}</span>
                  </div>
                  <p className="weather-card__condition">{weather.description}</p>
                </div>
                <span
                  className="weather-icon"
                  role="img"
                  aria-label={weather.description}
                >
                  {weather.icon}
                </span>
              </div>

              <div className="weather-card__range">
                <span className="weather-card__range-label">Today</span>
                <span>Min {temperature(weather.low)}°</span>
                <span className="range-divider" />
                <span>Max {temperature(weather.high)}°</span>
                <span className="weather-card__feels">
                  Feels like {temperature(weather.feelsLike)}°
                </span>
              </div>
            </div>

            <div className="weather-details">
              <div className="weather-detail">
                <span className="weather-detail__icon weather-detail__icon--humidity">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3s6.5 7.1 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 10.1 12 3 12 3Z" />
                    <path d="M9 15a3 3 0 0 0 3 3" />
                  </svg>
                </span>
                <span className="weather-detail__label">Humidity</span>
                <strong>{weather.humidity}%</strong>
              </div>
              <div className="weather-detail">
                <span className="weather-detail__icon weather-detail__icon--wind">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 8h12a2.5 2.5 0 1 0-2.5-2.5M2 12h17a2.5 2.5 0 1 1-2.5 2.5M4 16h7a2 2 0 1 1-2 2" />
                  </svg>
                </span>
                <span className="weather-detail__label">Wind</span>
                <strong>{Math.round(weather.windSpeed)} <small>km/h</small></strong>
              </div>
              <div className="weather-detail">
                <span className="weather-detail__icon weather-detail__icon--sun">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 7h18M3 12h18M3 17h18" />
                    <circle cx="8" cy="7" r="2" />
                    <circle cx="16" cy="12" r="2" />
                    <circle cx="10" cy="17" r="2" />
                  </svg>
                </span>
                <span className="weather-detail__label">Pressure</span>
                <strong>{weather.pressure} <small>hPa</small></strong>
              </div>
            </div>
          </section>
        ) : (
          <section className="empty-state" aria-live="polite">
            <span className="empty-state__icon" aria-hidden="true">
              <svg viewBox="0 0 80 80" fill="none">
                <circle cx="49" cy="29" r="13" />
                <path d="M19 53a12 12 0 0 1 2-23.8A16 16 0 0 1 51.7 33H54a10 10 0 0 1 0 20H19Z" />
                <path d="m27 61-2 4m15-4-2 4m15-4-2 4" />
              </svg>
            </span>
            <h2>{isLoading ? 'Finding your forecast...' : 'The sky is your starting point.'}</h2>
            <p>
              {isLoading
                ? 'We’re checking the latest conditions for that location.'
                : 'Search a location above to see the latest conditions.'}
            </p>
          </section>
        )}

        <footer className="page-footer">
          <span>Current conditions for wherever life takes you.</span>
          <span className="page-footer__source">
            Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
          </span>
        </footer>
      </section>
    </main>
  )
}

export default App
