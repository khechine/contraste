import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const publicImagesDir = path.join(process.cwd(), 'public', 'images', 'seed');

async function run() {
  const allMedia = [];
  let page = 1;
  while (true) {
    try {
      const resp = execSync(`curl -s -k "https://www.contraste.tn/wp-json/wp/v2/media?per_page=100&page=${page}"`, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 100 });
      const json = JSON.parse(resp);
      if (json.length === 0 || json.code) break;
      allMedia.push(...json);
      page++;
    } catch (e) {
      break;
    }
  }

  const urlMap = {};
  for (const m of allMedia) {
    if (m.source_url) {
      const filename = m.source_url.split('/').pop();
      urlMap[filename] = m.source_url;
      urlMap[decodeURIComponent(filename)] = m.source_url;
    }
    if (m.media_details && m.media_details.sizes) {
      for (const sizeKey in m.media_details.sizes) {
        const sizeObj = m.media_details.sizes[sizeKey];
        if (sizeObj && sizeObj.source_url) {
          const sizeFilename = sizeObj.source_url.split('/').pop();
          urlMap[sizeFilename] = sizeObj.source_url;
          urlMap[decodeURIComponent(sizeFilename)] = sizeObj.source_url;
        }
      }
    }
  }

  const seedDataPath = path.join(process.cwd(), 'src', 'lib', 'seed-data.json');
  const d = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
  const files = new Set();
  const extract = (o) => {
    for(let k in o) {
      if(typeof o[k] === 'object' && o[k]) extract(o[k]);
      if(typeof o[k] === 'string' && o[k].startsWith('/images/seed/')) files.add(o[k].replace('/images/seed/', ''));
    }
  };
  extract(d);
  
  for (const f of files) {
    const targetPath = path.join(publicImagesDir, f);
    if (fs.existsSync(targetPath)) continue;
    
    let url = urlMap[f] || urlMap[decodeURIComponent(f)];
    if (!url) {
       const looseMatch = Object.keys(urlMap).find(k => k.includes(f) || f.includes(k));
       if (looseMatch) url = urlMap[looseMatch];
    }
    
    if (url) {
      try {
        execSync(`curl --insecure -s "${url}" -o "${targetPath}"`);
      } catch (e) {}
    }
  }
}
run();
