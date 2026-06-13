import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import SearchForm from './components/SearchForm'
import JobGrid from './components/JobGrid'
import WelcomeState from './components/WelcomeState'
import Footer from './components/Footer'
import { API_SOURCES } from './data/jobBoards'

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

  const savedJobIds = new Set(savedJobs.keys())

  const handleSearch = useCallback(
    async (params) => {
      setView('search')
      setSearchParams(params)
      setHasSearched(true)
      setIsLoading(true)
      setError(null)
      setJobs([])

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

  const showResults = hasSearched || view === 'saved'
  const displayedJobs = view === 'saved' ? [...savedJobs.values()] : jobs

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <Sidebar
        enabledSources={enabledSources}
        onToggleSource={toggleSource}
        searchParams={searchParams}
        savedCount={savedJobs.size}
        view={view}
        onViewChange={setView}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Compact search header — only shown after first search or in saved view */}
        {showResults && (
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
          {!showResults && (
            <WelcomeState onSearch={handleSearch} isLoading={isLoading} />
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
  )
}
