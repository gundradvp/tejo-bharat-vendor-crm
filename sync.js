const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Default repository details (Change if you pushed to a different repo name)
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

function fetchWithHttps(url, maxRedirects = 5) {
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
    req.setTimeout(20000, () => {
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
  console.log(`🚀 Starting sync of Tejo Bharat Solar Vendor Calling CRM into Bolt (${GITHUB_USER}/${REPO_NAME})...`);
  let successCount = 0;
  for (let i = 0; i < filesToSync.length; i++) {
    const ok = await syncFile(filesToSync[i], i + 1, filesToSync.length);
    if (ok) successCount++;
  }
  console.log(`\n🎉 DONE! ${successCount}/${filesToSync.length} files successfully updated inside Bolt!`);

  // Ensure packages are installed
  console.log('📦 Verifying npm packages in Bolt...');
  try {
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    console.log('✅ Dependencies verified and installed!');
  } catch (e) {
    console.warn('⚠️ Please run "npm install" manually if needed.');
  }

  console.log(`\n🌞 Solar Vendor CRM is Ready! Run 'npm run dev' to start preview.`);
}

run();
