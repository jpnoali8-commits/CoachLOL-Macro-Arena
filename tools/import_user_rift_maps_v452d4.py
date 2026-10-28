#!/usr/bin/env python3
"""Import the user's 4096² annotated atlas as reproducible 128² elemental deltas.

Do not treat the annotations as official Riot coordinate certification. The input
JPGs remain unmodified. The baseline coachlol mask remains immutable.
"""
from pathlib import Path
import argparse, hashlib, json
import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/user_rift_masks_20261026'
OUT = ROOT / 'data/rift_bundles'
ATLAS = 4096

def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def mono(name, size):
    path = SRC/'masks'/name
    im = Image.open(path).convert('L')
    if im.size != (ATLAS, ATLAS): raise ValueError(f'{name}: atlas incorreto: {im.size}')
    return np.asarray(im.resize((size, size), Image.Resampling.BOX)) < 127

def marks(name, prefix, minimum=150):
    path = SRC/'masks'/name
    im = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
    if im is None or im.shape != (ATLAS, ATLAS): raise ValueError(f'arquivo invalido: {name}')
    binary = np.uint8(im < 100)
    n, labels, boxes, centroids = cv2.connectedComponentsWithStats(binary, 8)
    rows = sorted([(float(centroids[i,0]),float(centroids[i,1]),int(boxes[i,4])) for i in range(1,n) if int(boxes[i,4])>=minimum],key=lambda v:(v[1],v[0]))
    return [dict(id=f'{prefix}_{i:02}',x=round(x/ATLAS,6),y=round(y/ATLAS,6),sourcePixels=area) for i,(x,y,area) in enumerate(rows,1)]

