const { commitFile, listFiles, deleteFile } = require('./_github');

module.exports = async function handler(req, res) {
  const type = req.query.type;
  try {
    if (req.method === 'GET' && type === 'briefs') {
      const files = await listFiles('briefs');
      const briefs = files.map(f => {
        const name = f.name.replace('.json', '');
        const parts = name.split('-');
        const ts = parts.pop();
        const company = parts.join('-') || 'Untitled';
        return { name: f.name, company, path: f.path, ts };
      });
      briefs.sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0));
      return res.status(200).json(briefs);
    }

    if (req.method === 'GET' && type === 'icps') {
      const files = await listFiles('icps');
      const profiles = files.map(f => {
        const name = f.name.replace('.json', '');
        const parts = name.split('-');
        const ts = parts.pop();
        const label = parts.join('-') || 'ICP Profile';
        return { name: f.name, label, path: f.path, ts };
      });
      profiles.sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0));
      return res.status(200).json(profiles);
    }

    if (req.method === 'GET' && (type === 'brief' || type === 'icp')) {
      const name = req.query.name;
      if (!name) return res.status(400).json({ error: 'name query param required' });
      const folder = type === 'brief' ? 'briefs' : 'icps';
      const TOKEN = process.env.GITHUB_TOKEN;
      const REPO = process.env.GITHUB_REPO || 'ayushmanMKTS90/account-intel-layers';
      const url = 'https://api.github.com/repos/' + REPO + '/contents/' + folder + '/' + name + '?ref=main';
      const r = await fetch(url, { headers: { Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github.v3+json' } });
      if (!r.ok) return res.status(404).json({ error: 'Not found' });
      const data = await r.json();
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      return res.status(200).json(JSON.parse(content));
    }

    if (req.method === 'POST' && type === 'icp') {
      const { company, industry, domain, role, seniority, signals, painPoint } = req.body || {};
      if (!company && !industry) return res.status(400).json({ error: 'company or industry required' });
      const profile = { company: company || '', industry: industry || '', domain: domain || '', role: role || '', seniority: seniority || '', signals: signals || [], painPoint: painPoint || '', date: new Date().toISOString() };
      const safeName = (company || 'profile').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
      const ts = Date.now();
      await commitFile('icps/' + safeName + '-' + ts + '.json', JSON.stringify(profile, null, 2), 'Save ICP: ' + company);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE' && (type === 'brief' || type === 'icp')) {
      const name = req.query.name;
      if (!name) return res.status(400).json({ error: 'name query param required' });
      const folder = type === 'brief' ? 'briefs' : 'icps';
      await deleteFile(folder + '/' + name, 'Delete ' + type + ': ' + name);
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid request' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
