import { readFileSync, writeFileSync } from 'fs';

const CREDS_PATH = 'C:/Users/Jeremy Mahoney/.grok/mcp_credentials.json';
const PAYLOAD_PATH = 'C:/Users/Jeremy Mahoney/OneDrive/Documents/GitHub/mahoney-digital/.deploy-payload.json';
const OUT_PATH = 'C:/Users/Jeremy Mahoney/OneDrive/Documents/GitHub/mahoney-digital/.deploy-result.json';

const creds = JSON.parse(readFileSync(CREDS_PATH, 'utf8'));
const token = creds['vercel:https://mcp.vercel.com/'].token_response.access_token;
const args = JSON.parse(readFileSync(PAYLOAD_PATH, 'utf8'));

const baseUrl = 'https://mcp.vercel.com/';
let sessionId = null;
let requestId = 0;

async function mcpRequest(method, params) {
  const body = { jsonrpc: '2.0', id: ++requestId, method, params };
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
    Authorization: `Bearer ${token}`,
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const newSession = res.headers.get('mcp-session-id');
  if (newSession) sessionId = newSession;

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`MCP ${method} failed ${res.status}: ${text.slice(0, 500)}`);
  }

  if (text.includes('event:')) {
    const dataLines = text.split('\n').filter((l) => l.startsWith('data: '));
    const results = [];
    for (const line of dataLines) {
      try {
        results.push(JSON.parse(line.slice(6)));
      } catch {}
    }
    return results.at(-1) ?? { raw: text.slice(0, 1000) };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 1000) };
  }
}

console.log(`Deploying ${args.files.length} files to ${args.target}...`);

const init = await mcpRequest('initialize', {
  protocolVersion: '2024-11-05',
  capabilities: {},
  clientInfo: { name: 'mahoney-digital-deploy', version: '1.0.0' },
});
console.log('Initialized session:', sessionId);

await mcpRequest('notifications/initialized', {});

const result = await mcpRequest('tools/call', {
  name: 'deploy_to_vercel',
  arguments: {
    target: args.target,
    name: args.name,
    teamId: args.teamId,
    projectSettings: args.projectSettings,
    files: args.files,
  },
});

writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
console.log('Deploy result:', JSON.stringify(result, null, 2).slice(0, 12000));