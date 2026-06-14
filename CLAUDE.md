# CLAUDE.md — JobHub

## Project Overview

Single-page React app that aggregates job listings from multiple sources into one interface. No backend — all data fetching happens client-side against free public APIs.

## Commands

```bash
npm run dev       # Start Vite dev server (default port 5173)
npm run build     # Production build → dist/
npm run preview   # Serve dist/ locally
npm run lint      # ESLint
```

## Architecture

### State management
All state lives in `App.jsx` and is passed down as props. No external state library. Key state:
- `jobs` — fetched results array
- `savedJobs` — `Map<id, jobObject>` persisted to localStorage under `jobhub:saved-jobs`
- `searchHistory` — array of `{ query, location, timestamp }` persisted to localStorage under `jobhub:search-history`; max 50 entries, most-recent-first, deduped by query+location
- `enabledSources` — `Set<sourceId>` of toggled-on API sources
- `hasSearched` / `view` — controls which main panel is shown

### Data layer (`src/data/jobBoards.js`)
Two exports:
- `API_SOURCES` — array of live API integrations, each with a `fetchJobs(query, location)` async function
- `LINK_BOARDS` — array of external boards with a `buildUrl(query, location)` function; these open in new tabs

### Location handling
Nominatim returns verbose strings like `"San Francisco, California, United States"`. Each API handles location differently:
- **Remotive** — no location param; client-side filter on `candidate_required_location` using `matchesLocation()`
- **Arbeitnow** — no location param; client-side filter on `location` field
- **The Muse** — accepts city name; use `cityOnly()` helper to strip country/state suffix before sending

### Views
- `view === 'search'` + `!hasSearched` → `WelcomeState` (hero + popular/recent chips + source cards)
- `view === 'search'` + `hasSearched` → compact header + `JobGrid`
- `view === 'saved'` → compact header + `JobGrid` fed from `savedJobs` map
- `view === 'history'` → compact header + full search history list (up to 50 entries, each re-runnable or individually deletable)

## Key Files

| File | Purpose |
|---|---|
| `src/App.jsx` | Root layout, all shared state, search orchestration |
| `src/data/jobBoards.js` | All API + link board configs; add new sources here |
| `src/components/Sidebar.jsx` | Nav (Search/Saved/History), recent searches, source toggles, link board list |
| `src/components/WelcomeState.jsx` | Landing hero with popular searches, recent search chips + source cards |
| `src/components/SearchForm.jsx` | Keyword input + LocationInput |
| `src/components/LocationInput.jsx` | Debounced Nominatim autocomplete with keyboard nav |
| `src/components/JobCard.jsx` | Job listing card; calls `onToggleSave(id, jobObject)` |
| `src/components/JobGrid.jsx` | Responsive 1-2-3 col grid; skeleton loader; empty states |
| `src/components/Footer.jsx` | Copyright + API attribution bar |
| `src/utils/time.js` | `relativeTime(dateStr)` — converts ISO date to "Xd ago" |

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin. Import is a single line in `src/index.css`:
```css
@import "tailwindcss";
```
No `tailwind.config.js` needed. All styling is utility classes inline in JSX.

## Adding a New API Source

1. Add an object to `API_SOURCES` in `src/data/jobBoards.js`
2. Implement `fetchJobs(query, location)` returning objects with this shape:

```js
{
  id: string,          // unique, prefix with source name e.g. "remotive-123"
  title: string,
  company: string,
  location: string,
  remote: boolean,
  url: string,
  postedAt: string,    // ISO date string
  salary: string|null,
  tags: string[],
  source: string,      // source id
  sourceName: string,  // display name
  sourceColor: string, // hex color for badge + avatar
}
```

3. The source will automatically appear in the sidebar toggle and WelcomeState source cards.

## Adding a New Link Board

Add to `LINK_BOARDS` in `src/data/jobBoards.js`:

```js
{
  id: 'myboard',
  name: 'My Board',
  description: 'Short description',
  emoji: '🔗',
  color: '#hex',
  category: 'General', // 'General' | 'Tech' | 'Startup' | 'Remote' | 'India'
  buildUrl: (query, location) => `https://myboard.com/search?q=${encodeURIComponent(query)}`,
}
```

## localStorage Keys

| Key | Value |
|---|---|
| `jobhub:saved-jobs` | JSON object keyed by job ID, values are full job objects |
| `jobhub:search-history` | JSON array of `{ query, location, timestamp }`, max 50, newest first |

## Known Constraints

- Most major job boards (LinkedIn, Indeed, Glassdoor) block iframe embedding via `X-Frame-Options`. The sidebar links open them in new tabs instead.
- Remotive and Arbeitnow have no server-side location filtering; client-side matching fetches more results than needed (up to 50) and filters down to 20.
- Nominatim has a usage policy: one request per second, must include a `User-Agent`. Current implementation debounces at 300 ms which is sufficient for interactive use.
