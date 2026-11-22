import urllib.request
import re
import json

req = urllib.request.Request('https://getartcraft.com', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

print('HTML length:', len(html))

# Save html to scratch for deep inspection
with open('scratch/artcraft.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Look for scripts
scripts = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', html)
print('Scripts found:', len(scripts))
for s in scripts:
    print('Script src:', s)

# Find sections and anchors
anchors = re.findall(r'<a[^>]+href=[\'"](#[^\'"]+)[\'"][^>]*>([^<]*)</a>', html)
print('Hash anchors:', anchors)

# Find any mentions of ruler or scroll
snippets = re.findall(r'(.{0,60}(?:ruler|scroll-bar|scrollbar|Jump to ARTCRAFT).{0,60})', html, re.I)
print('Snippets found:', len(snippets))
for s in snippets[:10]:
    print('Snippet:', s.strip())
