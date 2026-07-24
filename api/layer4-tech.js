const { INCUMBENTS } = require('./_config');

const BUILTWITH_KEY = process.env.BUILTWITH_API_KEY;

const MIN_EVIDENCE_MATCHES = 3;

function countIncumbentMatches(signals) {
  const lower = (signals || []).map(s => s.toLowerCase()).join(' ');
  let best = { key: 'unknown', matches: 0 };
  for (const [key, info] of Object.entries(INCUMBENTS)) {
    const matchCount = info.signals.filter(s => lower.includes(s.toLowerCase())).length;
    if (matchCount > best.matches) best = { key, matches: matchCount };
  }
  return best;
}

function categorizeTech(technologies) {
  const cats = { email: [], cloud: [], devices: [], analytics: [], marketing: [], security: [], crm: [], other: [] };
  for (const t of technologies) {
    const n = t.toLowerCase();
    if (/(microsoft 365|exchange|gmail|google workspace|office 365|m365)/.test(n)) cats.email.push(t);
    else if (/(azure|aws|gcp|google cloud|amazon web services)/.test(n)) cats.cloud.push(t);
    else if (/(windows|macos|mac os|linux|chrome os|android|ios|ipad|iphone)/.test(n)) cats.devices.push(t);
    else if (/(google analytics|mixpanel|amplitude|segment|heap|hotjar)/.test(n)) cats.analytics.push(t);
    else if (/(hubspot|marketo|pardot|mailchimp|sendgrid|braze|iterable)/.test(n)) cats.marketing.push(t);
    else if (/(okta|auth0|saml|sso|cloudflare|zscaler|palo alto|crowdstrike|sentinelone)/.test(n)) cats.security.push(t);
    else if (/(salesforce|hubspot|pipedrive|zoho|dynamics 365)/.test(n)) cats.crm.push(t);
    else cats.other.push(t);
  }
  return cats;
}

async function layer4({ domain, industry, layer1 }) {
  let technologies = [];
  let rawTechnologies = [];
  if (domain && BUILTWITH_KEY) {
    try {
      const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
      const url = `https://api.builtwith.com/v20/api.json?KEY=${BUILTWITH_KEY}&LOOKUP=${encodeURIComponent(clean)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const results = data.Results || [];
        for (const r of results) {
          const paths = r.Result?.Paths || [];
          for (const p of paths) {
            const techs = p.Technologies || [];
            for (const t of techs) {
              if (t.Name) {
                rawTechnologies.push({ name: t.Name, categories: t.Categories?.map(c=>c.Name) || [] });
                technologies.push(t.Name);
              }
            }
          }
        }
      }
    } catch (_) {}
  }

  // Fallback to technology-detector if BuiltWith fails or no key
  if (technologies.length === 0 && domain) {
    try {
      const clean = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
      const { analyzeUrl } = await import('technology-detector');
      const result = await analyzeUrl('https://' + clean);
      rawTechnologies = result.detected.filter(d => d.matchedBy[0] !== 'implied');
      technologies = rawTechnologies.map(d => d.name);
    } catch (_) {}
  }

  const categorized = categorizeTech(technologies);

  // Build evidence from multiple sources
  const evidenceSignals = [
    ...technologies,
    ...(layer1?.inferred_signals || []),
    ...(require('./_config').INCUMBENTS_SIGNALS?.[industry] || [])
  ];

  // Count matches against incumbent taxonomy
  const { key: incumbent, matches } = countIncumbentMatches(evidenceSignals);
  let confidence = 'low';
  if (matches >= 3) confidence = 'medium';
  else if (matches >= 2) confidence = 'low';
  else incumbent = 'unknown', confidence = 'low';

  const primaryCompetitor = incumbent === 'microsoft' ? 'Microsoft' 
    : incumbent === 'google' ? 'Google' 
    : incumbent === 'apple' ? 'Apple' 
    : incumbent === 'linux' ? 'Linux' 
    : 'None';

  return {
    detected_tech: technologies.slice(0, 20),
    categorized_tech: categorized,
    email_hosting: categorized.email[0] || 'Unknown',
    cloud_provider: categorized.cloud[0] || 'Unknown',
    devices: categorized.devices[0] || 'Unknown',
    primary_competitor: primaryCompetitor,
    confidence,
    raw_detected: rawTechnologies,
    source: BUILTWITH_KEY ? 'builtwith' : 'technology-detector'
  };
}

module.exports = { layer4 };