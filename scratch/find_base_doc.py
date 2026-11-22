import urllib.request
import re

with open('scratch/artcraft.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', html)

for s in scripts:
    url = f"https://getartcraft.com{s}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        js = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
        if 'baseDocY' in js or 'baseX' in js or 'heroWordmark' in js:
            print(f"=== FOUND in {s} ===")
            for m in re.finditer(r'(.{0,100}(?:heroWordmark|baseDocY).{0,150})', js):
                print("  MATCH:", m.group(1))
    except Exception as e:
        pass
