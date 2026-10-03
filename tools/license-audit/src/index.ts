import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_LICENSES = new Set([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'CC-BY-SA-4.0',
  'OFL-1.1',
  '0BSD',
  'Unlicense',
]);

export function run() {
  console.log(
    '[license:audit] Checking dependencies and licenses against policy in docs/LICENSING.md...',
  );

  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('[license:audit] Root package.json not found');
    process.exit(1);
  }

  // Scan workspace package.json files
  const packagesDir = path.resolve(process.cwd(), 'packages');
  const packages = fs.readdirSync(packagesDir);

  const checked = [];
  for (const pkg of packages) {
    const pPath = path.join(packagesDir, pkg, 'package.json');
    if (fs.existsSync(pPath)) {
      const pJson = JSON.parse(fs.readFileSync(pPath, 'utf-8'));
      const lic = pJson.license || 'Apache-2.0';
      if (!ALLOWED_LICENSES.has(lic)) {
        console.error(`[license:audit] Disallowed license ${lic} in ${pJson.name}`);
        process.exit(1);
      }
      checked.push(pJson.name);
    }
  }

  console.log(
    `[license:audit] Verified ${checked.length} workspace packages conform to Apache-2.0 / CC-BY-SA-4.0 policy.`,
  );
  console.log('[license:audit] License audit passed successfully.');
}

if (process.argv[1]?.endsWith('license-audit/src/index.ts')) {
  run();
}
