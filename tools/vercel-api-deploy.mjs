import fs from 'fs';
import path from 'path';

const PAYLOAD_PATH = 'C:/Users/Jeremy Mahoney/OneDrive/Documents/GitHub/mahoney-digital/.deploy-payload.json';
const CREDS_PATH = 'C:/Users/Jeremy Mahoney/.grok/mcp_credentials.json';
const OUT_PATH = 'C:/Users/Jeremy Mahoney/OneDrive/Documents/GitHub/mahoney-digital/.deploy-result.json';

function getToken() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
  return creds['vercel:https://mcp.vercel.com/']?.token_response?.access_token;
}

async function main() {
  const token = getToken();
  if (!token) throw new Error('No Vercel token');

  const payload = JSON.parse(fs.readFileSync(PAYLOAD_PATH, 'utf8'));
  const teamId = 'team_mLJtakdtY16nQBg1UPrG5R0F';

  const body = {
    name: payload.name,
    files: payload.files,
    projectSettings: payload.projectSettings,
    target: payload.target,
  };

  console.log(`Creating deployment: ${payload.name} -> ${payload.target} (${payload.files.length} files)...`);

  const res = await fetch(`https://api.vercel.com/v13/deployments?teamId=${teamId}&forceNew=1`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  const result = {
    status: res.status,
    ok: res.ok,
    body: json,
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));

  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error('DEPLOY_ERROR:', err.message);
  process.exit(1);
});