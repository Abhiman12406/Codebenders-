import subprocess
import json

js = 'JSON.stringify((() => { const sb = document.querySelector(\'[role=\\"scrollbar\\"]\'); return { html: sb ? sb.outerHTML.slice(0, 1000) : \\"none\\" }; })())'

res = subprocess.run(f'npx agent-browser --session artcraft-inspect eval "{js}"', capture_output=True, text=True, shell=True)
print("STDOUT:", res.stdout)
if res.stderr:
    print("STDERR:", res.stderr)
