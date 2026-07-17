/**
 * Site deploy helper — GitHub → Vercel only.
 *
 * Direct Vercel file uploads via stored MCP tokens are unreliable
 * (invalidToken / incomplete payloads / Python mis-detect).
 * Production is always updated by pushing master to GitHub.
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

console.log(`
Mahoney Digital — production deploy
====================================
Repo:  ${root}
Live:  https://mahoneydigital.net

Use git push (GitHub is connected to Vercel):

  cd "${root}"
  git add -A
  git commit -m "Your message"
  git push origin master

Do NOT use deploy_to_vercel MCP with a partial file list.
See docs/DEPLOY.md for details.
`);

try {
  const status = execSync('git status -sb', { cwd: root, encoding: 'utf8' });
  console.log('Current git status:\n' + status);
  const log = execSync('git log -1 --oneline', { cwd: root, encoding: 'utf8' });
  console.log('HEAD:', log.trim());
} catch (e) {
  console.error('Could not read git status:', e.message);
  process.exit(1);
}
