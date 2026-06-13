// Extract just the city name from a full location string like
// "San Francisco, California, United States" → "San Francisco"
function cityOnly(location) {
  if (!location) return ''
  return location.split(',')[0].trim()
}

// Loose client-side filter: checks whether any word from the city name
// appears in the job's location field. Used for APIs with no location param.
function matchesLocation(jobLocation, filterLocation) {
  if (!filterLocation) return true
  const city = cityOnly(filterLocation).toLowerCase()
  const loc = (jobLocation || '').toLowerCase()
  return city.split(' ').filter((w) => w.length > 2).some((w) => loc.includes(w))
}

export const API_SOURCES = [
  {
    id: 'remotive',
    name: 'Remotive',
    // Remote-only board — no location param. Filter client-side on
    // candidate_required_location (e.g. "USA", "Europe", "Worldwide").
    description: 'Remote tech jobs',
    locationSupport: 'client',
    color: '#10b981',
    fetchJobs: async (query, location) => {
      const params = new URLSearchParams({ search: query || '', limit: '50' });
      const res = await fetch(`https://remotive.com/api/remote-jobs?${params}`);
      if (!res.ok) throw new Error(`Remotive responded ${res.status}`);
      const data = await res.json();
      return (data.jobs || [])
        .filter((job) => matchesLocation(job.candidate_required_location, location))
        .slice(0, 20)
        .map((job) => ({
          id: `remotive-${job.id}`,
          title: job.title,
          company: job.company_name,
          location: job.candidate_required_location || 'Remote',
          remote: true,
          url: job.url,
          postedAt: job.publication_date,
          salary: job.salary || null,
          tags: job.tags || [],
          source: 'remotive',
          sourceName: 'Remotive',
          sourceColor: '#10b981',
        }));
    },
  },
  {
    id: 'arbeitnow',
    name: 'Arbeitnow',
    // Only accepts `q` for keywords. Filter client-side on the location field.
    description: 'Global & visa-sponsored jobs',
    locationSupport: 'client',
    color: '#6366f1',
    fetchJobs: async (query, location) => {
      const params = new URLSearchParams({ q: query || '' });
      const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?${params}`);
      if (!res.ok) throw new Error(`Arbeitnow responded ${res.status}`);
      const data = await res.json();
      return (data.data || [])
        .filter((job) => matchesLocation(job.location, location))
        .slice(0, 20)
        .map((job) => ({
          id: `arbeitnow-${job.slug}`,
          title: job.title,
          company: job.company_name,
          location: job.location || 'Remote',
          remote: job.remote || false,
          url: job.url,
          postedAt: new Date(job.created_at * 1000).toISOString(),
          salary: null,
          tags: job.tags || [],
          source: 'arbeitnow',
          sourceName: 'Arbeitnow',
          sourceColor: '#6366f1',
        }));
    },
  },
  {
    id: 'themuse',
    name: 'The Muse',
    // Accepts a `location` param but only matches its own city tags
    // (e.g. "San Francisco" not "San Francisco, California, United States").
    description: 'Company culture & careers',
    locationSupport: 'api',
    color: '#f59e0b',
    fetchJobs: async (query, location) => {
      const params = new URLSearchParams({ descending: 'true', page: '0' });
      if (query) params.set('query', query);
      if (location) params.set('location', cityOnly(location));
      const res = await fetch(`https://www.themuse.com/api/public/jobs?${params}`);
      if (!res.ok) throw new Error(`The Muse responded ${res.status}`);
      const data = await res.json();
      return (data.results || []).slice(0, 20).map((job) => ({
        id: `themuse-${job.id}`,
        title: job.name,
        company: job.company?.name || 'Unknown',
        location: job.locations?.map((l) => l.name).join(', ') || 'Flexible',
        remote: job.locations?.some((l) => l.name?.toLowerCase().includes('remote')) || false,
        url: job.refs?.landing_page || '#',
        postedAt: job.publication_date,
        salary: null,
        tags: job.levels?.map((l) => l.name) || [],
        source: 'themuse',
        sourceName: 'The Muse',
        sourceColor: '#f59e0b',
      }));
    },
  },
];

export const LINK_BOARDS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional network',
    emoji: '💼',
    color: '#0A66C2',
    category: 'General',
    buildUrl: (q, loc) =>
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}`,
  },
  {
    id: 'indeed',
    name: 'Indeed',
    description: 'Largest job aggregator',
    emoji: '🔵',
    color: '#003A9B',
    category: 'General',
    buildUrl: (q, loc) =>
      `https://www.indeed.com/jobs?q=${encodeURIComponent(q)}&l=${encodeURIComponent(loc)}`,
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    description: 'Jobs + salary insights',
    emoji: '🚪',
    color: '#0CAA41',
    category: 'General',
    buildUrl: (q, loc) =>
      `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(q)}`,
  },
  {
    id: 'simplyhired',
    name: 'SimplyHired',
    description: 'Job search simplified',
    emoji: '🔎',
    color: '#FF6B35',
    category: 'General',
    buildUrl: (q, loc) =>
      `https://www.simplyhired.com/search?q=${encodeURIComponent(q)}&l=${encodeURIComponent(loc)}`,
  },
  {
    id: 'dice',
    name: 'Dice',
    description: 'Tech & IT specialist jobs',
    emoji: '🎲',
    color: '#E63946',
    category: 'Tech',
    buildUrl: (q, loc) =>
      `https://www.dice.com/jobs?q=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}`,
  },
  {
    id: 'builtin',
    name: 'Built In',
    description: 'Tech company jobs in hubs',
    emoji: '🏙️',
    color: '#3B5BDB',
    category: 'Tech',
    buildUrl: (q) =>
      `https://builtin.com/jobs?search=${encodeURIComponent(q)}`,
  },
  {
    id: 'levels',
    name: 'Levels.fyi',
    description: 'Salary-transparent tech jobs',
    emoji: '📊',
    color: '#4A90D9',
    category: 'Tech',
    buildUrl: (q) =>
      `https://www.levels.fyi/jobs/?search=${encodeURIComponent(q)}`,
  },
  {
    id: 'hackernews',
    name: "HN: Who's Hiring",
    description: 'Monthly HN hiring thread',
    emoji: '🟠',
    color: '#FF6600',
    category: 'Tech',
    buildUrl: () => `https://news.ycombinator.com/jobs`,
  },
  {
    id: 'wellfound',
    name: 'Wellfound',
    description: 'Startup jobs with equity info',
    emoji: '🚀',
    color: '#FF6154',
    category: 'Startup',
    buildUrl: (q) =>
      `https://wellfound.com/jobs?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'yc',
    name: 'YC Work at a Startup',
    description: 'Jobs at YC-backed companies',
    emoji: '🦀',
    color: '#FF6600',
    category: 'Startup',
    buildUrl: (q) =>
      `https://www.workatastartup.com/jobs?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'remoteok',
    name: 'Remote OK',
    description: 'Remote-first job board',
    emoji: '🌍',
    color: '#00C896',
    category: 'Remote',
    buildUrl: (q) =>
      `https://remoteok.com/remote-${encodeURIComponent(q.toLowerCase().replace(/\s+/g, '-'))}-jobs`,
  },
  {
    id: 'weworkremotely',
    name: 'We Work Remotely',
    description: 'Remote jobs for top companies',
    emoji: '🏡',
    color: '#1DB954',
    category: 'Remote',
    buildUrl: (q) =>
      `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(q)}`,
  },
];
