const fs = require('fs');
const https = require('https');
const path = require('path');

const seedDataPath = path.join(__dirname, 'src', 'lib', 'seed-data.json');
const publicImagesDir = path.join(__dirname, 'public', 'images', 'seed');

const obj = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
const files = new Set();
const extract = (o) => {
  for(let k in o) {
    if(typeof o[k] === 'object' && o[k]) extract(o[k]);
    if(typeof o[k] === 'string' && o[k].startsWith('/images/seed/')) files.add(o[k].replace('/images/seed/', ''));
  }
};
extract(obj);
const filesArray = Array.from(files);
console.log(`Found ${filesArray.length} files to recover.`);

const agent = new https.Agent({ rejectUnauthorized: false });

const tryDownload = (url, filepath) => {
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
        res.on('data', () => {});
        res.on('end', () => {});
        resolve(false);
      }
    }).on('error', (e) => {
      resolve(false);
    });
  });
};

async function recover() {
  for (let i = 0; i < filesArray.length; i++) {
    const file = filesArray[i];
    const filepath = path.join(publicImagesDir, file);
    if (fs.existsSync(filepath)) {
      continue;
    }

    let found = false;
    for (let year = 2026; year >= 2014; year--) {
      const promises = [];
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const url = `https://www.contraste.tn/wp-content/uploads/${year}/${monthStr}/${file}`;
        promises.push(tryDownload(url, filepath).then(success => ({ success, url })));
      }
      const results = await Promise.all(promises);
      for (const res of results) {
        if (res.success) {
          console.log(`Downloaded ${file}`);
          found = true;
          break;
        }
      }
      if (found) break; 
    }
    if (!found) {
      console.log(`FAILED: ${file}`);
    }
  }
}

recover().then(() => console.log('ALL DONE')).catch(console.error);

