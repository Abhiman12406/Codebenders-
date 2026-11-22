import urllib.request

url = "https://getartcraft.com/_next/static/chunks/0t89dutxv-24j.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw_js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

idx = raw_js.find('Page position')
start = max(0, idx - 6000)
end = min(len(raw_js), idx + 8000)
snippet = raw_js[start:end]

with open('scratch/ruler_raw.js', 'w', encoding='utf-8') as f:
    f.write(snippet)

print("Saved raw chunk snippet around 'Page position' (length:", len(snippet), ")")
