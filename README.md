# JobHub — Unified Job Search

> Search once. Hit every board.

JobHub queries multiple job APIs in parallel and surfaces results in one clean interface. No backend, no login, no API keys required.

**Built by [Rajarsi Saha](https://www.linkedin.com/in/rajarsi-saha-2709a297/)**

---

## Features

- **Multi-source live search** — Remotive, Arbeitnow, and The Muse queried simultaneously
- **18 link boards** — LinkedIn, Indeed, Naukri, YC, Wellfound, and more open with your query pre-filled
- **Location autocomplete** — debounced Nominatim (OpenStreetMap) suggestions, no API key needed
- **Save jobs** — bookmark any listing; persists across sessions via `localStorage`
- **Source toggles** — enable or disable individual API sources per search
- **Responsive grid** — 1 → 2 → 3 column layout that adapts to viewport width
- **Popular searches** — one-click shortcuts on the welcome screen

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (Vite plugin, no config file) |
| Location API | OpenStreetMap Nominatim (free, no key) |
| Job APIs | Remotive, Arbeitnow, The Muse (free, no key) |
| Persistence | `localStorage` |

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | Description |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | ESLint |

---

## Project Structure

```
src/
├── App.jsx                  # Root layout, all shared state, search orchestration
├── index.css                # Single Tailwind import
├── main.jsx                 # React entry point
├── data/
│   └── jobBoards.js         # All API + link board configs — add new sources here
├── components/
│   ├── Sidebar.jsx          # Nav, source toggles, link board list
│   ├── WelcomeState.jsx     # Hero shown before first search
│   ├── SearchForm.jsx       # Keyword + location bar
│   ├── LocationInput.jsx    # Debounced Nominatim autocomplete with keyboard nav
│   ├── JobCard.jsx          # Job listing card with save toggle
│   ├── JobGrid.jsx          # Responsive grid, skeleton loader, empty states
│   └── Footer.jsx           # Copyright + API attribution
└── utils/
    └── time.js              # relativeTime() — ISO date → "3d ago"
```

---

## Live API Sources

Queried on every search. No registration needed.

| Source | What it covers | Location handling |
|---|---|---|
| [Remotive](https://remotive.com/api/remote-jobs) | Remote tech jobs | Client-side filter |
| [Arbeitnow](https://www.arbeitnow.com/api/job-board-api) | Global & visa-sponsored jobs | Client-side filter |
| [The Muse](https://www.themuse.com/api/public/jobs) | Company culture & careers | API param (city name) |

Each source appears as a toggle in the sidebar and as a card on the welcome screen.

---

## Link Boards

Open in new tabs with your search query pre-filled.

| Category | Boards |
|---|---|
| General | LinkedIn, Indeed, Glassdoor, SimplyHired |
| Tech | Dice, Built In, Levels.fyi, HN: Who's Hiring |
| Startup | Wellfound, YC Work at a Startup |
| Remote | Remote OK, We Work Remotely |
| India | Naukri, Foundit, Shine, TimesJobs, Hirist, Internshala |

---

## Extending JobHub

### Add a live API source

1. Add an entry to `API_SOURCES` in `src/data/jobBoards.js`
2. Implement `fetchJobs(query, location)` returning an array shaped like:

```js
{
  id: string,          // unique — prefix with source id, e.g. "mysource-123"
  title: string,
  company: string,
  location: string,
  remote: boolean,
  url: string,
  postedAt: string,    // ISO date string
  salary: string | null,
  tags: string[],
  source: string,
  sourceName: string,
  sourceColor: string, // hex color for badge
}
```

### Add a link board

Add an entry to `LINK_BOARDS` in `src/data/jobBoards.js`:

```js
{
  id: 'myboard',
  name: 'My Board',
  description: 'Short description',
  emoji: '🔗',
  color: '#hex',
  category: 'General', // 'General' | 'Tech' | 'Startup' | 'Remote' | 'India'
  buildUrl: (query, location) =>
    `https://myboard.com/search?q=${encodeURIComponent(query)}`,
}
```

---

## Known Constraints

- **LinkedIn, Indeed, Glassdoor** block iframe embedding via `X-Frame-Options` — they open as link boards rather than live results.
- **Remotive & Arbeitnow** have no server-side location param; up to 50 results are fetched per search and filtered client-side down to 20.
- **Nominatim** requires one request per second max and a `User-Agent`. The location input debounces at 300 ms to stay within policy.

---

## License

For personal use only.
