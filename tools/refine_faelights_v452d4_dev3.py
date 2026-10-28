#!/usr/bin/env python3
"""Incremental 2026 Faelight contract; preserve all 11 user-painted markers.

The twelfth site is a clearly marked UNVERIFIED symmetric estimate, not a Riot
coordinate nor a pixel extracted from the user's mask. Shapes are proposals for
later hand-authored contour replacement, not official geometry.
"""
import json, math
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
file=ROOT/'data/rift_user_manifest_v452d4.json'
data=json.loads(file.read_text(encoding='utf-8'))
base=data['baseFeatures']; prior={p['id']:p for p in base['faelights']}
original=prior['faelight_06']
if 'faelight_12' not in prior:
    prior['faelight_12']={
        'id':'faelight_12', 'x':round(1-original['x'],6), 'y':round(1-original['y'],6),
        'sourcePixels':0,'radius':0.012,'bonusRadius':0.06,'bonusSeconds':45,
        'provenance':'INFERRED_MIRROR_OF_FAELIGHT_06_NOT_USER_ANNOTATED',
        'certification':'UNVERIFIED_POSITION_NEEDS_MASK'
    }
# 4 gates, 2 island brush, 2 banana brush, 4 sideline spots: 8+4 as official 26.1.
groups={
 'base_gate':['02','04','08','10'],
 'island_brush':['01','11'],
 'banana_brush':['06','12'],
 'post_rift_side_lane':['03','05','07','09']
}
by_id={'faelight_'+s:(group,'post_rift' if group=='post_rift_side_lane' else 'base') for group,arr in groups.items() for s in arr}
assert set(by_id)==set(prior) and len(prior)==12
# Shapes point downrange from the ring, biased toward river for mid/island and
# nearby jungle for gate/sideline. Region is a directional trapezoid, not a circle.
for ident,p in prior.items():
    category,phase=by_id[ident];p['category2621']=category;p['unlockPhase']=phase
    cx,cy=.5,.5;dx,dy=cx-p['x'],cy-p['y'];norm=math.hypot(dx,dy) or 1
    vx,vy=dx/norm,dy/norm
    # Each site has independently sized/rotated polygon, retaining provenance.
    length={'base_gate':.082,'island_brush':.102,'banana_brush':.075,'post_rift_side_lane':.114}[category]
    width={'base_gate':.034,'island_brush':.041,'banana_brush':.027,'post_rift_side_lane':.040}[category]
    # 5-node polygon with inward-oriented fan and staggered sideways edges.
    along=[.008,.040,length,length,.040]; side=[-.016,-width*.76,-width*.58,width*.66,width*.84]
    nodes=[]
    for t,s in zip(along,side):
        x=max(.001,min(.999,p['x']+vx*t-vy*s));y=max(.001,min(.999,p['y']+vy*t+vx*s))
        nodes.append([round(x,6),round(y,6)])
    p['visionPolygon']=nodes
    p['visionGeometryStatus']='PROVISIONAL_SITE_SPECIFIC_POLYGON_NOT_RIOT_OFFICIAL'
    p['categoryStatus']='PROVISIONAL_FROM_RELATIVE_MAP_LOCATION'
base['faelights']=[prior['faelight_'+f'{i:02d}'] for i in range(1,13)]
data['counts']['faelights']=11  # source-image count, do NOT relabel an inferred point as image evidence
data['season2026V452d4Dev3']={
 'faelightsAnnotatedByUser':11,'faelightsEngineSites':12,'inferredMissingSites':1,
 'baseSites':8,'postRiftSites':4,
 'geometry':'provisional direction-specific polygons, LoS constrained; require accurate mask per site',
 'classification':'provisional mapping of original 11 painted markers to Riot categories'
}
file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'data/rift_user_assets_v452d4.js').write_text('/* Generated user 4096px atlas + dev3 provisional faelight geometry. */\nwindow.COACH_RIFT_USER_V452D4='+json.dumps({'baseFeatures':base,'variants':data['variants']},ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(ROOT/'data/rift_faelights_v452d4_dev3_audit.json').write_text(json.dumps({'status':'PARTIAL_NOT_CERTIFIED','officialPatch':'26.1','countFromUserMask':11,'inferredUnconfirmedId':'faelight_12','categoryMapping':groups,'remarks':'Site locations and bonus region polygons require author-confirmed 12th mask. Never claim Riot 1:1.'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('12 sites: 8 base + 4 post-rift (11 traced from user images, 1 explicitly inferred)')
