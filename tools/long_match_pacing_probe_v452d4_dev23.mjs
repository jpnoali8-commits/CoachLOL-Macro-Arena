// Full engine autonomous-match probe. Unlike the historical v20 harness,
// resolves a reaction via the SAME validated action used by the UI.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Arena} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const seconds=Math.max(600,Math.min(3600,Number(process.argv[2]||1200))),seed=Number(process.argv[3]||26);
function run(){
 const arena=new Arena(map,mask,{seed,mode:'bot',roundSeconds:10});
 for(const u of arena.units.filter(u=>u.team==='blue'))u.autoLevelSkills=true;
 let decisions=0,rounds=0,ticks=0;const kinds={},issues=[];const began=performance.now();
 while(arena.gameTime<seconds&&!arena.ended){
  if(arena.pendingDecision){
   const d=arena.pendingDecision;kinds[d.kind]=(kinds[d.kind]||0)+1;decisions++;
   if(['combat_reaction','pickoff_reaction'].includes(d.kind)){
    const owner=arena.units.find(x=>x.id===d.unitId);
    const reply=arena.queueReactionCombo(owner?.team||'blue',d.unitId,d.enemyId,[],{response:'defend'});
    if(!reply.ok){issues.push('reaction:'+reply.reason+' at '+arena.gameTime);break;}
   }else if(d.kind==='smite_contest'){
    const reply=arena.submitSmiteContestV452d4Dev9('blue',d.unitId,'cast');
    if(!reply?.ok){issues.push('smite_contest_autonomy_unresolved:'+reply?.reason);break;}
   }else arena.answerDecision();
   if(decisions>1500){issues.push('decision_guard');break;}
   continue;
  }
  if(arena.executionRemaining>0){const start=arena.gameTime;arena.continueExecution(10);ticks+=arena.gameTime-start;}
  else{
   if(arena.phase==='decision'){issues.push('decision_without_pending');break;}
   if(!arena.teams.blue.ready)arena.botPlan('blue');
   const r=arena.playTurn();if(!r.ok){issues.push('playTurn:'+r.reason);break;}rounds++;
  }
  if(arena.gameTime%60===0||arena.ended){const invalid=arena.validateInvariants();if(invalid.length){issues.push('invariants:'+invalid.slice(0,4).join('|'));break;}}
  if(rounds>370){issues.push('round_guard');break;}
 }
 const report={schema:'coachlol.longMatchProbe.v1',seed,targetSeconds:seconds,simulatedSeconds:arena.gameTime,ended:arena.ended,winner:arena.winner,
  rounds,decisions,decisionKinds:kinds,ticks,waves:arena.waveIndex,structuresDestroyed:arena.structures.filter(s=>!s.alive).length,
  championLevels:arena.units.map(u=>({id:u.id,level:u.level,cs:u.cs,gold:u.gold})),dragonCaptures:arena.dragonCaptureLedgerV452d3.length,
  performanceMs:Math.round(performance.now()-began),structures:arena.structures.map(s=>({id:s.id,hp:Math.round(s.hp),alive:s.alive,respawnAt:s.respawnAt,vulnerable:arena.structureVulnerable(s)})),activeMinions:arena.minions.length, champions:arena.units.map(u=>({id:u.id,hp:Math.round(u.hp),x:Math.round(u.x*1000)/1000,y:Math.round(u.y*1000)/1000,lane:u.botSiegeLaneV452d4Dev22,order:u.order?.kind,autoFollow:u.autoFollow,manual:u.manualMoveHold})),issues};
 report.stateHash=createHash('sha256').update(JSON.stringify({gameTime:arena.gameTime,units:arena.units.map(u=>[u.id,u.x,u.y,u.hp,u.cs,u.level]),structures:arena.structures.map(s=>[s.id,s.hp]),camps:arena.camps.map(c=>[c.id,c.health,c.alive]),teams:arena.teams})).digest('hex').slice(0,24);
 return report;
}
const report=run();console.log(JSON.stringify(report,null,2));
if(process.env.REPORT_JSON)writeFileSync(process.env.REPORT_JSON,JSON.stringify(report,null,2)+'\n');
assert.deepEqual(report.issues,[]);
assert.ok(report.simulatedSeconds>=seconds||report.ended);
assert.ok(report.rounds>0);
