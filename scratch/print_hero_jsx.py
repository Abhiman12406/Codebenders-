import urllib.request

url = "https://getartcraft.com/_next/static/chunks/2a06w7_ujr90a.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw_js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

idx = raw_js.find('pointer-events-none relative z-40 w-full')
snippet = raw_js[idx:idx+1500]
print(snippet)
