# JobHub — Unified Job Search

A single-pane-of-glass job search dashboard that queries multiple job boards simultaneously, so you never need to switch tabs.

## Features

- **Multi-source search** — fetches live results from Remotive, Arbeitnow, and The Muse in parallel
- **Quick-link boards** — 12 external boards (LinkedIn, Indeed, Glassdoor, Dice, Wellfound, etc.) open with your search query pre-filled
- **Location autocomplete** — powered by OpenStreetMap Nominatim, no API key required
- **Save jobs** — bookmark any listing; saved jobs persist across sessions via localStorage
- **Source toggles** — enable or disable individual API sources per search
- **Popular searches** — one-click shortcuts on the welcome screen
- **Responsive grid** — 1 → 2 → 3 column layout adapts to viewport width

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (Vite plugin) |
| Location API | OpenStreetMap Nominatim (free, no key) |
| Job APIs | Remotive, Arbeitnow, The Muse (all free, no key) |
| Persistence | localStorage |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── data/
│   └── jobBoards.js        # API source configs + fetch functions, link board configs
├── components/
│   ├── Footer.jsx           # Attribution + copyright bar
│   ├── JobCard.jsx          # Individual job listing card
│   ├── JobGrid.jsx          # Responsive grid with skeleton loading
│   ├── LocationInput.jsx    # Debounced location autocomplete
│   ├── SearchForm.jsx       # Keyword + location search bar
│   ├── Sidebar.jsx          # Nav, source toggles, link boards
│   └── WelcomeState.jsx     # Hero screen shown before first search
├── utils/
│   └── time.js              # Relative time formatter
├── App.jsx                  # Root layout + shared state
├── index.css                # Tailwind import
└── main.jsx                 # React entry point
```

## API Sources

| Source | Notes |
|---|---|
| [Remotive](https://remotive.com/api/remote-jobs) | Remote-only jobs; location filtered client-side |
| [Arbeitnow](https://www.arbeitnow.com/api/job-board-api) | Global jobs; location filtered client-side |
| [The Muse](https://www.themuse.com/api/public/jobs) | Supports server-side city-name location filter |

All three APIs are free and CORS-enabled — no registration or API keys needed.

## Adding a New API Source

1. Add an entry to the `API_SOURCES` array in `src/data/jobBoards.js`
2. Implement `fetchJobs(query, location)` returning an array of job objects with the standard shape:

```js
{
  id, title, company, location, remote,
  url, postedAt, salary, tags,
  source, sourceName, sourceColor
}
```

## Adding a New Link Board

Add an entry to `LINK_BOARDS` in `src/data/jobBoards.js`:

```js
{
  id, name, description, emoji, color,
  category,  // 'General' | 'Tech' | 'Startup' | 'Remote'
  buildUrl: (query, location) => `https://...`
}
```

## License

MIT
