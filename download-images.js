const fs = require('fs');
const path = require('path');
const https = require('https');

const seedDataPath = path.join(__dirname, 'src', 'lib', 'seed-data.json');
const publicImagesDir = path.join(__dirname, 'public', 'images', 'seed');

if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

let seedDataStr = fs.readFileSync(seedDataPath, 'utf8');
let seedData = JSON.parse(seedDataStr);

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      console.log(`Already exists: ${filepath}`);
      return resolve();
    }
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Failed to download ${url}: ${res.statusCode}`);
        return resolve(); // Resolve anyway so we don't break the whole loop
      }
      const stream = fs.createWriteStream(filepath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      console.error(`Error downloading ${url}: ${err.message}`);
      resolve();
    });
  });
};

async function processObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      await processObject(obj[key]);
    } else if (typeof obj[key] === 'string' && obj[key].startsWith('https://www.contraste.tn/wp-content/uploads/')) {
      const url = obj[key];
      const filename = url.split('/').pop();
      const localRelativePath = `/images/seed/${filename}`;
      const localAbsolutePath = path.join(publicImagesDir, filename);
      
      await downloadImage(url, localAbsolutePath);
      obj[key] = localRelativePath;
    }
  }
}

async function main() {
  console.log('Starting image download process...');
  await processObject(seedData);
  fs.writeFileSync(seedDataPath, JSON.stringify(seedData, null, 2), 'utf8');
  console.log('Done mapping local images.');
}

main().catch(console.error);

