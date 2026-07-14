// Loads deploy payload and prints MCP tool arguments as single-line JSON to stdout
import { readFileSync } from 'fs';
const args = JSON.parse(readFileSync('C:/Users/Jeremy Mahoney/OneDrive/Documents/GitHub/mahoney-digital/.deploy-payload.json', 'utf8'));
const out = {
  target: args.target,
  name: args.name,
  teamId: args.teamId,
  projectSettings: args.projectSettings,
  files: args.files,
};
process.stdout.write(JSON.stringify(out));