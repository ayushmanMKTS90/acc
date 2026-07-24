const { llm, parseJSON } = require('./_config');

function buildPrompt({ role, seniority, industry, painPoint, layer1, salesPlayContext }) {
  const accountContext = layer1 ? `
Account summary: ${layer1.summary}
Primary pressure: ${layer1.pressure}
Signal confidence: ${layer1.signal_confidence}
Inferred signals: ${(layer1.inferred_signals||[]).join(', ')}` : '';
  return `You are a buyer persona analyst. Build a prospect intelligence snapshot.

Role: ${role || 'Unknown'}
Seniority: ${seniority || 'Manager/Director'}
Industry: ${industry || 'Unknown'}
Relevant pain: ${painPoint || 'general'}
${accountContext}
${salesPlayContext || ''}
Output ONLY valid JSON with these keys:
- "concerns": array of 3 key concerns this persona likely has — each max 12 words
- "priorities": array of 3 priorities this persona cares about — each max 10 words
- "influence_level": one of "decision-maker", "influencer", "champion", "evaluator" — base this on the role and seniority. C-Level roles are usually "decision-maker". VP/Director are typically "influencer" or "champion". Manager and IC are usually "evaluator" or "influencer". Choose realistically, do not default to "decision-maker".
- "likely_questions": array of 3 questions this persona is likely to ask — each max 15 words
- "success_metric": what success looks like to this persona — max 15 words
- "tailored_message": one-sentence message tailored to this persona — max 25 words`;
}

async function layer3(input) {
  const raw = await llm(
    'You are a precise buyer persona analyst. Output ONLY valid JSON, no other text.',
    buildPrompt(input)
  );
  return parseJSON(raw);
}

module.exports = { layer3 };
