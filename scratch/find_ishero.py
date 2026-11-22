import urllib.request
import re

url = "https://getartcraft.com/_next/static/chunks/0t89dutxv-24j.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw_js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

# Find all occurrences of isHero
for m in re.finditer(r'isHero', raw_js):
    idx = m.start()
    print("=== isHero at", idx, "===")
    print(raw_js[max(0, idx - 400):min(len(raw_js), idx + 800)])
