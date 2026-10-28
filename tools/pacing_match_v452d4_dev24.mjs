// Deterministic 5v5 long-match probe. Uses the same turn/reaction/smite APIs as
// the dev23 production harness. Never edits HP, structures or victory state.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {Arena,ROLES} from '../engine.mjs';
const json=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const catalog=json('pacing_drafts_v452d4_dev24.json');
const map=json('coachlol_map_v6.json'), mask=json('masks_128.json');
const [seedArg,profileArg,maxArg]=process.argv.slice(2);
const seed=Number(seedArg??26),profile=profileArg||'baseline',maxSeconds=Number(maxArg??2700);
if(!Number.isInteger(seed)||seed<0||seed>2**32-1)throw Error('seed_invalida');
if(!Number.isInteger(maxSeconds)||maxSeconds<1800||maxSeconds>5400)throw Error('janela_invalida');
const draft=catalog.profiles[profile];if(!draft)throw Error('perfil_inexistente');
for(const side of ['blue','red'])for(const role of ROLES)if(!draft[side]?.[role])throw Error('papel_sem_campeao_'+side+'_'+role);
const a=new Arena(map,mask,{seed,draft,mode:'bot',roundSeconds:10});
for(const u of a.units.filter(u=>u.team==='blue'))u.autoLevelSkills=true;
const start=performance.now();const maxProbeMs=Math.min(120000,Math.max(1000,Number(process.env.MAX_PROBE_MS||15000)));let stoppedForComputeBudget=false;const decisions={},issues=[];let rounds=0,executedTicks=0,decisionCount=0,checks=0;
const milestone=[];
while(!a.ended && a.gameTime<maxSeconds){
 if(performance.now()-start>maxProbeMs){stoppedForComputeBudget=true;break;}
 if(a.pendingDecision){
  const d=a.pendingDecision;decisions[d.kind]=(decisions[d.kind]||0)+1;decisionCount++;
  let reply;
  if(['combat_reaction','pickoff_reaction'].includes(d.kind)){
   const unit=a.units.find(u=>u.id===d.unitId);
   reply=a.queueReactionCombo(unit?.team||'blue',d.unitId,d.enemyId,[],{response:'defend'});
  } else if(d.kind==='smite_contest')reply=a.submitSmiteContestV452d4Dev9('blue',d.unitId,'cast');
  else reply=a.answerDecision();
  if(reply?.ok===false){issues.push('decision:'+d.kind+':'+reply.reason);break;}
  if(decisionCount>2000){issues.push('decision_guard');break;}
  continue;
 }
 if(a.executionRemaining>0){const previous=a.gameTime;a.continueExecution(10);executedTicks+=a.gameTime-previous;}
 else{
  if(a.phase==='decision'){issues.push('decision_without_pending');break;}
  if(!a.teams.blue.ready)a.botPlan('blue');
  const result=a.playTurn();if(!result.ok){issues.push('playTurn:'+result.reason);break;}
  rounds++;
 }
 if(a.gameTime%300===0 && !milestone.some(m=>m.time===a.gameTime))milestone.push({time:a.gameTime,structures:a.structures.filter(s=>!s.alive).length,dragons:a.dragonCaptureLedgerV452d3.length,waves:a.waveIndex});
 if(a.gameTime%120===0||a.ended){checks++;const invalid=a.validateInvariants();if(invalid.length){issues.push('invariants:'+invalid.slice(0,5).join('|'));break;}}
 if(rounds>650){issues.push('round_guard');break;}
}
const result={schema:'coachlol.pacing.match.v452d4-dev24',seed,profile,maxSeconds,gameTime:a.gameTime,
 ended:a.ended,winner:a.winner,stoppedForComputeBudget,nexusDestroyed:!!a.winner&&a.structures.some(s=>s.id===`${a.winner==='blue'?'red':'blue'}_nexus`&&!s.alive),
 rounds,executedTicks,decisionCount,decisions,waves:a.waveIndex,
 structuresDestroyed:a.structures.filter(s=>!s.alive).length,
 dragonCaptures:a.dragonCaptureLedgerV452d3.length,
 structureByTeam:Object.fromEntries(['blue','red'].map(team=>[team,a.structures.filter(s=>s.team===team&&!s.alive).length])),
 teamKills:{blue:a.teams.blue.kills,red:a.teams.red.kills},
 structures:a.structures.map(s=>({id:s.id,hp:Math.round(s.hp),alive:s.alive})),
 milestone,issues,computeMs:Math.round(performance.now()-start),
 finalStateHash:createHash('sha256').update(JSON.stringify({time:a.gameTime,winner:a.winner,units:a.units.map(u=>[u.id,u.hp,u.x,u.y,u.cs,u.gold]),structures:a.structures.map(s=>[s.id,s.hp])})).digest('hex').slice(0,24)};
console.log(JSON.stringify(result));
if(process.env.REPORT_JSON)writeFileSync(process.env.REPORT_JSON,JSON.stringify(result,null,2)+'\n');
assert.deepEqual(issues,[]);
assert.ok(result.ended||a.gameTime>=maxSeconds||stoppedForComputeBudget,'sem_termino_ou_limite');
if(result.ended)assert.equal(result.nexusDestroyed,true,'encerrou_sem_nexus');
