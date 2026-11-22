import urllib.request
import re

url = "https://getartcraft.com/_next/static/chunks/0t89dutxv-24j.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw_js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

matches = [m.start() for m in re.finditer(r'heroWordmark', raw_js)]
print(f"Found {len(matches)} matches for heroWordmark")
for idx in matches:
    start = max(0, idx - 400)
    end = min(len(raw_js), idx + 800)
    print("--- HEROWORDMARK MATCH ---")
    print(raw_js[start:end])
    print("--------------------------")
