// Deterministic 20/40-minute stress probe. This does NOT certify balance.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Arena} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),masks=load('masks_128.json');
const seconds=Math.min(2400,Math.max(300,Number(process.argv[2]||1200)));
const seed=Number(process.argv[3]||26),arena=new Arena(map,masks,{seed,mode:'bot',roundSeconds:10});
for(const u of arena.units.filter(u=>u.team==='blue'))u.autoLevelSkills=true;
const start=performance.now();let decisions=0,rounds=0,ticks=0,errors=[];
while(arena.gameTime<seconds&&!arena.ended){
 if(arena.pendingDecision){arena.answerDecision();decisions++;continue;}
 if(arena.executionRemaining>0){const prior=arena.gameTime;arena.continueExecution(10);ticks+=arena.gameTime-prior;}
 else{
  if(arena.phase==='decision'){errors.push('decision phase without pendingDecision');break;}
  if(!arena.teams.blue.ready)arena.botPlan('blue');
  const r=arena.playTurn();if(!r.ok){errors.push('playTurn '+JSON.stringify(r));break;}rounds++;
 }
 if(arena.gameTime%60===0||arena.ended){const invalid=arena.validateInvariants();if(invalid.length){errors.push(`t=${arena.gameTime}: ${invalid.slice(0,15)}`);break;}}
 if(rounds>260||decisions>5000){errors.push('loop guard exceeded');break;}
}
const report={mode:'simultaneous-bot',seed,targetSeconds:seconds,simulatedSeconds:arena.gameTime,rounds,decisions,ticks,ended:arena.ended,winner:arena.winner,
 mid:arena.units.filter(u=>u.role==='MID').map(u=>({team:u.team,cs:u.cs,kills:u.kills,deaths:u.deaths})),
 jungle:arena.units.filter(u=>u.role==='JG').map(u=>({champ:u.champ,team:u.team,cs:u.cs,level:u.level,gold:u.gold,smiteTier:u.smiteTier})),
 spawns:Object.fromEntries(Object.keys({red:1,blue:1,krugs:1,dragon:1,baron:1}).map(k=>[k,arena.camps.filter(c=>c.timerKey===k).map(c=>({id:c.id,cycle:c.spawnCycle,level:c.campLevel}))])),
 waves:arena.waveIndex,structuresDestroyed:arena.structures.filter(s=>!s.alive).length,events:arena.events.length,
 durationMs:Math.round(performance.now()-start),errors};
report.stateHash=createHash('sha256').update(JSON.stringify({seed:arena.seed,time:arena.gameTime,units:arena.units.map(u=>[u.id,u.x,u.y,u.hp,u.gold,u.cs,u.level]),structures:arena.structures.map(s=>[s.id,s.hp,s.alive]),camps:arena.camps.map(c=>[c.id,c.health,c.spawnCycle,c.alive]),teams:arena.teams})).digest('hex').slice(0,24);
console.log(JSON.stringify(report,null,2));
if(process.env.REPORT_JSON)writeFileSync(process.env.REPORT_JSON,JSON.stringify(report,null,2));
assert.deepEqual(errors,[]);assert.ok(arena.gameTime>=seconds||arena.ended,'simulação deve chegar ao objetivo ou terminar por vitória');assert.ok(rounds>0);
