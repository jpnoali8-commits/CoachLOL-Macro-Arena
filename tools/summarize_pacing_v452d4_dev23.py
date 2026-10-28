#!/usr/bin/env python3
"""Aggregate verified full-engine match outcomes; never impute a winner or timeout."""
import json
import statistics
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
EVIDENCE=ROOT/'docs/QA_EVIDENCE_V452D4_DEV23'
SEEDS=(26,42,36,55,77)

def main():
    rows=[]
    for seed in SEEDS:
        source=EVIDENCE/f'seed{seed}_scaled_max40.json'
        result=json.loads(source.read_text(encoding='utf-8'))
        nexus=any(s['id'] in ('red_nexus','blue_nexus') and not s['alive'] for s in result['structures'])
        rows.append({'seed':seed,'seconds':result['simulatedSeconds'],'winner':result['winner'],
             'ended':result['ended'],'nexusDestroyed':nexus,'structuresDestroyed':result['structuresDestroyed'],
             'dragons':result['dragonCaptures'],'issues':result['issues'],'evidence':str(source.relative_to(ROOT))})
    completed=[r['seconds'] for r in rows if r['ended'] and r['nexusDestroyed'] and not r['issues']]
    data={'schema':'coachlol.pacing-audit.v452d4-dev23','targetAverageSeconds':1800,
          'targetRangeForMeanSeconds':[1680,1980], 'sampleSize':len(rows),
          'organicNexusWins':len(completed),'meanSeconds':round(statistics.mean(completed),2) if len(completed)==len(rows) else None,
          'medianSeconds':statistics.median(completed) if len(completed)==len(rows) else None,
          'rangeSeconds':[min(completed),max(completed)] if completed else None,
          'results':rows,
          'certification':'BOUNDED_DETERMINISTIC_5_SEEDS_NOT_GLOBAL_BALANCE',
          'caveat':'Only five deterministic offline drafts/seeds, no 1:1 champions/items balance. No time-based forced winner or structure HP edit.'}
    (EVIDENCE/'pacing_audit_5seeds.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in data.items() if k!='results'},ensure_ascii=False,indent=2))
    assert len(completed)==len(rows),'At least one run did not naturally destroy a Nexus'
    assert data['targetRangeForMeanSeconds'][0]<=data['meanSeconds']<=data['targetRangeForMeanSeconds'][1],'Mean outside current 28-33m calibration band'

if __name__=='__main__': main()
