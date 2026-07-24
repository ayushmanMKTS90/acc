const { llm, parseJSON } = require('./_config');
const { fetchPainPointNews } = require('./_news');

function buildPrompt({ industry, painPoint, recentDevelopments, salesPlayContext }) {
  const newsContext = recentDevelopments?.length
    ? `\nRecent real developments:\n${recentDevelopments.map(r => `- ${r.headline} (${r.date}): ${r.relevance}`).join('\n')}`
    : '';
  return `You are an industry analyst using insight-selling methodology. Research and summarize the current industry context for a sales conversation. Each talk track should follow the pattern: trend → implication → opportunity.

Industry: ${industry || 'Unknown'}
Pain point / topic: ${painPoint || 'general business'}
${newsContext}
${salesPlayContext || ''}
Output ONLY valid JSON with these keys:
- "headline": one-sentence industry trend summary — max 20 words
- "talk_tracks": array of 3 concise talk points structured as trend → implication → opportunity — each max 15 words
- "vertical_shift": one-sentence describing an ongoing shift in this vertical — max 20 words`;
}

async function layer2(input) {
  let recentDevelopments = [];
  try {
    recentDevelopments = await fetchPainPointNews(input.painPoint) || [];
    if (recentDevelopments.length > 0) {
      console.log('[Layer2] Using real GNews articles:', recentDevelopments.length);
    }
  } catch (_) {}

  const prompt = buildPrompt({ ...input, recentDevelopments, salesPlayContext: input.salesPlayContext });
  const raw = await llm(
    'You are a precise industry analyst. Output ONLY valid JSON, no other text.',
    prompt
  );
  const result = parseJSON(raw);
  result.recent_developments = recentDevelopments.length > 0
    ? recentDevelopments
    : (result.recent_developments || []);
  return result;
}

module.exports = { layer2 };
