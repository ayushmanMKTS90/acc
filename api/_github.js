const TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'ayushmanMKTS90/account-intel-layers';
const BRANCH = 'main';
const BASE = 'https://api.github.com/repos/' + REPO;

const headers = {
  Authorization: 'Bearer ' + TOKEN,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
};

async function commitFile(path, content, message) {
  const url = BASE + '/contents/' + path;
  const body = { message, content: Buffer.from(content).toString('base64'), branch: BRANCH };
  let sha;
  const existing = await fetch(url + '?ref=' + BRANCH, { headers });
  if (existing.ok) {
    const data = await existing.json();
    sha = data.sha;
    body.sha = sha;
  }
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('GitHub commit failed: ' + res.status + ' ' + err);
  }
  return res.json();
}

async function listFiles(folder) {
  const url = BASE + '/contents/' + folder + '?ref=' + BRANCH;
  const res = await fetch(url, { headers });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('GitHub list failed: ' + res.status);
  const data = await res.json();
  return Array.isArray(data) ? data.filter(f => f.type === 'file').map(f => ({
    name: f.name,
    path: f.path,
    sha: f.sha,
    size: f.size,
    download_url: f.download_url
  })) : [];
}

async function deleteFile(path, message) {
  const url = BASE + '/contents/' + path;
  const existing = await fetch(url + '?ref=' + BRANCH, { headers });
  if (!existing.ok) return;
  const data = await existing.json();
  const res = await fetch(url, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ message, sha: data.sha, branch: BRANCH })
  });
  if (!res.ok) throw new Error('GitHub delete failed: ' + res.status);
}

module.exports = { commitFile, listFiles, deleteFile, TOKEN, BASE };
