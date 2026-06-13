import JobCard from './JobCard'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gray-200 rounded-md shrink-0" />
        <div className="h-3 bg-gray-200 rounded w-28" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-gray-100 rounded w-16" />
        <div className="h-5 bg-gray-100 rounded w-20" />
        <div className="h-5 bg-gray-100 rounded w-14" />
      </div>
    </div>
  )
}

function EmptyState({ hasSearched, emptyMessage }) {
  const title = emptyMessage?.title ?? (hasSearched ? 'No jobs found' : 'Search across multiple job boards')
  const subtitle = emptyMessage?.subtitle ?? (hasSearched ? 'Try different keywords or enable more sources' : 'Enter a job title or keyword above to get started')
  const icon = emptyMessage ? '🔖' : '🔍'

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-24 text-gray-400">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-lg font-medium text-gray-600">{title}</p>
      <p className="text-sm mt-1">{subtitle}</p>
    </div>
  )
}

export default function JobGrid({ jobs, isLoading, error, savedJobIds, onToggleSave, hasSearched, emptyMessage }) {
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p className="font-medium">Something went wrong</p>
          <p className="text-sm mt-1 text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (jobs.length === 0) {
    return <EmptyState hasSearched={hasSearched} emptyMessage={emptyMessage} />
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-4">{jobs.length} results</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={savedJobIds.has(job.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </div>
  )
}
