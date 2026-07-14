import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const credPath = path.join(process.env.USERPROFILE, '.grok', 'mcp_credentials.json');
const cred = JSON.parse(fs.readFileSync(credPath, 'utf8'));
const token = cred['vercel:https://mcp.vercel.com/'].token_response.access_token;
const teamId = 'team_mLJtakdtY16nQBg1UPrG5R0F';

const files = [];
function walk(dir, base = '') {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, rel);
    else files.push({ full, file: rel.replace(/\\/g, '/') });
  }
}
walk(path.join(root, 'site'), 'site');
files.unshift({ full: path.join(root, 'vercel.json'), file: 'vercel.json' });

async function uploadFile(filePath, relPath) {
  const data = fs.readFileSync(filePath);
  const sha = crypto.createHash('sha1').update(data).digest('hex');
  const size = data.length;
  const res = await fetch(`https://api.vercel.com/v2/files?teamId=${teamId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'x-vercel-digest': sha,
      'x-vercel-size': String(size),
    },
    body: data,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed ${relPath}: ${res.status} ${text}`);
  }
  return { file: relPath, sha, size };
}

async function main() {
  console.log(`Uploading ${files.length} files...`);
  const uploaded = [];
  for (const f of files) {
    uploaded.push(await uploadFile(f.full, f.file));
    process.stdout.write('.');
  }
  console.log('\nCreating deployment...');
  const body = {
    name: 'mahoney-digital',
    project: 'mahoney-digital',
    target: 'production',
    files: uploaded,
    projectSettings: {
      framework: null,
      buildCommand: '',
      installCommand: '',
      outputDirectory: 'site',
    },
  };
  const res = await fetch(`https://api.vercel.com/v13/deployments?teamId=${teamId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log('status', res.status);
  console.log(text.slice(0, 3000));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});