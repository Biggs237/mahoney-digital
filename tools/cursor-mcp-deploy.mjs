// Reads full deploy payload and writes MCP CallMcpTool-ready arguments to stdout (metadata only)
// Full deploy must be invoked via CallMcpTool with the written args file.
import { readFileSync, writeFileSync } from 'fs';

const INPUT = process.argv[2] || 'C:/Users/Jeremy Mahoney/OneDrive/Documents/GitHub/mahoney-digital/.deploy-payload.json';
const OUT = process.argv[3] || 'C:/Users/Jeremy Mahoney/OneDrive/Documents/GitHub/mahoney-digital/.deploy-mcp-call.json';

const args = JSON.parse(readFileSync(INPUT, 'utf8'));
const callArgs = {
  target: args.target,
  name: args.name,
  teamId: args.teamId,
  projectSettings: args.projectSettings,
  files: args.files,
};
writeFileSync(OUT, JSON.stringify(callArgs));
const idx = callArgs.files.find((f) => f.file === 'site/index.html');
console.log(JSON.stringify({
  out: OUT,
  bytes: Buffer.byteLength(JSON.stringify(callArgs)),
  files: callArgs.files.length,
  title: idx?.data?.includes('Mahoney Digital | Websites for Small Local Businesses'),
  phone: idx?.data?.includes('(740) 492-8601'),
  indexSize: idx?.data?.length,
}));