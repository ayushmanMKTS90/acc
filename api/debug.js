const { commitFile, listFiles } = require('./_github');
module.exports = async function handler(req, res) {
  try {
    const token = process.env.GITHUB_TOKEN || '';
    const repo = process.env.GITHUB_REPO || '(not set)';
    const prefix = token.substring(0, 4);
    const suffix = token.substring(token.length - 4);
    const tokenLen = token.length;
    const files = await listFiles('briefs');
    const briefCount = files.length;
    res.status(200).json({ briefCount, repo, tokenPrefix: prefix, tokenSuffix: suffix, tokenLen, ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};