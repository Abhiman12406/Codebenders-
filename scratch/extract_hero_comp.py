import urllib.request
import re

url = "https://getartcraft.com/_next/static/chunks/2a06w7_ujr90a.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw_js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

idx = raw_js.find('heroWordmark.els=e')
start = max(0, idx - 1500)
end = min(len(raw_js), idx + 2500)

with open('scratch/hero_wordmark_component.js', 'w', encoding='utf-8') as f:
    f.write(raw_js[start:end])

print("Written hero_wordmark_component.js (length:", len(raw_js[start:end]), ")")
