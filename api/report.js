const { TOKEN, REPO, BASE } = require('./_github');

const CSS = `:root{--bg-default:#ffffff;--bg-muted:#fafafa;--bg-accent:#fff8e6;--bg-success:#f0fdf4;--bg-danger:#fef2f2;--fg-default:#0a0a0a;--fg-muted:#737373;--fg-accent:#d97706;--fg-success:#16a34a;--fg-danger:#dc2626;--border-default:#e5e5e5;--border-muted:#f0f0f0;--radius-sm:8px;--radius-md:12px;--radius-lg:16px;--radius-xl:24px;--radius-full:9999px;--shadow-sm:0 1px 2px 0 rgba(0,0,0,0.04),0 1px 3px 0 rgba(0,0,0,0.02);--font-sans:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font-sans);background:var(--bg-default);color:var(--fg-default);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
.toolbar{position:sticky;top:0;z-index:100;background:var(--bg-default);border-bottom:1px solid var(--border-default);height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 20px}
.toolbar-left{display:flex;align-items:center;gap:10px;min-width:0}
.toolbar-logo{font-size:15px;font-weight:700;color:var(--fg-default);text-decoration:none;white-space:nowrap;letter-spacing:-.3px}
.toolbar-logo:hover{color:var(--fg-accent)}
.toolbar-sep{width:1px;height:18px;background:var(--border-muted);flex-shrink:0}
.toolbar-title{font-size:14px;color:var(--fg-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.toolbar-right{display:flex;align-items:center;gap:6px}
.btn{height:30px;padding:0 10px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border-default);background:transparent;color:var(--fg-default);cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;transition:all .15s;font-family:inherit;text-decoration:none}
.btn:hover{border-color:#d4d4d4;color:var(--fg-accent)}
.app{display:flex;max-width:1200px;margin:0 auto;min-height:calc(100vh - 52px)}
.outline{width:200px;flex-shrink:0;padding:20px 12px;border-right:1px solid var(--border-muted);position:sticky;top:52px;height:calc(100vh - 52px);overflow-y:auto}
.outline-hdr{font-size:10px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;padding:0 8px}
.outline-items{display:flex;flex-direction:column;gap:2px}
.outline-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--radius-sm);text-decoration:none;color:var(--fg-muted);font-size:12px;line-height:1.4;transition:all .15s}
.outline-item:hover{background:var(--bg-muted);color:var(--fg-default)}
.outline-item.active{background:var(--bg-accent);color:var(--fg-accent);font-weight:600}
.outline-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.outline-label{overflow:hidden;text-overflow:ellipsis}
.content{flex:1;padding:36px 44px;max-width:800px}
.info-line{font-size:12px;color:var(--fg-muted);margin-bottom:28px;padding-bottom:20px;line-height:1.6;position:relative}
.info-line strong{color:var(--fg-default)}
.info-line::after{content:"";position:absolute;bottom:0;left:10%;right:10%;height:1px;background:linear-gradient(to right,transparent,var(--border-muted),transparent)}
.section{border-radius:var(--radius-md);padding:20px 24px;margin-bottom:16px;background:var(--bg-muted)}
.section-hdr{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:12px;font-weight:600}
.section-num{width:20px;height:20px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;flex-shrink:0;color:#fff}
.section-title{font-size:14px;font-weight:600;color:var(--fg-default)}
.section-q{font-size:12px;color:var(--fg-muted);font-weight:400;margin-left:4px}
.label{font-size:10px;font-weight:600;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.03em;margin-bottom:2px}
.value{font-size:14px;color:var(--fg-default);line-height:1.5;margin-bottom:12px}
.sec-hdr{padding:12px 0 8px;font-size:9px;font-weight:600;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.04em;margin-top:4px;position:relative}
.sec-hdr::after{content:"";position:absolute;bottom:0;left:5%;right:5%;height:1px;background:linear-gradient(to right,transparent,var(--border-muted),transparent)}
.item-list{list-style:none;margin:0 0 6px}.item-list li{padding:2px 0;font-size:14px;color:var(--fg-default);line-height:1.5}
.bge{display:inline-block;font-size:10px;font-weight:600;padding:2px 8px;border-radius:var(--radius-full)}.bge.high{background:var(--bg-danger);color:var(--fg-danger)}.bge.medium{background:#fefce8;color:#d97706}.bge.low{background:var(--bg-success);color:var(--fg-success)}
.bc-hdr{font-size:10px;font-weight:600;color:var(--fg-default);text-transform:uppercase;letter-spacing:.04em;padding:12px 0 6px;margin-bottom:12px;position:relative}
.bc-hdr::after{content:"";position:absolute;bottom:0;left:0;width:48px;height:2px;background:var(--fg-default)}
.tech-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:12px}
.pill{font-size:11px;color:var(--fg-muted);background:var(--bg-default);border:1px solid var(--border-muted);border-radius:var(--radius-full);padding:2px 10px;display:inline-block;margin:2px}
.obj-item{padding:4px 0;display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}
.paths{display:flex;gap:8px;margin-bottom:12px}.path-best{padding:6px 16px;border-radius:var(--radius-sm);font-size:13px;font-weight:500;background:var(--bg-default);color:var(--fg-default);border:1px solid var(--border-default);flex:1}.path-backup{padding:6px 16px;border-radius:var(--radius-sm);font-size:13px;font-weight:500;background:var(--bg-default);color:var(--fg-muted);border:1px solid var(--border-muted);flex:1}
.callout-accent{border-radius:var(--radius-sm);padding:12px 14px;font-size:13px;line-height:1.5;background:var(--bg-accent);margin-top:12px;border-left:3px solid var(--fg-accent)}.callout-success{border-radius:var(--radius-sm);padding:12px 14px;font-size:13px;line-height:1.5;background:var(--bg-success);margin-top:12px;border-left:3px solid var(--fg-success)}
.footer{padding:32px 0 24px;text-align:center;font-size:11px;color:var(--fg-muted)}
@media(max-width:768px){.outline{display:none}.content{padding:28px 24px}}
@media(max-width:544px){.content{padding:20px 16px}.tech-grid{grid-template-columns:repeat(2,1fr)}.toolbar-title{display:none}}
@media print{body{background:#fff}.toolbar,.outline,.footer{display:none}.app{display:block}.content{padding:16px}.section{border:1px solid var(--border-default)!important}}`;

