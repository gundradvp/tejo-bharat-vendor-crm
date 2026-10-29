const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_USER = 'gundradvp';
const REPO_NAME = process.env.REPO_NAME || 'tejo-bharat-vendor-crm';
const COMMIT_SHA = 'main';

const filesToSync = [
  'sync.js',
  'package.json',
  'index.html',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json',
  'tsconfig.node.json',
  'public/favicon.svg',
  'public/data/anakapalli.json',
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
  'src/types/vendor.ts',
  'src/utils/formatters.ts',
  'src/utils/solarPitch.ts',
  'src/services/storageService.ts',
  'src/components/Navbar.tsx',
  'src/components/DashboardMetrics.tsx',
  'src/components/VendorList.tsx',
  'src/components/VendorDetailModal.tsx',
  'src/components/PowerDialerModal.tsx',
  'src/components/KanbanBoard.tsx',
  'src/components/FollowUpQueue.tsx',
  'src/components/ImportDistrictModal.tsx',
  'src/components/SalesPitchDrawer.tsx',
  'src/components/ExportBackupModal.tsx'
];

// Clean up Bolt starter template files that shadow TypeScript files
const filesToCleanup = [
  'src/App.jsx',
  'src/main.jsx',
  'src/App.css',
  'src/assets/react.svg'
];

function fetchWithHttps(url, maxRedirects = 5) {
  // If global fetch exists (Node 18+ in Bolt), prefer it
  if (typeof fetch === 'function') {
    return fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      });
  }

  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) return reject(new Error('Too many redirects'));
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Bolt-Sync/1.0)',
        'Accept': '*/*'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchWithHttps(res.headers.location, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function syncFile(file, index, total) {
  const ts = Date.now();
  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${COMMIT_SHA}/${file}?t=${ts}`;
  const cdnUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${REPO_NAME}@${COMMIT_SHA}/${file}`;

  let content = null;
  try {
    content = await fetchWithHttps(rawUrl);
  } catch (e) {
    try {
      content = await fetchWithHttps(cdnUrl);
    } catch (e2) {}
  }

  if (content === null) {
    console.error(`❌ [${index}/${total}] Failed to fetch: ${file}`);
    return false;
  }

  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`✅ [${index}/${total}] Updated ${file}`);
  return true;
}

async function run() {
  console.log(`\n🚀 Starting sync of Tejo Bharat Solar Vendor Calling CRM into Bolt...`);
  console.log(`📥 Repository: ${GITHUB_USER}/${REPO_NAME} (${COMMIT_SHA})\n`);

  // 1. Clean up default starter template files
  for (const f of filesToCleanup) {
    try {
      if (fs.existsSync(f)) {
        fs.unlinkSync(f);
        console.log(`🧹 Removed default starter file: ${f}`);
      }
    } catch (e) {}
  }

  // 2. Sync all files
  let successCount = 0;
  for (let i = 0; i < filesToSync.length; i++) {
    const ok = await syncFile(filesToSync[i], i + 1, filesToSync.length);
    if (ok) successCount++;
  }

  console.log(`\n🎉 DONE! ${successCount}/${filesToSync.length} files successfully synced into Bolt!`);
  console.log(`\n======================================================`);
  console.log(`⚡ NEXT STEPS TO VIEW YOUR SOLAR CRM:`);
  console.log(`1. Stop any running server: Press Ctrl + C`);
  console.log(`2. Install dependencies:    npm install`);
  console.log(`3. Start mobile CRM:        npm run dev`);
  console.log(`======================================================\n`);
}

run();
