#!/usr/bin/env python3
"""Generate browser engine from the canonical ESM, preserving identical logic."""
from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
s=(root/'engine.mjs').read_text()
names=re.findall(r'^export (?:const|function|class)\s+([A-Za-z_$][\w$]*)',s,re.M)
assert len(names)==len(set(names))
s=re.sub(r'^export (?=(?:const|function|class)\s)', '', s, flags=re.M)
(root/'engine.browser.js').write_text('(()=>{\n'+s+'\nwindow.CoachArena={'+','.join(names)+'};\n})();\n')
print('synced',len(names),'exports')