function renderHTML(data) {
  const LAYER_C = ['#006edb','#30a147','#894ceb','#eb670f','#b88700','#179b9b','#808fa3'];
  const LAYER_N = ['Why this account?','Industry context','Who you\'re meeting','Their tech setup','How to position us','Conversation path','Discovery guide'];
  const LAYER_Q = ['What\'s driving them to change?','What trends affect their business?','What matters to this person?','What tools and platforms they use','How we compare to what they have','Which angle to take in the call','What to ask, listen for, and avoid'];
  const esc = s => String(s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const n = (d,num) => {
    if (!d) return '';
    const LV = (l,v) => '<div class="label">'+l+'</div><div class="value">'+v+'</div>';
    const SH = t => '<div class="sec-hdr">'+t+'</div>';
    const LI = items => '<ul class="item-list">'+items.map(i=>'<li>'+i+'</li>').join('')+'</ul>';
    switch (num) {
      case 1: return LV('Summary',esc(d.summary))+LV('Reason to act',esc(d.pressure))+(d.validation_questions?SH('Questions to ask on the call')+LI(d.validation_questions.map(q=>esc(q))):'')+(d.signal_confidence?'<div style="margin-top:12px"><span class="bge '+d.signal_confidence+'">Signal strength: '+d.signal_confidence.toUpperCase()+'</span></div>':'');
      case 2: return LV('Headline',esc(d.headline))+(d.talk_tracks?SH('Talking points to use')+LI(d.talk_tracks.map(t=>esc(t))):'')+(d.recent_developments?SH('Recent news')+'<ul class="item-list">'+d.recent_developments.map(r=>'<li><strong>'+esc(r.headline)+'</strong><div style="font-size:12px;color:var(--fg-muted);margin-top:1px">'+esc(r.date)+' &middot; '+esc(r.relevance)+'</div></li>').join('')+'</ul>':'')+(d.vertical_shift?LV('Industry trend',esc(d.vertical_shift)):'');
      case 3: return LV('Influence','<span class="bge '+(d.influence_level==='decision-maker'?'high':'medium')+'">'+(d.influence_level||'?').toUpperCase()+'</span>')+(d.concerns?SH('What worries them')+LI(d.concerns.map(c=>esc(c))):'')+(d.priorities?SH('What they care about')+LI(d.priorities.map(p=>esc(p))):'')+(d.likely_questions?SH("Questions they'll ask")+LI(d.likely_questions.map(q=>esc(q))):'')+LV('Success metric',esc(d.success_metric))+(d.tailored_message?'<div class="callout-accent">'+esc(d.tailored_message)+'</div>':'');
      case 4: return '<div class="tech-grid">'+[{l:'Email',v:d.email_hosting||'Unknown'},{l:'Cloud',v:d.cloud_provider||'Unknown'},{l:'Devices',v:d.devices||'Unknown'},{l:'Main competitor',v:d.primary_competitor||'Unknown'}].map(s=>'<div><div class="label">'+s.l+'</div><div style="font-size:14px;font-weight:600;color:var(--fg-default)">'+esc(s.v)+'</div></div>').join('')+'</div>'+(d.detected_tech&&d.detected_tech.length?SH('Technologies detected')+'<div>'+d.detected_tech.map(t=>'<span class="pill">'+esc(t)+'</span>').join('')+'</div>':'')+(d.confidence?'<div style="margin-top:12px"><span class="bge '+d.confidence+'">Confidence: '+d.confidence.toUpperCase()+'</span></div>':'');
      case 5: return LV('Core message',esc(d.reframe_headline))+'<div class="bc-hdr">Battle Card</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px"><div><div class="label">Their strength</div><div>'+esc(d.incumbent_strength)+'</div></div><div><div class="label">Their weakness</div><div>'+esc(d.incumbent_weakness)+'</div></div></div>'+LV('Our advantage',esc(d.our_lever))+(d.proof_points?SH('Proof points')+LI(d.proof_points.map(p=>esc(p))):'')+(d.objection_handling?SH('Objection handling')+d.objection_handling.map(o=>'<div class="obj-item"><span class="obj-say">"'+esc(o.if_they_say)+'"</span> <span class="obj-arrow">→</span> <span class="obj-resp">'+esc(o.respond_with)+'</span></div>').join(''):'')+(d.comparison_prompts?SH('Position against them')+LI(d.comparison_prompts.map(p=>esc(p))):'')+'<div style="margin-top:12px"><span class="bge medium">'+(d.positioning_style||'?').toUpperCase()+'</span>'+(d.avoid_phrases?' <span class="bge low" style="background:var(--bg-danger);color:var(--fg-danger);margin-left:6px">Avoid: '+(d.avoid_phrases||[]).join(', ')+'</span>':'')+'</div>';
      case 6: return '<div class="paths"><div class="path-best">'+(d.lead_path?'Best path: '+esc(d.lead_path):'—')+'</div><div class="path-backup">'+(d.fallback_path?'Backup: '+esc(d.fallback_path):'—')+'</div></div>'+LV('When to bring up',esc(d.entry_trigger))+LV('Value framing',esc(d.value_to_metric))+(d.sequence?SH('Suggested call flow')+LI(d.sequence.map((s,i)=>'<b>'+(i+1)+'.</b> '+esc(s))):'');
      case 7: return (d.validation_prompts?SH('Questions to validate')+LI(d.validation_prompts.map(p=>esc(p))):'')+(d.listen_for_cues?SH('Buying signals')+LI(d.listen_for_cues.map(c=>esc(c))):'')+(d.pivot_paths?SH('If they say, pivot to')+d.pivot_paths.map(p=>'<div class="obj-item"><span class="obj-say">"'+esc(p.if_they_say)+'"</span> <span class="obj-arrow">→</span> <span class="obj-resp">'+esc(p.then_pivot_to)+'</span></div>').join(''):'')+(d.dont_say?SH('Phrases to avoid')+d.dont_say.map(a=>'<div style="padding-left:12px;border-left:3px solid var(--fg-danger);color:var(--fg-danger);font-weight:500;margin-bottom:4px">"'+esc(a)+'"</div>').join(''):'')+(d.success_criteria?'<div class="callout-success">'+esc(d.success_criteria)+'</div>':'');
    }
  };
  const card = (d,num,name,q,c) => '<div class="section" id="section-'+num+'" style="border-left:3px solid '+c+'"><div class="section-hdr" style="color:'+c+'"><span class="section-num" style="background:'+c+'">'+num+'</span><span class="section-title">'+name+'</span> <span class="section-q">'+q+'</span></div>'+n(d,num)+'</div>';
  let ol = '<aside class="outline"><div class="outline-hdr">Outline</div><div class="outline-items">';
  for (let i=0;i<7;i++) { ol += '<a href="#section-'+(i+1)+'" class="outline-item" data-num="'+(i+1)+'"><span class="outline-dot" style="background:'+LAYER_C[i]+'"></span><span class="outline-label">Layer '+(i+1)+' &middot; '+LAYER_N[i]+'</span></a>'; }
  ol += '</div></aside>';
  const signalStrength = (data.layer1_account_signals?.signal_confidence || 'medium').toUpperCase();
  const talkingPoints = (data.layer2_industry_pulse?.talk_tracks?.length || 0) + (data.layer3_prospect_intel?.priorities?.length || 0);
  const techDetected = (data.layer4_tech_context?.detected_tech?.length || 0);
  const info = '<div class="info-line"><strong>'+esc(data.company||'Account')+'</strong> &middot; Signal: '+signalStrength+' &middot; '+talkingPoints+' talking points &middot; '+techDetected+' tech detected</div>';
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Brief '+esc(data.company||'Account')+'</title><style>'+CSS+'</style></head><body>'+
    '<header class="toolbar"><div class="toolbar-left"><a href="https://account-intel-kappa.vercel.app/" class="toolbar-logo">Account Intel</a><span class="toolbar-sep"></span><span class="toolbar-title">'+esc(data.company||'Untitled')+'</span></div><div class="toolbar-right"><a href="https://account-intel-kappa.vercel.app/" class="btn">Back to home</a></div></header>'+
    '<div class="app">'+ol+'<main class="content">'+info+
    card(data.layer1_account_signals,1,LAYER_N[0],LAYER_Q[0],LAYER_C[0])+
    card(data.layer2_industry_pulse,2,LAYER_N[1],LAYER_Q[1],LAYER_C[1])+
    card(data.layer3_prospect_intel,3,LAYER_N[2],LAYER_Q[2],LAYER_C[2])+
    card(data.layer4_tech_context,4,LAYER_N[3],LAYER_Q[3],LAYER_C[3])+
    card(data.layer5_competitive_context,5,LAYER_N[4],LAYER_Q[4],LAYER_C[4])+
    card(data.layer6_product_orchestration,6,LAYER_N[5],LAYER_Q[5],LAYER_C[5])+
    card(data.layer7_discovery_support,7,LAYER_N[6],LAYER_Q[6],LAYER_C[6])+
    '<div class="footer">account-intel</div></main></div>'+
    '<script>(function(){var a=document.querySelectorAll(".outline-item"),b=document.querySelectorAll(".section");if(!a.length||!b.length)return;var o=new IntersectionObserver(function(e){e.forEach(function(e){if(e.isIntersecting){var t=e.target.id;a.forEach(function(a){a.classList.toggle("active",a.getAttribute("href")==="#"+t)})}})},{rootMargin:"-80px 0px -60% 0px"});b.forEach(function(e){o.observe(e)})})()<\/script>'+
    '</body></html>';
}

module.exports = async function handler(req, res) {
  const name = req.query.brief;
  if (!name) {
    res.writeHead(302, { Location: 'https://account-intel-kappa.vercel.app/' });
    return res.end();
  }
  try {
    const url = BASE + '/contents/briefs/' + name + '?ref=main';
    const r = await fetch(url, { headers: { Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github.v3+json' } });
    if (!r.ok) { res.statusCode = 404; return res.end('Brief not found'); }
    const data = await r.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const brief = JSON.parse(content);
    const html = renderHTML(brief);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end(html);
  } catch (err) {
    res.statusCode = 500;
    res.end('Error loading brief');
  }
};
