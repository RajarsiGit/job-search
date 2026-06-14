import { API_SOURCES } from '../data/jobBoards'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-between gap-4 text-xs text-gray-400">
      <span className="font-medium text-gray-500">
        © {year} JobHub
      </span>

      <div className="flex items-center gap-1.5">
        <span>Powered by</span>
        {API_SOURCES.map((source, i) => (
          <span key={source.id} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300">·</span>}
            <span
              className="font-medium"
              style={{ color: source.color }}
            >
              {source.name}
            </span>
          </span>
        ))}
      </div>

      <span className="text-gray-400">
        Built by{' '}
        <a
          href="https://www.linkedin.com/in/rajarsi-saha-2709a297/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          Rajarsi Saha
        </a>
        {' '}· For personal use only
      </span>
    </footer>
  )
}
