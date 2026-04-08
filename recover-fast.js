const fs = require('fs');
const https = require('https');
const path = require('path');

const seedDataPath = path.join(__dirname, 'src', 'lib', 'seed-data.json');
const publicImagesDir = path.join(__dirname, 'public', 'images', 'seed');

const d = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
const files = new Set();
const extract = (o) => {
  for(let k in o) {
    if(typeof o[k] === 'object' && o[k]) extract(o[k]);
    if(typeof o[k] === 'string' && o[k].startsWith('/images/seed/')) files.add(o[k].replace('/images/seed/', ''));
  }
};
extract(d);

const agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true, maxSockets: 100 });

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', agent }, (res) => {
      res.resume(); // consume response
      if (res.statusCode === 200) resolve(true);
      else resolve(false);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => { req.destroy(); resolve(false); });
    req.end();
  });
}

function downloadUrl(url, filepath) {
  return new Promise((resolve) => {
    https.get(url, { agent }, (res) => {
      if (res.statusCode === 200) {
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on('finish', () => {
          stream.close();
          resolve(true);
        });
      } else {
        res.resume();
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

async function run() {
  const missingFiles = Array.from(files).filter(f => !fs.existsSync(path.join(publicImagesDir, f)));
  console.log(`Checking ${missingFiles.length} missing files...`);
  
  for (const f of missingFiles) {
    console.log(`\nSearching for: ${f}`);
    const urls = [];
    for (let year = 2026; year >= 2014; year--) {
      for (let month = 1; month <= 12; month++) {
        const mm = month.toString().padStart(2, '0');
        urls.push(`https://www.contraste.tn/wp-content/uploads/${year}/${mm}/${f}`);
      }
    }
    
    // Check 20 urls concurrently
    let foundUrl = null;
    for (let i = 0; i < urls.length; i += 20) {
      const batch = urls.slice(i, i + 20);
      const results = await Promise.all(batch.map(async u => {
         const ok = await checkUrl(u);
         if (ok && !foundUrl) foundUrl = u;
         return ok;
      }));
      if (foundUrl) break;
    }
    
    if (foundUrl) {
      console.log(`FOUND: ${foundUrl}`);
      await downloadUrl(foundUrl, path.join(publicImagesDir, f));
    } else {
      console.log(`FAILED TO FIND: ${f}`);
    }
  }
}

run().then(() => console.log('Done'));
