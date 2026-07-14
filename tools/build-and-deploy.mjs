import { readFileSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';

const PAYLOAD_PATH = 'C:/Users/Jeremy Mahoney/OneDrive/Documents/GitHub/mahoney-digital/.deploy-payload.json';
const OUT_PATH = 'C:/Users/Jeremy Mahoney/OneDrive/Documents/GitHub/mahoney-digital/.deploy-result.json';

const args = JSON.parse(readFileSync(PAYLOAD_PATH, 'utf8'));

// Write compact args for external MCP caller
const argsPath = 'C:/Users/Jeremy Mahoney/OneDrive/Documents/GitHub/mahoney-digital/.deploy-mcp-args.json';
writeFileSync(argsPath, JSON.stringify({
  target: args.target,
  name: args.name,
  teamId: args.teamId,
  projectSettings: args.projectSettings,
  files: args.files,
}));

console.log(JSON.stringify({
  argsPath,
  bytes: Buffer.byteLength(JSON.stringify(args)),
  files: args.files.length,
  phoneInIndex: args.files.find(f => f.file === 'site/index.html')?.data?.includes('(740) 492-8601') ?? false,
  titleInIndex: args.files.find(f => f.file === 'site/index.html')?.data?.includes('Mahoney Digital | Websites for Small Local Businesses') ?? false,
}));