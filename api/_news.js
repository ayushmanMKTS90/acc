const API_KEY = process.env.SERPAPI_API_KEY;
const SERP_URL = 'https://serpapi.com/search';

const CACHE = new Map();
const CACHE_TTL = 60 * 60 * 1000;

const PAIN_POINT_QUERIES = {
  Manageability: 'IT software infrastructure management',
  Cost: 'budget cost savings',
  Security: 'cybersecurity data breach'
};

function getCacheKey(painPoint) {
  return `news:${painPoint}`;
}

function isCacheValid(entry) {
  return entry && Date.now() - entry.timestamp < CACHE_TTL;
}

async function fetchPainPointNews(painPoint) {
  const query = painPoint ? PAIN_POINT_QUERIES[painPoint] : null;
  if (!query) return [];

  const cacheKey = getCacheKey(painPoint);
  const cached = CACHE.get(cacheKey);
  if (isCacheValid(cached)) return cached.data;

  if (!API_KEY) {
    console.log('[News] SERPAPI_API_KEY not configured, skipping');
    return [];
  }

  try {
    const url = `${SERP_URL}?engine=google_news&q=${encodeURIComponent(query)}&gl=us&hl=en&api_key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.log('[News] SerpAPI error:', res.status);
      return [];
    }
    const data = await res.json();
    const results = data.news_results || [];
    console.log('[News] SerpAPI returned', results.length, 'results for', painPoint);
    const articles = results.slice(0, 3).map(a => ({
      headline: a.title,
      date: a.date || 'recent',
      relevance: a.snippet?.slice(0, 80) || 'Recent industry development'
    }));

    CACHE.set(getCacheKey(painPoint), { data: articles, timestamp: Date.now() });
    console.log(`[News] Fetched ${articles.length} articles for ${painPoint}`);
    return articles;
  } catch (err) {
    console.log('[News] Fetch error:', err.message);
    return [];
  }
}

module.exports = { fetchPainPointNews };