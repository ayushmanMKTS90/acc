const { llm, parseJSON } = require('./_config');

function buildPrompt({ signals, industry, incumbent, product, layer1, layer3, layer4, salesPlayContext }) {
  const signalList = (signals || []).length
    ? signals.map(s => `- ${s}`).join('\n')
    : 'none explicitly provided';
  const accountContext = layer1 ? `
Account summary: ${layer1.summary}
Primary pressure: ${layer1.pressure}
Signal confidence: ${layer1.signal_confidence}` : '';
  const prospectContext = layer3 ? `
Prospect influence: ${layer3.influence_level}
Prospect priorities: ${(layer3.priorities||[]).join(', ')}` : '';
  const techContext = layer4 ? `
Detected tech: ${(layer4.detected_tech||[]).slice(0,8).join(', ')}
Incumbent: ${layer4.primary_competitor}
Tech confidence: ${layer4.confidence}` : '';
  return `You are a product orchestration strategist. Based on account signals and context, guide the rep on which product conversation path to follow.
Account signals:
${signalList}
Industry: ${industry || 'Unknown'}
Incumbent: ${incumbent || 'Unknown'}
Our product: ${product || 'our solution'}
${accountContext}
${prospectContext}
${techContext}
${salesPlayContext || ''}
Output ONLY valid JSON with these keys:
- "lead_path": the recommended primary conversation path — one of "browser_governance"|"dlp_security"|"shadow_ai"|"device_refresh"|"app_delivery"|"productivity_suite" — max 3 words
- "fallback_path": secondary path if the primary doesn't resonate
- "entry_trigger": what signal or buyer statement triggers this path — max 15 words
- "value_to_metric": how to frame value in measurable terms — max 20 words
- "sequence": array of 3 ordered conversation steps — each max 12 words`;
}

async function layer6(input) {
  const raw = await llm(
    'You are a precise product orchestration strategist. Output ONLY valid JSON, no other text.',
    buildPrompt(input)
  );
  return parseJSON(raw);
}

module.exports = { layer6 };
