import { relativeTime } from '../utils/time'

export default function JobCard({ job, isSaved, onToggleSave }) {
  const MAX_TAGS = 4

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md hover:border-gray-200 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: job.sourceColor }}
          >
            {job.company?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 truncate">{job.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: job.sourceColor }}
          >
            {job.sourceName}
          </span>
          <button
            onClick={() => onToggleSave(job.id, job)}
            title={isSaved ? 'Remove from saved' : 'Save job'}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              isSaved
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a1 1 0 011 1v17l-7-3.5L5 21V4a1 1 0 011-1z" />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 leading-snug cursor-pointer"
        >
          {job.title}
        </a>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {job.location}
        </span>
        {job.remote && (
          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
            Remote
          </span>
        )}
        {job.salary && (
          <span className="text-gray-500">{job.salary}</span>
        )}
      </div>

      {job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.tags.slice(0, MAX_TAGS).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > MAX_TAGS && (
            <span className="text-xs text-gray-400">+{job.tags.length - MAX_TAGS}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-gray-400">{relativeTime(job.postedAt)}</span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          View job
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>
    </div>
  )
}
