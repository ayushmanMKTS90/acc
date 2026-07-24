const { llm, parseJSON } = require('./_config');

const SIGNAL_TYPES = ['fundraising','hiring_growth','expansion','m_and_a','cost_reduction','restructuring','security_incident','compliance_pressure','digital_transformation','ai_adoption'];

function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

async function fetchOpenCorporatesSignals(company) {
  if (!company) return [];
  try {
    const url = `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(company)}&per_page=3`;
    const res = await fetchWithTimeout(url, {}, 5000);
    if (!res.ok) return [];
    const data = await res.json();
    const companies = data.companies || [];
    const signals = [];
    for (const c of companies) {
      const co = c.company;
      if (co.incorporation_date) {
        const age = new Date().getFullYear() - new Date(co.incorporation_date).getFullYear();
        signals.push({ type: 'expansion', detail: `Incorporated ${co.incorporation_date} (${age} years old)` });
      }
      if (co.jurisdiction_code && co.jurisdiction_code !== 'us_de') {
        signals.push({ type: 'expansion', detail: `Registered in ${co.jurisdiction_code.replace('_', ' ').toUpperCase()}` });
      }
      if (co.company_type) {
        signals.push({ type: 'expansion', detail: `Entity type: ${co.company_type}` });
      }
      if (co.officers && co.officers.length > 0) {
        signals.push({ type: 'hiring_growth', detail: `${co.officers.length} officers listed` });
      }
    }
    return signals;
  } catch (_) { return []; }
}

async function fetchWikidataSignals(company) {
  if (!company) return [];
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(company)}&language=en&format=json&limit=1`;
    const searchRes = await fetchWithTimeout(searchUrl, {}, 5000);
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const entities = searchData.search || [];
    if (!entities.length) return [];
    const entityId = entities[0].id;
    const claimUrl = `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`;
    const claimRes = await fetchWithTimeout(claimUrl, {}, 5000);
    if (!claimRes.ok) return [];
    const claimData = await claimRes.json();
    const entity = claimData.entities?.[entityId];
    if (!entity) return [];
    const signals = [];
    const claims = entity.claims || {};
    if (claims.P571) { // inception date
      const date = claims.P571[0]?.mainsnak?.datavalue?.value?.time;
      if (date) {
        const year = parseInt(date.replace('+', '').slice(0, 4));
        const age = new Date().getFullYear() - year;
        signals.push({ type: 'expansion', detail: `Founded ${year} (${age} years ago)` });
      }
    }
    if (claims.P1128) { // employees
      const emp = claims.P1128[0]?.mainsnak?.datavalue?.value?.amount;
      if (emp) {
        signals.push({ type: 'hiring_growth', detail: `~${parseInt(emp).toLocaleString()} employees (Wikidata)` });
      }
    }
    if (claims.P856) { // website
      const site = claims.P856[0]?.mainsnak?.datavalue?.value;
      if (site) signals.push({ type: 'expansion', detail: `Website: ${site}` });
    }
    if (claims.P452) { // industry
      const industries = claims.P452.map(c => c.mainsnak?.datavalue?.value?.id).filter(Boolean);
      if (industries.length) signals.push({ type: 'expansion', detail: `Industries: ${industries.join(', ')}` });
    }
    if (claims.P127) { // owned by
      const parents = claims.P127.map(c => c.mainsnak?.datavalue?.value?.id).filter(Boolean);
      if (parents.length) signals.push({ type: 'm_and_a', detail: `Subsidiary of: ${parents.join(', ')}` });
    }
    return signals;
  } catch (_) { return []; }
}

async function fetchCompanyNews(company) {
  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  if (!GNEWS_API_KEY || !company) return [];
  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(company)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`;
    const res = await fetchWithTimeout(url, {}, 5000);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).map(a => ({
      type: 'news',
      headline: a.title,
      date: new Date(a.publishedAt).toLocaleDateString(),
      relevance: a.description?.slice(0, 100) || ''
    }));
  } catch (_) { return []; }
}

function buildPrompt({ company, industry, signals, externalSignals, companyNews, salesPlayContext }) {
  const present = (signals || []).filter(Boolean).length
    ? signals.map(s => `- ${s}`).join('\n')
    : 'none provided';
  const ext = (externalSignals || []).length
    ? externalSignals.map(s => `- [External] ${s.type}: ${s.detail}`).join('\n')
    : 'none';
  const news = (companyNews || []).length
    ? companyNews.map(n => `- [News] ${n.headline} (${n.date}): ${n.relevance}`).join('\n')
    : 'none';
  return `You are a sales intelligence analyst. Analyze the following account signals and produce an account summary.

Company: ${company || 'Unknown'}
Industry: ${industry || 'Unknown'}
User-provided signals:
${present}

External signals (OpenCorporates, Wikidata):
${ext}

Recent company news:
${news}
${salesPlayContext || ''}
Output ONLY valid JSON with these keys:
- "summary": one-sentence account summary (why this account, why now) — max 25 words
- "pressure": the primary pressure driving change — max 15 words
- "validation_questions": array of 3 questions the rep should validate on the call
- "signal_confidence": "high"|"medium"|"low" — how strong the signal set is
- "inferred_signals": array of 2-3 additional signal types from: ${SIGNAL_TYPES.join(', ')} — based on industry context`;
}

async function layer1(input) {
  const { company, domain, industry, signals } = input;
  const [externalSignals, companyNews] = await Promise.all([
    Promise.all([
      fetchOpenCorporatesSignals(company),
      fetchWikidataSignals(company)
    ]).then(([oc, wd]) => [...oc, ...wd]),
    fetchCompanyNews(company)
  ]);
  const raw = await llm(
    'You are a precise sales intelligence analyst. Output ONLY valid JSON, no other text.',
    buildPrompt({ company, industry, signals, externalSignals, companyNews, salesPlayContext: input.salesPlayContext })
  );
  return parseJSON(raw);
}

module.exports = { layer1, SIGNAL_TYPES };