#!/usr/bin/env python3
"""Run deterministic matches with different drafts; no gameplay mutations."""
import argparse, concurrent.futures, json, math, pathlib, statistics, subprocess, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
PROFILES=json.loads((ROOT/'data/pacing_drafts_v452d4_dev24.json').read_text())['profiles']
def run(case):
 seed,profile,maximum,timeout=case
 began=time.perf_counter()
 try:
  p=subprocess.run(['node','tools/pacing_match_v452d4_dev24.mjs',str(seed),profile,str(maximum)],capture_output=True,text=True,cwd=ROOT,timeout=timeout)
  if p.returncode:return {'seed':seed,'profile':profile,'error':p.stderr[-800:] or 'exit '+str(p.returncode)}
  r=json.loads(p.stdout);r['workerMs']=round((time.perf_counter()-began)*1000);return r
 except Exception as e:return {'seed':seed,'profile':profile,'error':str(e)}
def analyze(results):
 games=[x for x in results if 'error' not in x];completions=sorted(x['gameTime'] for x in games if x.get('nexusDestroyed') and x.get('ended'))
 mean=lambda xs:round(statistics.mean(xs),2) if xs else None
 def percentile(f):return completions[min(len(completions)-1,max(0,math.ceil(f*len(completions))-1))] if completions else None
 profile_stats={}
 for profile in PROFILES:
  subset=[x for x in games if x['profile']==profile];ended=[x['gameTime'] for x in subset if x['ended'] and x['nexusDestroyed']]
  profile_stats[profile]={'count':len(subset),'completed':len(ended),'meanSeconds':mean(ended),'minSeconds':min(ended) if ended else None,'maxSeconds':max(ended) if ended else None}
 return {'schema':'coachlol.pacing.audit.v452d4-dev25','sampleSize':len(results),'validRuns':len(games), 'completedNexus':len(completions),'censoredAtLimit':len(games)-len(completions),'stoppedForComputeBudget':sum(bool(x.get('stoppedForComputeBudget')) for x in games),'errors':len(results)-len(games),'meanSecondsCompleted':mean(completions),'medianSecondsCompleted':statistics.median(completions) if completions else None,'p10SecondsCompleted':percentile(.1),'p90SecondsCompleted':percentile(.9),'minSecondsCompleted':min(completions) if completions else None,'maxSecondsCompleted':max(completions) if completions else None,'targetSeconds':1800,'caveat':'Completion-only mean is biased when runs stop from wall-clock compute budget. This is not a 45-minute natural-game limit. Several kits use training fallbacks, so profile comparisons are not Riot champion parity.', 'byProfile':profile_stats,'results':[{'seed':r['seed'],'profile':r['profile'],'time':r.get('gameTime'),'stoppedForComputeBudget':r.get('stoppedForComputeBudget'),'winner':r.get('winner'),'ended':r.get('ended'),'nexusDestroyed':r.get('nexusDestroyed'),'structuresDestroyed':r.get('structuresDestroyed'),'dragonCaptures':r.get('dragonCaptures'),'computeMs':r.get('computeMs'),'finalStateHash':r.get('finalStateHash'),'waves':r.get('waves'),'issues':r.get('issues'),'error':r.get('error')} for r in results]}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--seeds',nargs='+',type=int,default=[26,42,36,55,77]);p.add_argument('--profiles',nargs='+',default=list(PROFILES));p.add_argument('--max-seconds',type=int,default=2700);p.add_argument('--workers',type=int,default=4);p.add_argument('--timeout',type=int,default=140);p.add_argument('--output',type=pathlib.Path,default=ROOT/'docs/QA_EVIDENCE_V452D4_DEV25/pacing_audit_30.json');a=p.parse_args()
 for prof in a.profiles:
  if prof not in PROFILES:raise SystemExit('unknown profile: '+prof)
 cases=[(seed,prof,a.max_seconds,a.timeout) for prof in a.profiles for seed in a.seeds]
 results=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:
  for f in concurrent.futures.as_completed({pool.submit(run,c):c for c in cases}):
   r=f.result();results.append(r);print(f"{len(results)}/{len(cases)} {r['profile']} seed {r['seed']} time {r.get('gameTime','?')} winner {r.get('winner','?')} error {bool(r.get('error'))}",flush=True)
 results.sort(key=lambda r:(list(PROFILES).index(r['profile']),a.seeds.index(r['seed'])))
 summary=analyze(results);a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
 print('SUMMARY',{k:summary[k] for k in ['sampleSize','completedNexus','censoredAtLimit','errors','meanSecondsCompleted','medianSecondsCompleted','p90SecondsCompleted']},flush=True)
 if summary['errors']:raise SystemExit(2)
