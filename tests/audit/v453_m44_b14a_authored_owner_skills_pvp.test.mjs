/** M44 B14A: eight champion-specific slots; 30 bilateral PvP and snapshot checks. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B14A_KITS_V453} from '../../engine.mjs';
const file=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
const entries=[['Azir','Q','conqueringSands'],['Zed','Q','razorShuriken'],
 ['Jayce','Q','shockBlast'],['Rumble','W','scrapShield'],
 ['Kalista','R','fatesCall'],['Leblanc','R','mimic'],
 ['Aphelios','Q','weapon'],['Aphelios','W','phase']];
let passed=0,snapshots=0;const failures=[];
function fixture(team,champ){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:144414,mode:'pvp',
  draft:{[team]:{MID:champ,TOP:'Annie'},[other]:{MID:'Annie',TOP:'Malphite'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:8000,maxHp:8000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const v of a.minions)Object.assign(v,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),
  enemy=a.units.find(v=>v.id===other+'_MID'),ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{x:.5,y:.5,hp:6000,maxHp:9000,mana:10000,maxMana:10000,
  level:16,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.528,y:.5,hp:12000,maxHp:12000,mr:0,armor:0});
 Object.assign(ally,{x:.515,y:.5,hp:3000,maxHp:9000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const cast=(slot,options={})=>{
  const queued=a.queueBoardSkillV453Dev69(team,u.id,slot,options);
  assert.equal(queued.ok,true,'queued '+champ+' '+JSON.stringify(queued));
  let receipt;const native=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,plan)=>(receipt=native(actor,plan));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=native;}
  assert.equal(receipt?.ok,true,'receipt '+champ+' '+JSON.stringify(receipt));
  return receipt;
 };
 const snapshot=()=>{
  const s=a.snapshotV40();
  assert.equal(checksumV40(s),checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snapshots++;
 };
 return {a,u,ally,enemy,team,cast,snapshot};
}
function run(team,champ,label,fn){
 try{const f=fixture(team,champ);fn(f);f.snapshot();passed++}
 catch(e){failures.push({team,champ,label,error:String(e?.stack||e)})}
}
for(const team of ['blue','red']){
 for(const [champ,slot,flag] of entries)run(team,champ,slot,({a,u,ally,cast})=>{
  if(champ==='Azir')a.m15Summon('azir_soldier',u,{x:.513,y:.5},
   {until:20,hp:400,maxHp:400,nonCombat:true,power:0,attackRange:0,moveSpeed:0});
  if(champ==='Leblanc')u.m44B14LastBasicSlot='W';
  const opts=champ==='Kalista'?{targetId:ally.id}:
   slot==='Q'||champ==='Leblanc'?{point:{x:.529,y:.5}}:{};
  const result=cast(slot,opts);
  assert.ok(result[flag],'expected owned '+champ+' '+slot);
  if(champ==='Azir')assert.equal(result.soldiers,1);
  if(champ==='Zed')assert.equal(result.emitters,1);
  if(champ==='Jayce')assert.equal(result.shockBlast,true);
  if(champ==='Rumble')assert.equal(u.m44B13RumbleHeat,20);
  if(champ==='Kalista')assert.equal(u.m44B14OathswornId,ally.id);
  if(champ==='Leblanc')assert.ok(u.m44B13Return?.until>a.gameTime);
  if(champ==='Aphelios'&&slot==='Q')assert.equal(result.ammo,40);
  if(champ==='Aphelios'&&slot==='W')assert.equal(result.primary,'severum');
 });
 run(team,'Azir','without owned soldier',({enemy,cast})=>{
  const hp=enemy.hp,r=cast('Q',{point:{x:.529,y:.5}});
  assert.equal(r.soldiers,0);assert.equal(r.hits,0);assert.equal(enemy.hp,hp);
 });
 run(team,'Zed','owner plus owned shadow',({a,u,cast})=>{
  assert.equal(cast('W',{point:{x:.520,y:.5}}).livingShadow,true);
  const r=cast('Q',{point:{x:.529,y:.5}});
  assert.equal(r.emitters,2);
  assert.ok(a.boardSummonsV453Dev69.some(v=>
   v.kind==='zed_shadow'&&v.ownerId===u.id));
 });
 run(team,'Jayce','Q in hammer form',({cast})=>{
  assert.equal(cast('R').transformed,true);
  const r=cast('Q',{point:{x:.529,y:.5}});
  assert.equal(r.toTheSkies,true);assert.equal(r.shockBlast,false);
 });
 run(team,'Kalista','oathsworn mismatch denies before debit',({a,u,ally,team,cast})=>{
  assert.equal(cast('R',{targetId:ally.id}).fatesCall,true);
  u.m44B14OathswornId='other_ally_binding';
  const mana=u.mana;
  const r=a.queueBoardSkillV453Dev69(team,u.id,'R',{targetId:ally.id});
  assert.equal(r.ok,false);
  assert.equal(r.reason,'m44_b14_not_oathsworn');
  assert.equal(u.mana,mana);
 });
 run(team,'Leblanc','Mimic requires prior W',({a,u,team,cast})=>{
  const mana=u.mana;
  const denied=a.queueBoardSkillV453Dev69(team,u.id,'R',{point:{x:.529,y:.5}});
  assert.equal(denied.ok,false);
  assert.equal(denied.reason,'m44_b14_mimic_requires_w');
  assert.equal(u.mana,mana);
  assert.equal(cast('W',{point:{x:.529,y:.5}}).distortion,true);
  assert.equal(cast('R',{point:{x:.536,y:.5}}).mimic,true);
 });
 run(team,'Aphelios','swap before Q',({u,cast})=>{
  assert.equal(cast('W').primary,'severum');
  assert.equal(cast('Q',{point:{x:.529,y:.5}}).weapon,'severum');
  assert.equal(u.m44B14Aphelios.ammo.severum,40);
 });
 run(team,'Aphelios','empty gun denies before debit',({a,u,team})=>{
  u.m44B14Aphelios={primary:'calibrum',offhand:'severum',
   ammo:{calibrum:0,severum:50,gravitum:50,infernum:50,crescendum:50}};
  const mana=u.mana;
  const r=a.queueBoardSkillV453Dev69(team,u.id,'Q',{point:{x:.529,y:.5}});
  assert.equal(r.ok,false);
  assert.equal(r.reason,'m44_b14_no_ammunition');
  assert.equal(u.mana,mana);
 });
}
for(const f of failures)console.error('M44_B14A_FAIL',JSON.stringify(f));
console.log('M44_B14A '+JSON.stringify({champions:7,slots:8,passed,snapshots,
 failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,30);
