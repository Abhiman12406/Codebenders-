import urllib.request
import re

url = "https://getartcraft.com/_next/static/chunks/0t89dutxv-24j.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw_js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

# Find where heroWordmark.ready or heroWordmark.els is assigned
for m in re.finditer(r'heroWordmark\.(?:ready|els|baseX)', raw_js):
    idx = m.start()
    print("=== heroWordmark assignment at", idx, "===")
    print(raw_js[max(0, idx - 300):min(len(raw_js), idx + 600)])
