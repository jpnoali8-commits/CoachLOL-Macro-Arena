import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const draft={blue:{JG:'Warwick'},red:{JG:'LeeSin'},smiteKeys:{blue:'d',red:'f'}};
const create=()=>new Arena(map,mask,{seed:20261027,mode:'bot',draft,roundSeconds:10});
let passed=0;
function test(name,fn){fn();passed++;console.log('✓ DEV10 '+name);}
function stage({hp=4500,both=true,blue=5,red=5}={}){
 const a=create();for(const u of a.units){u.order={kind:'stop'};u.autoAttack=false;u.autoJungle=false;u.autoFollow=false;u.x=.04;u.y=.96;u.awaitingShop=false;}
 a.gameTime=500;a.phase='executing';a.updateObjectives();
 const c=a.camps.find(c=>c.timerKey==='dragon');assert.ok(c?.alive);c.health=hp;
 for(const [team,count] of [['blue',blue],['red',red]]){
  const roster=a.units.filter(u=>u.team===team).sort((x,y)=>(x.role==='JG'?-1:1)-(y.role==='JG'?-1:1)||x.id.localeCompare(y.id));
  for(const [i,u] of roster.entries()){
   if(i>=count)continue;
   u.x=c.x+.0001*i;u.y=c.y+.0001*i;
   u.order={kind:i<3?'objective':'attack',targetId:i<3?c.id:(team==='blue'?'red_':'blue_')+'TOP'};
   u.jungleAttackAt=0;u.attackAt=0;u.autoAttack=i>=3;
   if(u.role==='JG'){
    u.junglePet=both?'mosstomper':null;u.smiteTier=team==='blue'?3:2;u.smiteCharges=both?2:0;u.smiteCd=0;u.smiteRecoveries=[];
    // Objective above Smite range: ordinary ticks first.
    u.smitePolicy={mode:'auto',rules:[]};
   }
  }
 }
 return {a,c,blueJg:a.units.find(u=>u.id==='blue_JG'),redJg:a.units.find(u=>u.id==='red_JG')};
}
test('Champ Select commits D/F into owning jungler; save/load retains slot',()=>{
 const a=create();assert.equal(a.units.find(u=>u.id==='blue_JG').smiteKey,'d');assert.equal(a.units.find(u=>u.id==='red_JG').smiteKey,'f');
 const re=Arena.fromSnapshotV40(map,mask,a.snapshotV40());assert.equal(re.units.find(u=>u.id==='blue_JG').smiteKey,'d');
 assert.equal(new Arena(map,mask,{seed:1}).units.find(u=>u.id==='blue_JG').smiteKey,'f','old draft defaults to F');
});
test('integrated 5v5 arena: multiple normal ticks before final Smite pause',()=>{
 const {a,c,blueJg,redJg}=stage();
 assert.equal(a.objectivePitRosterV452d4Dev9(c).length,10,'both full squads are present');
 let early=0,attackers=0;const initialHealth=new Map(a.units.map(u=>[u.id,u.hp]));
 for(let step=0;step<18&&!a.pendingDecision&&c.alive;step++){
  const prior=c.health;
  a.gameTime++;
  // Resolve ordinary champion attacks with the same combat module as tick().
  a.resolveCombat();
  a.updateObjectives();
  if(a.pendingDecision){assert.equal(a.pendingDecision.kind,'smite_contest');break;}
  if(c.health<prior){early++;attackers+=Object.keys(c.damageByActorV44||{}).length;}
 }
 assert.ok(a.units.some(u=>u.hp<initialHealth.get(u.id)),'real champion-to-champion combat (and monster retaliation) occurs in pit');
 assert.ok(early>=2,'more than one ordinary objective tick');
 assert.ok(attackers>=2,'recorded attacks from champions');
 assert.equal(a.pendingDecision?.kind,'smite_contest','only final execution window prompts');
 assert.equal(blueJg.smiteCharges,2);assert.equal(redJg.smiteCharges,2);
 assert.ok(c.health>0&&c.health<=a.smitePower(blueJg));
 const before=a.snapshotV40();
 const replay=Arena.fromSnapshotV40(map,mask,before);
 const r1=a.submitSmiteContestV452d4Dev9('blue',blueJg.id,'cast');
 const r2=replay.submitSmiteContestV452d4Dev9('blue',blueJg.id,'cast');
 assert.equal(r1.ok,true);assert.equal(r2.ok,true);assert.deepEqual(r1.impacts,r2.impacts);
 a.gameTime++;a.updateObjectives();replay.gameTime++;replay.updateObjectives();
 assert.equal(a.camps.find(x=>x.id===c.id).lastClearTeam,'blue');
 assert.equal(a.objectiveLedgerV44.filter(x=>x.objective==='dragon').length,1);
 assert.deepEqual(a.objectiveLedgerV44.at(-1),replay.objectiveLedgerV44.at(-1));
 assert.equal(a.teams.blue.dragons.length,1);
});
test('both out of cooldown: no window until their actual ready time',()=>{
 const {a,c,blueJg,redJg}=stage({hp:800});blueJg.smiteCd=a.gameTime+3;
 a.updateObjectives();assert.equal(a.pendingDecision,null);
 a.gameTime++;a.updateObjectives();assert.equal(a.pendingDecision,null,'cannot prompt before cooldown');
 // Do not assert monster still lives: attack damage is allowed in ordinary turn.
 assert.equal(blueJg.smiteCharges,2);assert.equal(redJg.smiteCharges,1,'solo ready enemy may execute without a duel');
});
test('ordinary stun does not block Smite, suppression and stasis do',()=>{
 for(const [effect,expected] of [['stun',true],['silence',true],['knockup',true],['suppression',false],['stasis',false]]){
  const {a,c,blueJg}=stage({hp:850});
  const res=a.applyEffectV41(blueJg,effect,{duration:3,source:a.units.find(u=>u.id==='red_TOP')});
  assert.equal(res.ok,true,effect);
  assert.equal(a.smiteReadyForObjectiveV452d4Dev9(blueJg,c),expected,effect);
  const prior=blueJg.smiteCharges;
  const commit=a.performActionV40({actorId:blueJg.id,kind:'smite',campId:c.id,source:'test'});
  assert.equal(commit.ok,expected,effect+':'+JSON.stringify(commit));
  assert.equal(blueJg.smiteCharges,prior-(expected?1:0),effect);
 }
});
test('camp-id Smite validates 500-range and does not spend charges outside the pit',()=>{
 const {a,c,blueJg}=stage({hp:1000});blueJg.x=.04;blueJg.y=.96;
 const n=blueJg.smiteCharges;
 const res=a.performActionV40({actorId:blueJg.id,kind:'smite',campId:c.id,checkRange:false});
 assert.equal(res.ok,false);assert.equal(res.reason,'fora_de_alcance_smite');assert.equal(blueJg.smiteCharges,n);
});
test('5v5 without Smite: multiple combat ticks and weighted capture only on lethal tick',()=>{
 const {a,c}=stage({hp:3000,both:false});
 let early=0;
 for(let i=0;i<20&&c.alive;i++){
  const prior=c.health;a.gameTime++;a.updateObjectives();
  if(c.alive){early++;assert.ok(c.health<prior);assert.equal(a.objectiveLedgerV44.length,0);}
 }
 assert.ok(early>=2);assert.equal(c.alive,false);assert.equal(a.pendingDecision,null);
 const cap=a.objectiveLedgerV44.filter(x=>x.objective==='dragon');assert.equal(cap.length,1);
 assert.equal(cap[0].noSmitePitRoll.blue,5);assert.equal(cap[0].noSmitePitRoll.red,5);
 assert.equal(cap[0].noSmitePitRoll.blueProbability,.5);
});
test('UI and draft keep D/F at draft, not mutable inside mid-game overlay',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const draftJs=readFileSync(new URL('../draft.js',import.meta.url),'utf8');
 const draftHtml=readFileSync(new URL('../draft.html',import.meta.url),'utf8');
 assert.match(draftJs,/smiteDraftKeyV452d4Dev10/);assert.match(draftJs,/smiteKeys:\{\.\.\.state\.smiteKeys\}/);
 assert.match(draftHtml,/smiteKeys:ev.detail.smiteKeys/);
 assert.match(app,/\$\('smiteContestKey'\)\.disabled=true/);
 assert.match(app,/match\.units\.find\(u=>u\.id==='blue_JG'\)\?\.smiteKey/);
 assert.doesNotMatch(app,/coachlol_smite_key_v452d4_dev9/);
});
console.log(`V4.5.2d-4-dev10 ${passed}/7 PASS`);
