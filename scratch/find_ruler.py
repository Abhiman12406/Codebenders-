with open('scratch/artcraft.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re

m = re.search(r'aria-label=["\']Page position["\']', html)
if m:
    start = max(0, m.start() - 200)
    end = min(len(html), m.start() + 3000)
    print("MATCH aria-label Page position:")
    print(html[start:end])
else:
    print("Not found in static HTML, might be rendered in client chunk.")
    # Search for "Page position" anywhere
    m2 = re.search(r'Page position', html)
    if m2:
        print("Found 'Page position' at", m2.start())
        print(html[max(0, m2.start()-100):min(len(html), m2.start()+500)])
