import { API_SOURCES } from '../data/jobBoards'
import SearchForm from './SearchForm'

const POPULAR = [
  'Software Engineer', 'Product Manager', 'Data Scientist',
  'Frontend Developer', 'DevOps Engineer', 'UX Designer',
]

export default function WelcomeState({ onSearch, isLoading }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
      <div className="w-full max-w-2xl flex flex-col items-center">

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            Find your next opportunity
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Search across {API_SOURCES.length} live job boards at once — no tab-switching needed.
          </p>
        </div>

        {/* Search */}
        <div className="w-full mb-6">
          <SearchForm onSearch={onSearch} isLoading={isLoading} />
        </div>

        {/* Popular chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <span className="text-xs text-gray-400 self-center mr-1">Try:</span>
          {POPULAR.map((q) => (
            <button
              key={q}
              onClick={() => onSearch({ query: q, location: '' })}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Source cards */}
        <div className="w-full grid grid-cols-3 gap-3">
          {API_SOURCES.map((source) => (
            <div
              key={source.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-sm font-semibold text-gray-800">{source.name}</span>
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Live
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-snug">{source.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
