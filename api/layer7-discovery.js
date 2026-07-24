const { llm, parseJSON } = require('./_config');

function buildPrompt({ layer1, layer2, layer3, layer4, layer5, layer6, salesPlayContext }) {
  const ctx = [
    layer1 ? `Account summary: ${layer1.summary}` : '',
    layer1 ? `Primary pressure: ${layer1.pressure}` : '',
    layer2 ? `Industry context: ${layer2.headline}` : '',
    layer3 ? `Prospect concerns: ${(layer3.concerns||[]).join(', ')}` : '',
    layer4 ? `Tech stack incumbent: ${layer4.primary_competitor}` : '',
    layer5 ? `Competitive reframe: ${layer5.reframe_headline}` : '',
    layer6 ? `Recommended path: ${layer6.lead_path}` : ''
  ].filter(Boolean).join('\n');

  return `You are a discovery coach for sales reps. Based on the assembled account intelligence, generate in-meeting discovery support.

Context:
${ctx || 'No specific context provided — use general best practices.'}
${salesPlayContext || ''}
Output ONLY valid JSON with these keys:
- "validation_prompts": array of 4 natural-language prompts the rep should validate in the meeting — each max 20 words, phrased as a question
- "listen_for_cues": array of 3 things to listen for that indicate a buying signal or objection — each max 12 words
- "pivot_paths": array of 2 paths — if the buyer responds with "X", pivot to "Y" — each an object with "if_they_say" (max 10 words) and "then_pivot_to" (max 15 words)
- "dont_say": array of 2 phrases to avoid saying — each max 10 words
- "success_criteria": what a successful discovery call looks like — one sentence, max 20 words`;
}

async function layer7(allLayers) {
  const raw = await llm(
    'You are a precise discovery coach. Output ONLY valid JSON, no other text.',
    buildPrompt(allLayers),
    { maxTokens: 8000 }
  );
  return parseJSON(raw);
}

module.exports = { layer7 };
