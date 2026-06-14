import { useState } from 'react'
import LocationInput from './LocationInput'

export default function SearchForm({ onSearch, isLoading }) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch({ query: query.trim(), location: location.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <div className="flex-1 relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Job title, keywords, or company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
        />
      </div>

      <LocationInput value={location} onChange={setLocation} />

      <button
        type="submit"
        disabled={isLoading}
        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Searching…
          </>
        ) : (
          'Search All'
        )}
      </button>
    </form>
  )
}
