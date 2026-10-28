#!/usr/bin/env python3
"""Non-mutating comparison: V4.5.2c TOP route vs revised user route image."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt
root=Path(__file__).resolve().parent.parent
im=np.asarray(Image.open(root/'assets/user_rift_masks_20261026/masks/Rotas-Mapa-Top-MId-bottom.jpg').convert('L'))
ink=im<120
# Pixel distance of route vertices to nearest marked route. This is a generic
# distance only; without individual lane labels it cannot validate TOP identity.
D=distance_transform_edt(~ink)
mapdata=json.loads((root/'data/coachlol_map_v6.json').read_text())
report={'schema':'coachlol.route-mask-audit.v1','status':'ANALYSIS_ONLY_NO_RUNTIME_CHANGE','source':'Rotas-Mapa-Top-MId-bottom.jpg','method':'distance to any dark route pixel; not semantic top-lane certification','lanes':{}}
for lane in ['top','mid','bot']:
    points=mapdata['waveSystem']['lanes'][lane]['blueToRed']
    samples=[float(D[min(4095,int(y*4096)),min(4095,int(x*4096))]) for x,y in points]
    report['lanes'][lane]={'vertices':len(samples),'meanPixelsNearestPaintedRoute':round(float(np.mean(samples)),2),'maxPixelsNearestPaintedRoute':round(float(np.max(samples)),2),'outliersBeyond16Px':sum(x>16 for x in samples)}
out=root/'docs/QA_EVIDENCE_V452D4_DEV3';out.mkdir(parents=True,exist_ok=True)
(out/'top_route_audit.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
