#!/bin/bash
mkdir -p public/images/seed

FILES=$(node -e "
const fs = require('fs');
const d = JSON.parse(fs.readFileSync('src/lib/seed-data.json', 'utf8'));
const files = new Set();
const extract = (o) => {
  for(let k in o) {
    if(typeof o[k] === 'object' && o[k]) extract(o[k]);
    if(typeof o[k] === 'string' && o[k].startsWith('/images/seed/')) files.add(o[k].replace('/images/seed/', ''));
  }
};
extract(d);
for(let f of files) { console.log(f); }
")

for f in $FILES; do
  if [ -f "public/images/seed/$f" ]; then
    continue
  fi
  
  echo "Trying to recover: $f"
  found=0
  for year in $(seq 2026 -1 2014); do
    for month in $(seq -w 1 12); do
      url="https://www.contraste.tn/wp-content/uploads/$year/$month/$f"
      code=$(curl --insecure -s -w "%{http_code}" -o /dev/null "$url")
      if [ "$code" = "200" ]; then
        curl --insecure -s -o "public/images/seed/$f" "$url"
        echo "✅ DOWNLOADED: $url"
        found=1
        break
      fi
    done
    if [ "$found" -eq 1 ]; then
      break
    fi
  done
  if [ "$found" -eq 0 ]; then
    echo "❌ FAILED: $f"
  fi
done
