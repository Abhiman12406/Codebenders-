import urllib.request
import re

with open('scratch/artcraft.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', html)
print(f"Checking {len(scripts)} scripts...")

for s in scripts:
    url = f"https://getartcraft.com{s}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        js_content = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
        if 'Page position' in js_content or 'Jump to' in js_content or 'scrollbar' in js_content:
            print(f"FOUND MATCH IN: {s}")
            with open('scratch/ruler_chunk.js', 'w', encoding='utf-8') as out:
                out.write(js_content)
            # Find snippets
            for m in re.finditer(r'(.{0,150}(?:Page position|Jump to|scrollbar).{0,150})', js_content):
                print("  SNIPPET:", m.group(1))
    except Exception as e:
        print(f"Error fetching {s}: {e}")
