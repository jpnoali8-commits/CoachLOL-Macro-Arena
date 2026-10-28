#!/usr/bin/env python3
"""Non-certified tactical preview sites anchored to existing map objects.

No Scryer's Bloom map mask was supplied. These locations are provisional,
explicitly tagged, and must be replaced by authored contours before parity QA.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
source=json.loads((ROOT/'data/coachlol_map_v6.json').read_text())
manifest_path=ROOT/'data/rift_user_manifest_v452d4.json'
manifest=json.loads(manifest_path.read_text())
masks=json.loads((ROOT/'data/masks_128.json').read_text())
objects={o['id']:o for o in source['objects']}
hexgates=manifest['variants']['hextech']['features']['hexgates']
gates={g['id']:g for g in hexgates}
# Deliberately coarse anchor candidates, NOT user or Riot extracted coordinates.
points=[
 ('scryer_base_top','default',None,(0.40,0.37),'jungle_base_top'),
 ('scryer_base_bot','default',None,(0.61,0.64),'jungle_base_bot'),
 ('scryer_coast_top','late',None,(0.29,0.30),'river_coast_top'),
 ('scryer_coast_bot','late',None,(0.72,0.70),'river_coast_bot'),
 ('scryer_inner_blue_top','late','blue_top_t2',None,'behind_side_inner_tower'),
 ('scryer_inner_red_top','late','red_top_t2',None,'behind_side_inner_tower'),
 ('scryer_inner_blue_bot','late','blue_bot_t2',None,'behind_side_inner_tower'),
 ('scryer_inner_red_bot','late','red_bot_t2',None,'behind_side_inner_tower'),
 ('scryer_hex_blue_top','late','hexgate_02_a',None,'base_hexgate_rock'),
 ('scryer_hex_red_top','late','hexgate_01_a',None,'base_hexgate_rock'),
 ('scryer_hex_blue_bot','late','hexgate_06_b',None,'base_hexgate_rock'),
 ('scryer_hex_red_bot','late','hexgate_05_b',None,'base_hexgate_rock'),
]
result=[]
for id,tier,anchor,point,category in points:
    obj=objects.get(anchor) or gates.get(anchor) or {}
    x,y=point or (obj['x'],obj['y'])
    # Nudge anchor to a nearby walkable tile while avoiding walls.
    found=None
    for radius in [0,.012,.025,.04,.06]:
        import math
        for angle in range(0,360,30):
            xx,yy=x+radius*math.cos(math.radians(angle)),y+radius*math.sin(math.radians(angle))
            if not(.02<xx<.98 and .02<yy<.98):continue
            ix=min(127,int(xx*128));iy=min(127,int(yy*128))
            if masks['wall'][iy*128+ix]=='0':
                found=xx,yy;break
        if found:break
    if not found:raise ValueError('No walkable spot near '+id)
    a,b=found
    result.append(dict(id=id,x=round(a,6),y=round(b,6),kind='scryer_bloom',tier=tier,
        unlockMode='time_or_rift' if tier=='late' else 'base',unlockAtSeconds=900 if tier=='late' else 0,
        respawnMinSeconds=90 if tier=='late' else 200,respawnMaxSeconds=120 if tier=='late' else 260,
        radius=.018,sourceAnchor=anchor or category,locationCategory=category,
        positionStatus='PROVISIONAL_LANDMARK_DERIVED_NOT_RIOT_VERIFIED'))
assert len(result)==12 and sum(p['tier']=='late' for p in result)==10
manifest['baseFeatures']['scryers']=result
manifest['counts']['scryersPreviewBase']=2
manifest['counts']['scryersPreviewLate']=10
manifest['audits']['scryersDev8']={'positionStatus':'ALL_12_PROVISIONAL_NO_SCRYER_MASK_AVAILABLE',
 'respawnVerifiedPatch':'26.1','unlock':'15:00 or rift transform','nonCertified':True}
manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
js={'baseFeatures':manifest['baseFeatures'],'variants':manifest['variants']}
(ROOT/'data/rift_user_assets_v452d4.js').write_text('/* Generated user atlas + Scryer preview anchors; Scryer locations NOT certified. */\nwindow.COACH_RIFT_USER_V452D4='+json.dumps(js,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'data/rift_scryer_v452d4_dev8_audit.json').write_text(json.dumps({'status':'RULES_IMPLEMENTED_LOCATIONS_PROVISIONAL','sites':result,'reference':'Riot 26.1 Scryers Bloom: 15:00 or Rift; normal 200–260s; new locations 90–120s','warn':'Original user-provided mask did not include Scryer Bloom sites. Require mask for parity.'},indent=2,ensure_ascii=False)+'\n')
print('Generated',len(result),'provisional Scryer locations')
