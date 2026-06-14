import { API_SOURCES, LINK_BOARDS } from '../data/jobBoards'

const CATEGORIES = ['General', 'Tech', 'Startup', 'Remote', 'India']

export default function Sidebar({ enabledSources, onToggleSource, searchParams, savedCount, view, onViewChange }) {
  const { query = '', location = '' } = searchParams

  const boardsByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = LINK_BOARDS.filter((b) => b.category === cat)
    return acc
  }, {})

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col overflow-y-auto border-r border-slate-800">
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight leading-none">JobHub</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-none">Unified Job Search</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-slate-800 flex flex-col gap-0.5">
        <button
          onClick={() => onViewChange('search')}
          className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-sm w-full transition-colors ${
            view === 'search'
              ? 'bg-slate-700 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          Search Results
        </button>
        <button
          onClick={() => onViewChange('saved')}
          className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-sm w-full transition-colors ${
            view === 'saved'
              ? 'bg-slate-700 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill={view === 'saved' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a1 1 0 011 1v17l-7-3.5L5 21V4a1 1 0 011-1z" />
          </svg>
          Saved Jobs
          {savedCount > 0 && (
            <span className="ml-auto bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
              {savedCount}
            </span>
          )}
        </button>
      </div>

      <div className="px-4 py-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          API Sources
        </p>
        <div className="flex flex-col gap-2">
          {API_SOURCES.map((source) => {
            const enabled = enabledSources.has(source.id)
            return (
              <label key={source.id} className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => onToggleSource(source.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-8 h-4 rounded-full transition-colors ${
                      enabled ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                        enabled ? 'translate-x-4' : ''
                      }`}
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 leading-tight">{source.name}</p>
                  <p className="text-xs text-slate-500 truncate">{source.description}</p>
                </div>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: source.color }}
                />
              </label>
            )
          })}
        </div>
      </div>

      <div className="px-4 py-4 flex-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Open in Browser
        </p>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="mb-3">
              <p className="text-xs text-slate-500 font-medium mb-1.5 pl-1">{cat}</p>
              {boardsByCategory[cat].map((board) => (
                <a
                  key={board.id}
                  href={board.buildUrl(query, location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={board.description}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group"
                >
                  <span className="text-base leading-none">{board.emoji}</span>
                  <span className="truncate">{board.name}</span>
                  <svg
                    className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 text-slate-400 shrink-0"
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                  >
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
