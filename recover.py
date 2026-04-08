import json, urllib.request, os, ssl
import sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open('src/lib/seed-data.json', 'r') as f:
    d = json.load(f)

files = set()
def extract(o):
    if isinstance(o, dict):
        for k, v in o.items():
            extract(v)
    elif isinstance(o, list):
        for i in o:
            extract(i)
    elif isinstance(o, str) and o.startswith('/images/seed/'):
        files.add(o.replace('/images/seed/', ''))

extract(d)
print(f"Found {len(files)} files")

if not os.path.exists('public/images/seed'):
    os.makedirs('public/images/seed')

for file in files:
    if os.path.exists(f"public/images/seed/{file}"):
        continue
    
    found = False
    for year in range(2026, 2013, -1):
        for month in range(1, 13):
            url = f"https://www.contraste.tn/wp-content/uploads/{year}/{month:02d}/{file}"
            print(f"Trying {url}...", end="\r")
            try:
                # Add a timeout
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, context=ctx, timeout=3) as response:
                    with open(f"public/images/seed/{file}", 'wb') as out_file:
                        out_file.write(response.read())
                print(f"\nFOUND: {url}")
                found = True
                break
            except Exception as e:
                pass
        if found:
            break
    if not found:
        print(f"\nNOT FOUND: {file}")

