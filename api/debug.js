const { commitFile, listFiles } = require('./_github');
module.exports = async function handler(req, res) {
  try {
    const files = await listFiles('briefs');
    const briefCount = files.length;
    const testResult = await commitFile('briefs/_debug_test.json', JSON.stringify({ t: Date.now() }), 'debug test');
    await commitFile('briefs/_debug_test.json', JSON.stringify({ t: Date.now(), done: true }), 'debug update');
    const hasRepo = !!process.env.GITHUB_REPO;
    res.status(200).json({ briefCount, hasRepo, ok: true, sha: testResult.content.sha });
  } catch (err) { res.status(500).json({ error: err.message }); }
};