import urllib.request
import re

url = "https://getartcraft.com/_next/static/chunks/0t89dutxv-24j.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw_js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

# Find RULER_SECTIONS or HERO_SECTION_ID
matches = [m.start() for m in re.finditer(r'HERO_SECTION_ID|RULER_SECTIONS', raw_js)]
print(f"Found {len(matches)} matches for HERO_SECTION_ID / RULER_SECTIONS")
for idx in matches:
    start = max(0, idx - 500)
    end = min(len(raw_js), idx + 2500)
    print("--- SECTION MATCH ---")
    print(raw_js[start:end])
    print("---------------------")
