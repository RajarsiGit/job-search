import { useState, useEffect, useRef, useCallback } from 'react'

function formatSuggestion(item) {
  const a = item.address ?? {}
  const city = a.city || a.town || a.village || a.municipality || item.name
  const state = a.state
  const country = a.country
  if (city && state && country) return `${city}, ${state}, ${country}`
  if (city && country) return `${city}, ${country}`
  return item.display_name.split(',').slice(0, 3).join(',').trim()
}

export default function LocationInput({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const abortRef = useRef(null)
  const debounceRef = useRef(null)

  const fetchSuggestions = useCallback(async (query) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setIsFetching(true)
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '6',
        addressdetails: '1',
        featuretype: 'city',
      })
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          signal: abortRef.current.signal,
          headers: { 'Accept-Language': 'en' },
        }
      )
      const data = await res.json()
      setSuggestions(data.map((item) => formatSuggestion(item)))
      setIsOpen(true)
      setActiveIndex(-1)
    } catch (err) {
      if (err.name !== 'AbortError') setSuggestions([])
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(value.trim()), 300)
    return () => clearTimeout(debounceRef.current)
  }, [value, fetchSuggestions])

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function handleKeyDown(e) {
    if (!isOpen || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      select(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  function select(suggestion) {
    onChange(suggestion)
    setIsOpen(false)
    setSuggestions([])
  }

  return (
    <div ref={containerRef} className="relative w-56">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>

      {isFetching && (
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}

      <input
        type="text"
        placeholder="Location (optional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        autoComplete="off"
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
      />

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); select(s) }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                  i === activeIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span className="truncate">{s}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