def build():
    base = json.loads((ROOT/'data/masks_128.json').read_text())
    size = base['size']; assert size==128
    original = {k: np.asarray([c=='1' for c in base[k]],dtype=bool).reshape(size,size) for k in ('wall','brush')}
    metrics = {}
    for k,file in [('wall','Colisores-Mapa.jpg'),('brush','Brushs-Moitas-Mapa.jpg')]:
        detected = mono(file,size)
        metrics[k]={'agreement':round(float(np.mean(detected==original[k])),5),'differentCells':int(np.sum(detected!=original[k]))}
        if metrics[k]['agreement']<0.97: raise ValueError(f'A mascara {file} nao alinha ao atlas base!')
    variants={}
    for element,k,file in [('mountain','wall','Colisores-mountain-drag-Mapa.jpg'),('ocean','brush','Brushs-Moitas-Ocean-Drag-Mapa.jpg')]:
        dest=mono(file,size);before=original[k]
        added=np.flatnonzero(np.logical_and(~before,dest)).tolist();removed=np.flatnonzero(np.logical_and(before,~dest)).tolist()
        variants[element]={'schema':'coachlol.rift-bundle.v1','element':element,'size':size,'addWall':added if k=='wall' else [],'removeWall':removed if k=='wall' else [],'addBrush':added if k=='brush' else [],'removeBrush':removed if k=='brush' else [],'features':{}}
        metrics[element]={'added':len(added),'removed':len(removed),'changed':len(added)+len(removed),'source':file}
    for e in ['infernal','cloud','chemtech','hextech']:
        variants[e]={'schema':'coachlol.rift-bundle.v1','element':e,'size':size,'addWall':[],'removeWall':[],'addBrush':[],'removeBrush':[],'features':{}}
    base_plants=marks('Jump-fruit-map.jpg','blast_cone')
    for p in base_plants:p.update(kind='blast_cone',radius=.030,landingDistance=.052,respawnSeconds=90)
    base_faelights=marks('Point-Vision-Buff-map.jpg','faelight',400)
    for p in base_faelights:p.update(radius=.012,bonusRadius=.060,bonusSeconds=45)
    chem_heal=marks('fruit-quimtech-drag.jpg','stim_fruit')
    for p in chem_heal:p.update(kind='stim_fruit',radius=.020,respawnSeconds=90)
    chem_vision=marks('Vision-quimtech-drag.jpg','firelight_bloom')
    for p in chem_vision:p.update(kind='firelight_bloom',radius=.020,respawnSeconds=90)
    variants['chemtech']['features']['plants'] = chem_heal+chem_vision
    # Four painted wind footprints; approximate each with a bounded circle.
    # Exact shaped polygons would require a higher-resolution runtime mask.
    img=cv2.imread(str(SRC/'masks/aren-move-speed-drag-elemental.jpg'),cv2.IMREAD_GRAYSCALE)
    n,labels,boxes,centroids=cv2.connectedComponentsWithStats(np.uint8(img<100),8)
    zones=[]
    components=sorted([(centroids[i],boxes[i]) for i in range(1,n) if boxes[i,4]>25000],key=lambda v:(v[0][1],v[0][0]))
    for i,(c,b) in enumerate(components,1):
        zones.append({'id':f'cloud_wind_{i:02}','x':round(float(c[0])/ATLAS,6),'y':round(float(c[1])/ATLAS,6),
            'radius':round(max(b[2],b[3])/(2*ATLAS),5),'moveBonus':0.20,'sourcePixels':int(b[4]),'approximation':'circle_over_painted_zone'})
    variants['cloud']['features']['windZones']=zones
    # Each drawn Hexgate connector is a component with two far endpoints.
    img=cv2.imread(str(SRC/'masks/Hextech-drag-portals-mask-map-ligations.jpg'),cv2.IMREAD_GRAYSCALE)
    binary=np.uint8(img<100)
    n,labels,boxes,centroids=cv2.connectedComponentsWithStats(binary,8)
    lines=sorted([(i,centroids[i],boxes[i]) for i in range(1,n) if boxes[i,4]>2000],key=lambda v:(v[1][1],v[1][0]))
    gates=[]
    for i,(idx,_,stats) in enumerate(lines,1):
        ys,xs=np.nonzero(labels[stats[1]:stats[1]+stats[3],stats[0]:stats[0]+stats[2]]==idx)
        coords=np.column_stack((xs+stats[0],ys+stats[1])).astype(np.float64)
        if len(coords)<2: continue
        center=coords.mean(axis=0);_,_,vt=np.linalg.svd(coords-center,full_matrices=False)
        along=(coords-center) @ vt[0];extremes=[coords[np.argmin(along)],coords[np.argmax(along)]]
        for j,p in enumerate(extremes):
            gates.append({'id':f'hexgate_{i:02}_{"a" if j==0 else "b"}', 'pairId':f'hexgate_{i:02}_{"b" if j==0 else "a"}',
                 'x':round(float(p[0])/ATLAS,6),'y':round(float(p[1])/ATLAS,6),'channelSeconds':2.0,'lineId':i})
    variants['hextech']['features']['hexgates']=gates
    for element,bundle in variants.items():
        (OUT/f'{element}.json').write_text(json.dumps(bundle,ensure_ascii=False,indent=2)+'\n')
    # Bootstrap stays static/offline in file:// mode; don't use fetch() for bundles.
    bootstrap=ROOT/'data/rift_user_assets_v452d4.js'
    manifest={'schema':'coachlol.rift-user-masks.v1','status':'GAMEPLAY_PARTIAL_NOT_RIOT_1_TO_1',
       'coordinateSystem':'4096 pixel top-left maps to normalized 0..1, 128x128 BOX, black pixel < 127',
       'baseFeatures':{'plants':base_plants,'faelights':base_faelights},'variants':variants,
       'sourceHashes':{p.name:digest(p) for p in SRC.rglob('*.jpg')},'counts':{
        'baseJumpFruits':len(base_plants),'faelights':len(base_faelights),'stimFruits':len(chem_heal),
        'firelightBlooms':len(chem_vision),'hexgatePairs':len(gates)//2,'cloudZones':len(zones)},'metrics':metrics}
    (ROOT/'data/rift_user_manifest_v452d4.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    bootstrap.write_text('/* Generated from user-provided 4096 px masks, do not edit by hand. */\n'+
      'window.COACH_RIFT_USER_V452D4='+json.dumps({'baseFeatures':manifest['baseFeatures'],'variants':variants},ensure_ascii=False,separators=(',',':'))+';\n')
    print(json.dumps({'metrics':metrics,'counts':manifest['counts']},ensure_ascii=False,indent=2))
    return manifest

if __name__=='__main__':build()
