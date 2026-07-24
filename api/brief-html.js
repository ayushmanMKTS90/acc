const { layer1 } = require('./layer1-signals');
const { layer2 } = require('./layer2-industry');
const { layer3 } = require('./layer3-prospect');
const { layer4 } = require('./layer4-tech');
const { layer5 } = require('./layer5-compete');
const { layer6 } = require('./layer6-orchestrate');
const { layer7 } = require('./layer7-discovery');
const { commitFile } = require('./_github');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { company, industry, domain, product, signals, role, seniority, painPoint, salesPlay } = req.body || {};
    if (!industry) return res.status(400).json({ error: 'industry required' });

    let salesPlayData = null;
    let salesPlayContext = '';
    if (salesPlay) {
      try {
        salesPlayData = require('./_plays/' + salesPlay);
        salesPlayContext = '\nSales Play Context:\n' +
          '  Play: ' + salesPlayData.name + '\n' +
          '  Audience: ' + salesPlayData.audience + '\n' +
          '  Narrative: ' + salesPlayData.narrative + '\n' +
          '  Strategic Rationale: ' + salesPlayData.strategicRationale + '\n' +
          '  Theme: ' + salesPlayData.theme + '\n' +
          '  Solutions offered: ' + salesPlayData.solutions + '\n' +
          '  Target pain points:\n' + salesPlayData.painPoints.map(p => '    - ' + p).join('\n') + '\n' +
          '  CEP Resolution:\n' + salesPlayData.cepResolution.map(c => '    - ' + c).join('\n');
      } catch (_) {}
    }

    const ctx = { company, industry, domain, product, signals, role, seniority, painPoint, salesPlayContext, salesPlayData };

    const [l1, l2, l3, l4] = await Promise.all([
      layer1(ctx), layer2(ctx), layer3(ctx), layer4(ctx)
    ]);

    const incumbent = l4?.primary_competitor || 'unknown';
    ctx.incumbent = incumbent;
    ctx.layer1_account_signals = l1;
    const allSignals = [...(signals || []), ...(l1?.inferred_signals || [])];

    const [l5, l6] = await Promise.all([
      layer5({ incumbent, product, industry, painPoint, layer1: l1, layer4: l4, salesPlayContext }),
      layer6({ signals: allSignals, industry, incumbent, product, layer1: l1, layer3: l3, layer4: l4, salesPlayContext })
    ]);
    ctx.layer6_product_orchestration = l6;

    const l7 = await layer7({ layer1: l1, layer2: l2, layer3: l3, layer4: l4, layer5: l5, layer6: l6, salesPlayContext });

    const data = {
      company: company || 'Untitled', industry, product: product || 'our solution',
      role: role || '', seniority: seniority || '',
      domain: domain || '',
      signals: signals || [],
      painPoint: painPoint || '',
      salesPlay: salesPlay || '',
      salesPlayName: salesPlayData?.name || '',
      generated_at: new Date().toISOString(),
      layer1_account_signals: l1, layer2_industry_pulse: l2, layer3_prospect_intel: l3,
      layer4_tech_context: l4, layer5_competitive_context: l5,
      layer6_product_orchestration: l6, layer7_discovery_support: l7
    };

    const safeName = (company || 'brief').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const ts = Date.now();
    const filename = safeName + '-' + ts + '.json';
    await commitFile('briefs/' + filename, JSON.stringify(data, null, 2), 'Save brief: ' + company);

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};