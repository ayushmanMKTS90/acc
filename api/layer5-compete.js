const { llm, parseJSON, COMPETITOR_INTEL } = require('./_config');

function buildPrompt({ incumbent, product, industry, painPoint, layer1, layer4, salesPlayContext }) {
  const accountContext = layer1 ? `
Account summary: ${layer1.summary}
Primary pressure: ${layer1.pressure}
Signal confidence: ${layer1.signal_confidence}` : '';
  const techContext = layer4 ? `
Detected tech: ${(layer4.detected_tech||[]).slice(0,8).join(', ')}
Email: ${layer4.email_hosting}
Cloud: ${layer4.cloud_provider}
Devices: ${layer4.devices}
Competitor confidence: ${layer4.confidence}` : '';
  
  const ci = incumbent ? COMPETITOR_INTEL[incumbent] : null;
  const intelBlock = ci ? `
Known intelligence about ${incumbent}:
Known strengths: ${ci.strengths.join('; ')}
Known weaknesses: ${ci.weaknesses.join('; ')}
Proven positioning angles: ${ci.positioning.join('; ')}
Verified proof points: ${ci.proof_points.join('; ')}
Common objections we hear: ${ci.objections.map(o => o.if_they_say).join('; ')}` : '';

  return `You are a competitive positioning strategist using Command of the Message and Challenger Sale methodologies. Based on the detected incumbent environment and the intelligence below, produce a detailed battle card.

Incumbent: ${incumbent || 'Unknown'}
Our product: ${product || 'our solution'}
Industry: ${industry || 'Unknown'}
Pain point: ${painPoint || 'general'}
${accountContext}
${techContext}
${intelBlock}
${salesPlayContext || ''}
Use the following sales methodology principles:
- Command of the Message: Frame every statement as a value conversation, not a feature comparison. Lead with business outcomes.
- Challenger Sale: Teach the buyer something new about their business. Tailor the message to their specific pressures. Take control of the conversation.
- Structure the battle card around: reframe → teach → leverage → handle objections

Output ONLY valid JSON with these keys:
- "reframe_headline": one-sentence framer that reframes how they see the incumbent relationship — max 20 words
- "incumbent_strength": what the incumbent genuinely does well — one sentence, max 15 words
- "incumbent_weakness": where the incumbent falls short specifically for their situation — one sentence, max 15 words
- "our_lever": our asymmetric advantage — one sentence, max 15 words
- "proof_points": array of 3 concrete evidence points we can cite (stats, capabilities, outcomes)
- "objection_handling": array of 2 objects with "if_they_say" (what buyer claims) and "respond_with" (how we counter using Command of the Message) — each max 15 words
- "comparison_prompts": array of 3 phrases the rep can use when the buyer compares vs incumbent — each max 12 words
- "avoid_phrases": array of 2 phrases to avoid (can sound negative or replacement-led)
- "positioning_style": "co-exist"|"complement"|"migration"|"greenfield"`;
}

async function layer5(input) {
  const raw = await llm(
    'You are a precise competitive positioning strategist. Output ONLY valid JSON, no other text.',
    buildPrompt(input)
  );
  return parseJSON(raw);
}

module.exports = { layer5 };
