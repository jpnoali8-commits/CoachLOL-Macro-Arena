/** M44 B14C — Viego authored corpse ownership, bounded Q/W copy, PvP. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B14C_VIEGO_COPY_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let passed=0,snapshots=0;const failures=[];
function fixture(team,sourceChamp){
 const opposite=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:144499,mode:'pvp',
  draft:{[team]:{MID:'Viego',TOP:'Annie'},[opposite]:{MID:sourceChamp}}});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,hp:4000,maxHp:4000,
  armor:0,mr:0,autoFollow:false,autoFarm:false,
  autoAttack:false,autoJungle:false});
 for(const minion of a.minions)Object.assign(minion,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),
  target=a.units.find(v=>v.id===opposite+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{x:.5,y:.5,level:16,hp:3500,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(target,{x:.526,y:.5,hp:100,maxHp:4000});
 Object.assign(ally,{x:.515,y:.5,hp:3000,maxHp:4000});
 a.gameTime=10;a.visible=()=>true;a.canSeePoint=()=>true;
 a.walkable=()=>true;a.obstacleLine=()=>false;
 const kill=()=>{a.damage(target,500,u,'true','spell');
  const soul=u.m44B14CSouls?.[0];
  assert.ok(soul,'real qualifying soul');return soul};
 const claim=soul=>{
  assert.equal(a.queueViegoPossessV453M44B14C(team,u.id,soul.id).ok,true);
  a.resolveBoardSkillsV453Dev69();
  assert.equal(u.m44B14CPossession?.sourceChamp,sourceChamp);
  assert.equal(u.champ,'Viego','source champion identity never overwritten');
 };
 const cast=(slot,options={})=>{
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,options);
  assert.equal(q.ok,true,'copied spell should queue '+JSON.stringify(q));
  let receipt;const old=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,plan)=>(receipt=old(actor,plan));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=old;}
  assert.equal(receipt?.ok,true,'copy cast '+JSON.stringify(receipt));
  return receipt;
 };
 const snap=()=>{
  const s=a.snapshotV40();
  assert.equal(checksumV40(s),
   checksumV40(Arena.fromSnapshotV40(map,mask,s).snapshotV40()));
  snapshots++;
 };
 return {a,u,target,ally,team,sourceChamp,kill,claim,cast,snap};
}
function run(team,champ,label,fn){
 try{const f=fixture(team,champ);fn(f);f.snap();passed++}
 catch(e){failures.push({team,champ,label,error:String(e?.stack||e)})}
}
for(const team of ['blue','red']){
 for(const champ of Object.keys(M44_B14C_VIEGO_COPY_V453))
  run(team,champ,'source rule identity',({a,u,kill,claim})=>{
   claim(kill());
   for(const [slot,rule] of Object.entries(M44_B14C_VIEGO_COPY_V453[champ]))
    assert.equal(a.boardKitForV453Dev69('Viego',slot,u),rule);
   assert.equal(a.units.filter(x=>x.hp>0).length,9);
  });
 run(team,'Hwei','QQ copied receipt remains owner Viego',({u,target,kill,claim,cast})=>{
  claim(kill());
  const r=cast('Q',{point:{x:target.x+.001,y:target.y},m44B14Variant:'QQ'});
  assert.equal(r.devastatingFireball,true);
  assert.equal(u.champ,'Viego');
 });
 run(team,'Azir','W copied real soldier entity',({a,u,kill,claim,cast})=>{
  claim(kill());
  const r=cast('W',{point:{x:.53,y:.5}});
  assert.equal(r.arise,true);
  assert.ok(a.boardSummonsV453Dev69.some(x=>x.kind==='azir_soldier'&&x.ownerId===u.id));
 });
 run(team,'Bard','W copied heal zone',({a,u,ally,kill,claim,cast})=>{
  claim(kill());
  assert.equal(cast('W',{targetId:ally.id}).caretakersShrine,true);
  assert.ok(a.boardTemporalV453Dev69.some(x=>
   x.variant==='bard_w'&&x.ownerId===u.id));
 });
 run(team,'Hwei','unsupported possessed E fails closed',({a,u,kill,claim,team})=>{
  claim(kill());const mana=u.mana;
  const q=a.queueBoardSkillV453Dev69(team,u.id,'E',{});
  assert.equal(q.ok,false);
  assert.equal(u.mana,mana);
 });
 run(team,'Hwei','expiry restores prior skill cooldown',({a,u,kill,claim})=>{
  u.skillCds.Q=30;
  claim(kill());
  assert.equal(u.skillCds.Q,a.gameTime);
  a.gameTime+=9;a.advanceBoardPassivesV453Dev69();
  assert.equal(u.m44B14CPossession,null);
  assert.ok(u.skillCds.Q>=30);
  assert.equal(a.boardKitForV453Dev69('Viego','Q',u).m44B12Blade,true);
 });
 run(team,'Hwei','soul expires without consumption',({a,u,kill,team})=>{
  const soul=kill();a.gameTime=soul.until+1;
  assert.equal(a.queueViegoPossessV453M44B14C(team,u.id,soul.id).ok,false);
  assert.equal(u.m44B14CPossession,undefined);
 });
 run(team,'Hwei','fog loss after queue blocks commit',({a,u,kill,team})=>{
  const soul=kill();
  assert.equal(a.queueViegoPossessV453M44B14C(team,u.id,soul.id).ok,true);
  a.canSeePoint=()=>false;a.resolveBoardSkillsV453Dev69();
  assert.equal(u.m44B14CPossession,undefined);
 });
 run(team,'Hwei','invalid/foreign soul ID denied',({a,u,kill,team})=>{
  kill();assert.equal(a.queueViegoPossessV453M44B14C(team,u.id,'foreign').ok,false);
 });
}
for(const f of failures)console.error('M44_B14C_VIEGO_FAIL',JSON.stringify(f));
console.log('M44_B14C_VIEGO '+JSON.stringify({copiedSources:3,
 passed,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,22);
