import { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import SearchForm from './components/SearchForm'
import JobGrid from './components/JobGrid'
import WelcomeState from './components/WelcomeState'
import Footer from './components/Footer'
import { API_SOURCES } from './data/jobBoards'
import { relativeTime } from './utils/time'

function loadSavedJobs() {
  try {
    const raw = localStorage.getItem('jobhub:saved-jobs')
    return raw ? new Map(Object.entries(JSON.parse(raw))) : new Map()
  } catch {
    return new Map()
  }
}

function persistSavedJobs(map) {
  try {
    localStorage.setItem('jobhub:saved-jobs', JSON.stringify(Object.fromEntries(map)))
  } catch {}
}

function loadSearchHistory() {
  try {
    const raw = localStorage.getItem('jobhub:search-history')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistSearchHistory(arr) {
  try {
    localStorage.setItem('jobhub:search-history', JSON.stringify(arr))
  } catch {}
}

export default function App() {
  const [view, setView] = useState('search')
  const [searchParams, setSearchParams] = useState({ query: '', location: '' })
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [enabledSources, setEnabledSources] = useState(
    () => new Set(API_SOURCES.map((s) => s.id))
  )
  const [savedJobs, setSavedJobs] = useState(loadSavedJobs)
  const [searchHistory, setSearchHistory] = useState(loadSearchHistory)
  const [showLoader, setShowLoader] = useState(true)
  const [loaderFading, setLoaderFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setLoaderFading(true), 1500)
    const hideTimer = setTimeout(() => setShowLoader(false), 2500)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  const savedJobIds = new Set(savedJobs.keys())

  const handleSearch = useCallback(
    async (params) => {
      setView('search')
      setSearchParams(params)
      setHasSearched(true)
      setIsLoading(true)
      setError(null)
      setJobs([])

      if (params.query.trim()) {
        setSearchHistory((prev) => {
          const entry = { query: params.query.trim(), location: params.location.trim(), timestamp: Date.now() }
          const filtered = prev.filter((h) => !(h.query === entry.query && h.location === entry.location))
          const next = [entry, ...filtered].slice(0, 50)
          persistSearchHistory(next)
          return next
        })
      }

      const activeSources = API_SOURCES.filter((s) => enabledSources.has(s.id))

      if (activeSources.length === 0) {
        setError('No API sources enabled. Toggle sources in the sidebar.')
        setIsLoading(false)
        return
      }

      const results = await Promise.allSettled(
        activeSources.map((s) => s.fetchJobs(params.query, params.location))
      )

      const allJobs = results.flatMap((result, i) => {
        if (result.status === 'fulfilled') return result.value
        console.warn(`[${activeSources[i].name}] fetch failed:`, result.reason)
        return []
      })

      setJobs(allJobs)
      setIsLoading(false)
    },
    [enabledSources]
  )

  const toggleSaveJob = useCallback((jobId, jobObject) => {
    setSavedJobs((prev) => {
      const next = new Map(prev)
      if (next.has(jobId)) next.delete(jobId)
      else if (jobObject) next.set(jobId, jobObject)
      persistSavedJobs(next)
      return next
    })
  }, [])

  const toggleSource = useCallback((id) => {
    setEnabledSources((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([])
    persistSearchHistory([])
  }, [])

  const removeHistoryEntry = useCallback((timestamp) => {
    setSearchHistory((prev) => {
      const next = prev.filter((h) => h.timestamp !== timestamp)
      persistSearchHistory(next)
      return next
    })
  }, [])

  const showResults = (hasSearched && view === 'search') || view === 'saved'
  const showCompactHeader = showResults || view === 'history'
  const displayedJobs = view === 'saved' ? [...savedJobs.values()] : jobs

  return (
    <>
    {showLoader && (
      <div className={`fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${loaderFading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white tracking-tight">JobHub</p>
            <p className="text-sm text-slate-400 mt-0.5">Unified Job Search</p>
          </div>
          <svg className="animate-spin w-5 h-5 text-blue-500 mt-1" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </div>
    )}
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <Sidebar
        enabledSources={enabledSources}
        onToggleSource={toggleSource}
        searchParams={searchParams}
        savedCount={savedJobs.size}
        view={view}
        onViewChange={setView}
        searchHistory={searchHistory}
        onSearch={handleSearch}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Compact search header — shown after first search, in saved view, or history view */}
        {showCompactHeader && (
          <header className="bg-white border-b border-gray-200 px-6 py-3 shrink-0 flex items-center gap-4">
            <div className="flex-1">
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            </div>
            <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
              {API_SOURCES.filter((s) => enabledSources.has(s.id)).length} sources active
            </span>
          </header>
        )}

        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Welcome hero — shown before first search */}
          {!showResults && view !== 'history' && (
            <WelcomeState onSearch={handleSearch} isLoading={isLoading} searchHistory={searchHistory} />
          )}

          {/* Search history view */}
          {view === 'history' && (
            <div className="px-6 py-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">Search History</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {searchHistory.length}
                  </span>
                </div>
                {searchHistory.length > 0 && (
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {searchHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
                  <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No search history yet</p>
                  <p className="text-xs mt-1 text-gray-300">Searches will appear here once you start searching</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-w-2xl">
                  {searchHistory.map((entry) => (
                    <div
                      key={entry.timestamp}
                      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm group hover:border-blue-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                      </svg>
                      <button
                        className="flex-1 text-left min-w-0 cursor-pointer"
                        onClick={() => handleSearch({ query: entry.query, location: entry.location })}
                      >
                        <span className="text-sm font-medium text-gray-800">{entry.query}</span>
                        {entry.location && (
                          <span className="text-xs text-gray-400 ml-2">in {entry.location}</span>
                        )}
                      </button>
                      <span className="text-xs text-gray-400 shrink-0">
                        {relativeTime(new Date(entry.timestamp).toISOString())}
                      </span>
                      <button
                        onClick={() => removeHistoryEntry(entry.timestamp)}
                        title="Remove"
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all shrink-0 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results / saved view */}
          {showResults && (
            <div className="px-6 py-5 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-4">
                {view === 'saved' ? (
                  <>
                    <span className="text-sm font-semibold text-gray-800">Saved Jobs</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      {savedJobs.size}
                    </span>
                  </>
                ) : searchParams.query ? (
                  <>
                    <span className="text-sm text-gray-500">Results for</span>
                    <span className="text-sm font-semibold text-gray-800">"{searchParams.query}"</span>
                    {searchParams.location && (
                      <>
                        <span className="text-sm text-gray-400">in</span>
                        <span className="text-sm font-medium text-gray-700">{searchParams.location}</span>
                      </>
                    )}
                  </>
                ) : null}
              </div>

              <JobGrid
                jobs={displayedJobs}
                isLoading={isLoading && view === 'search'}
                error={view === 'search' ? error : null}
                savedJobIds={savedJobIds}
                onToggleSave={toggleSaveJob}
                hasSearched
                emptyMessage={
                  view === 'saved'
                    ? { title: 'No saved jobs yet', subtitle: 'Bookmark jobs from search results to see them here' }
                    : undefined
                }
              />
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
    </>
  )
}
