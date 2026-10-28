import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena} from '../engine.mjs';
const data=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const target=Number(process.argv[3]||2400),seed=Number(process.argv[2]||26);
const a=new Arena(map,mask,{seed,mode:'bot',roundSeconds:10,draft:{blue:{TOP:'Irelia',ADC:'Ezreal'},red:{TOP:'Irelia',ADC:'Ezreal'}}});
for(const u of a.units.filter(u=>u.team==='blue'))u.autoLevelSkills=true;
const issues=[];let decisions=0,turns=0;const began=performance.now();
while(a.gameTime<target&&!a.ended){
 if(a.pendingDecision){const d=a.pendingDecision;let r=null;decisions++;
  if(['combat_reaction','pickoff_reaction'].includes(d.kind)){
   const owner=a.units.find(u=>u.id===d.unitId);
   r=a.queueReactionCombo(owner?.team||'blue',d.unitId,d.enemyId,[],{response:'defend'});
  }else if(d.kind==='smite_contest')r=a.submitSmiteContestV452d4Dev9('blue',d.unitId,'cast');
  else {a.answerDecision();r={ok:true};}
  if(!r?.ok){issues.push('decision '+d.kind+':'+r?.reason);break;}
  if(decisions>2000){issues.push('decision_guard');break;}
  continue;
 }
 if(a.executionRemaining>0){a.continueExecution(10);}
 else{
  if(!a.teams.blue.ready)a.botPlan('blue');
  const turn=a.playTurn();if(!turn.ok){issues.push('playTurn:'+turn.reason);break;}
  turns++;
 }
 if(a.gameTime%60===0||a.ended){const invalid=a.validateInvariants();if(invalid.length){issues.push(...invalid.slice(0,5));break;}}
 if(turns>270){issues.push('turn_guard');break;}
}
const report={seed,draft:Object.fromEntries(a.units.filter(u=>['TOP','ADC'].includes(u.role)).map(u=>[u.id,u.champ])),
 elapsedSeconds:a.gameTime,ended:a.ended,winner:a.winner,turns,decisions,issues,
 eCasts:a.actionJournalV40.filter(e=>e.source==='irelia_e_v453_dev43').length,
 qCasts:a.actionJournalV40.filter(e=>e.source==='champion_onhit_v453_dev42').length,
 ms:Math.round(performance.now()-began),
 championLevels:a.units.filter(u=>['TOP','ADC'].includes(u.role)).map(u=>({id:u.id,champ:u.champ,level:u.level,kills:u.kills,deaths:u.deaths}))};
console.log(JSON.stringify(report,null,2));
if(process.env.REPORT_JSON)fs.writeFileSync(process.env.REPORT_JSON,JSON.stringify(report,null,2)+'\n');
assert.deepEqual(issues,[]);
assert.ok(report.elapsedSeconds>=target||report.ended);
