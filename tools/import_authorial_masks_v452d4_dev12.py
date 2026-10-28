#!/usr/bin/env python3
"""Re-import authored 4096px masks; preserve existing typed features & inherited git.
Tier mapping is a documented 5/10 approximation, NOT an assertion that black dots encode spawn time.
"""
from pathlib import Path
import json, shutil, hashlib
import cv2
import numpy as np
from PIL import Image
from scipy.optimize import linear_sum_assignment
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets/user_rift_masks_20261026/masks'
DATA=ROOT/'data';N=128
RAW=json.loads((DATA/'rift_user_manifest_v452d4.json').read_text())
MASK=json.loads((DATA/'masks_128.json').read_text())
def hashfile(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def mono(name):
 im=Image.open(SRC/name).convert('L')
 assert im.size==(4096,4096)
 return np.asarray(im.resize((N,N),Image.Resampling.BOX))<127
def marks(name,prefix):
 img=cv2.imread(str(SRC/name),cv2.IMREAD_GRAYSCALE)
 n,labels,stats,cent=cv2.connectedComponentsWithStats(np.uint8(img<100),8)
 rows=sorted([(cent[i,0],cent[i,1],int(stats[i,4])) for i in range(1,n) if stats[i,4]>=150],key=lambda v:(v[1],v[0]))
 return [dict(id=f'{prefix}_{i:02}',x=round(float(x)/4096,6),y=round(float(y)/4096,6),sourcePixels=area) for i,(x,y,area) in enumerate(rows,1)]

def main():
 assert (SRC/'Florividentes.jpg').exists()
 oldmask=json.loads((DATA/'masks_128_dev11_baseline.json').read_text())
 original=np.fromiter((x=='1' for x in oldmask['brush']),dtype=bool).reshape(N,N)
 authored=mono('Brushs-Moitas-Mapa.jpg')
 # User chose the authored normal-brush mask as the corrected base, not a second overlay.
 MASK['brush']=''.join('1' if b else '0' for b in authored.ravel())
 (DATA/'masks_128.json').write_text(json.dumps(MASK,ensure_ascii=False,separators=(',',':'))+'\n')
 ocean=mono('Brushs-Moitas-Ocean-Drag-Mapa.jpg')
 bundle=RAW['variants']['ocean']
 bundle['addBrush']=np.flatnonzero(ocean&~authored).tolist()
 bundle['removeBrush']=np.flatnonzero(authored&~ocean).tolist()
 # Explicitly NOT Chemtech-only: these are authored Scryer sites across all rifts.
 points=marks('Florividentes.jpg','scryer_mask')
 assert len(points)==15, f'Unexpected annotated Scryer count {len(points)}'
 old=RAW['baseFeatures'].get('scryers',[])
 late=[s for s in old if s.get('tier')=='late']
 cost=np.array([[(a['x']-b['x'])**2+(a['y']-b['y'])**2 for b in points] for a in late])
 r,c=linear_sum_assignment(cost)
 late_indices=set(int(i) for i in c)
 # A painted marker may sit on a collider boundary. Preserve exact paint
 # coordinate in `paintAnchor`, but project its interactive origin to the nearest
 # free cell centre (max 1.5% of map), so pulses can actually leave the plant.
 wall=np.fromiter((c=='1' for c in MASK['wall']),dtype=bool).reshape(N,N)
 corrected=[]
 for p in points:
  px,py=p['x'],p['y'];ix=min(N-1,int(px*N));iy=min(N-1,int(py*N))
  if wall[iy,ix]:
   choices=[]
   for y in range(max(0,iy-3),min(N,iy+4)):
    for x in range(max(0,ix-3),min(N,ix+4)):
     if not wall[y,x]:
      u=(x+.5)/N;v=(y+.5)/N
      choices.append(((u-px)**2+(v-py)**2,x,y,u,v))
   if not choices:raise ValueError('Nenhum ponto livre próximo: '+p['id'])
   _,_,_,u,v=min(choices)
   if ((u-px)**2+(v-py)**2)**.5>.015:raise ValueError('Scryer fora do alcance da máscara: '+p['id'])
   p['paintAnchor']={'x':px,'y':py};p['x']=round(u,6);p['y']=round(v,6)
   p['walkableSnap']='NEAREST_FREE_CELL_CENTER_TERRAIN_COLLISION';corrected.append(p['id'])
 for j,p in enumerate(points):
  is_late=j in late_indices
  p.update(kind='scryer_bloom',tier='late' if is_late else 'default',unlockMode='time_or_rift' if is_late else 'base',unlockAtSeconds=900 if is_late else 0,
    respawnMinSeconds=90 if is_late else 200,respawnMaxSeconds=120 if is_late else 260,radius=.018,
    positionStatus='USER_AUTHORED_MASK_4096',tierStatus='PROVISIONAL_10_NEAREST_PREVIOUS_LATE_ANCHORS' if is_late else 'PROVISIONAL_REMAINING_EARLY',sourceMask='Florividentes.jpg')
 RAW['baseFeatures']['scryers']=points
 # Honeyfruit exists before the Chemtech transformation. Chemtech only enhances it.
 honey=marks('fruit-quimtech-drag.jpg','honeyfruit')
 assert len(honey)==10
 for p in honey:p.update(kind='honeyfruit',radius=.02,respawnSeconds=90,sourceMask='fruit-quimtech-drag.jpg',status='USER_AUTHORED_POSITION_2026_EXACT_TIME_PROVISIONAL')
 RAW['baseFeatures']['plants']=[p for p in RAW['baseFeatures']['plants'] if p['kind']=='blast_cone']+honey
 RAW['variants']['chemtech']['features'].pop('plants',None)
 # Shape painted left→right; keep point coordinates in unit square, no angle baked in.
 fan=np.asarray(Image.open(SRC/'Florividentes-ranged-horizontal-esquerda-para-direita.jpg').convert('L'))
 binary=np.uint8(fan<90)*255
 contours,_=cv2.findContours(binary,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
 contour=max(contours,key=cv2.contourArea);arc=cv2.arcLength(contour,True)
 poly=cv2.approxPolyDP(contour,arc*.008,True)
 vertices=[[round(float(p[0][0]/(fan.shape[1]-1)),6),round(float((p[0][1]-(fan.shape[0]-1)/2)/(fan.shape[1]-1)),6)] for p in poly]
 # 0..1 forward, approximately [-.275,.275] lateral; rotate about painted left tip.
 assert min(p[0] for p in vertices)<.01 and max(p[0] for p in vertices)>.98
 RAW['scryerConeMask']={'schema':'coachlol.scryer-direction-mask.v1','maskSource':'Florividentes-ranged-horizontal-esquerda-para-direita.jpg','widthPx':fan.shape[1],'heightPx':fan.shape[0],'rangeNormalized':.13,'leftOrigin':True,'polygonLocal':vertices,'transform':'forward=cos(theta)*x-sin(theta)*y; lateral=sin(theta)*x+cos(theta)*y','geometryStatus':'USER_AUTHORED_IMAGE_POLYGON_SIMPLIFIED_FOR_ENGINE'}
 RAW['counts'].update({'scryersMaskAuthored':len(points),'scryersPreviewBase':len(points)-len(late_indices),'scryersPreviewLate':len(late_indices),'honeyfruitSites':len(honey),'firelightBlooms':len(points)})
 RAW['metrics']['dev12']={'baseBrushChangedFromDev11':int(np.sum(original!=authored)),'baseBrushPaintedCells':int(authored.sum()),'oceanBrushPaintedCells':int(ocean.sum()),'oceanDeltaAdded':len(bundle['addBrush']),'oceanDeltaRemoved':len(bundle['removeBrush']),
   'scryersFromUserMask':len(points),'scryerEarlyProvisional':len(points)-len(late_indices),'scryerLateProvisional':len(late_indices),'chemtechPlantBuffNotSpawn':True,'interactionOriginsSnappedToWalkable':corrected,'maskFilesSHA256':{name:hashfile(SRC/name) for name in ['Florividentes.jpg','Florividentes-ranged-horizontal-esquerda-para-direita.jpg','Brushs-Moitas-Mapa.jpg','Brushs-Moitas-Ocean-Drag-Mapa.jpg','fruit-quimtech-drag.jpg']}}
 for key,val in RAW['variants'].items():
  (DATA/'rift_bundles'/f'{key}.json').write_text(json.dumps(val,ensure_ascii=False,indent=2)+'\n')
 RAW['sourceHashes'].update({name:hashfile(SRC/name) for name in ['Florividentes.jpg','Florividentes-ranged-horizontal-esquerda-para-direita.jpg','Brushs-Moitas-Mapa.jpg','Brushs-Moitas-Ocean-Drag-Mapa.jpg','fruit-quimtech-drag.jpg']})
 (DATA/'rift_user_manifest_v452d4.json').write_text(json.dumps(RAW,ensure_ascii=False,indent=2)+'\n')
 payload={'baseFeatures':RAW['baseFeatures'],'variants':RAW['variants'],'scryerConeMask':RAW['scryerConeMask']}
 (DATA/'rift_user_assets_v452d4.js').write_text('/* Authored 4096 masks, dev12: runtime user masks only. */\nwindow.COACH_RIFT_USER_V452D4='+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n')
 (DATA/'rift_scryer_v452d4_dev12_audit.json').write_text(json.dumps({'counts':RAW['counts'],'metrics':RAW['metrics']['dev12'],'allSites':points,'coneMask':RAW['scryerConeMask']},ensure_ascii=False,indent=2)+'\n')
 print('DEV12 IMPORT',json.dumps(RAW['metrics']['dev12'],ensure_ascii=False))
if __name__=='__main__':main()
