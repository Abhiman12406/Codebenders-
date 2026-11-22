with open('scratch/artcraft.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re

# Look for Jump to ARTCRAFT
matches = [m.start() for m in re.finditer(r'Jump to', html, re.I)]
print(f'Found {len(matches)} matches for Jump to:')
for idx in matches:
    print('--- MATCH ---')
    print(html[max(0, idx-100):min(len(html), idx+300)])

# Look for ARTCRAFT in headings or large texts
matches_h1 = [m.start() for m in re.finditer(r'<h[1-3][^>]*>', html)]
for idx in matches_h1:
    print('--- HEADING ---')
    print(html[idx:min(len(html), idx+200)])
