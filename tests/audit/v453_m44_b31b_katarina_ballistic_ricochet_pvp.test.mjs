/* M44 B31B: Katarina Q ballistic target and 0.15s bounce, PvP BOTH seats. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side){
 const foe=side==='blue'?'red':'blue',a=new Arena(map,mask,{
  mode:'pvp',seed:31131,draft:{[side]:{MID:'Katarina'},[foe]:{MID:'Annie'}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===foe+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const cast=(slot='Q',opts={targetId:v.id})=>{
  const q=a.queueBoardSkillV453Dev69(u.team,u.id,slot,opts);
  assert.equal(q.ok,true,JSON.stringify(q));let receipt;
  const original=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(unit,cmd)=>{
   const rc=original(unit,cmd);if(unit.id===u.id)receipt=rc;return rc;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original;}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));return receipt;
 };
 const tick=at=>{a.gameTime=at;a.advanceBoardTemporalV453Dev69();};
 const active=()=>a.boardTemporalV453Dev69.find(z=>z.kind==='m44_b31_katarina_q_flight');
 const drop=()=>a.boardTemporalV453Dev69.find(z=>z.kind==='m44_b26_katarina_drop');
 const other=()=>a.units.filter(z=>z.team===foe&&z.id!==v.id).slice(0,2);
 return {a,u,v,foe,cast,tick,active,drop,other};
}
const test=(name,fn)=>cases.push({name,fn});
test('Q launches without damage, pays once, 1600u/s initial flight',({a,u,v,cast,active,tick})=>{
 const hp=v.hp,mana=u.mana,rc=cast();
 assert.equal(rc.pending,true);assert.equal(rc.hitIds.length,0);
 assert.equal(v.hp,hp);assert.equal(u.mana,mana);
 assert.ok(Math.abs(rc.nextHitAt-a.mapDistance(u,v)/1600)<1e-7);
 assert.equal(active().stage,0);
 tick(.2);assert.equal(v.hp,hp);assert.equal(active().stage,0);
 tick(.24);assert.ok(v.hp<hp);
});
test('current Q5 uses 220 base and .4 AP, not outdated 200',({a,u,v,cast,tick})=>{
 const rule=m44B14DOriginalBoardRuleV453('Katarina','Q');
 assert.equal(rule.damage[4],220);assert.equal(rule.apRatio,.4);
 const hp=v.hp;cast();tick(.24);
 assert.ok(hp-v.hp>=210);
});
test('0.15s per bounce, unique hits, no repeated frames',({a,u,v,cast,tick,active,other})=>{
 const [x,y]=other();Object.assign(x,{x:.535,y:.5});Object.assign(y,{x:.545,y:.5});
 const hp=[v.hp,x.hp,y.hp],rc=cast();
 assert.equal(rc.hitIds.length,0);
 tick(.24);assert.ok(v.hp<hp[0]);assert.equal(x.hp,hp[1]);assert.equal(y.hp,hp[2]);
 assert.deepEqual(active().hitIds,[v.id]);
 tick(.38);assert.equal(x.hp,hp[1]);
 tick(.39);assert.ok(x.hp<hp[1]);assert.equal(y.hp,hp[2]);
 tick(.54);assert.ok(y.hp<hp[2]);assert.equal(active(),undefined);
 const after=[v.hp,x.hp,y.hp];tick(.59);
 assert.deepEqual([v.hp,x.hp,y.hp],after);
});
test('drop anchors to first victim at +1.023 despite later ricochets',({a,u,v,cast,tick,drop,other})=>{
 const [x,y]=other();Object.assign(x,{x:.535,y:.5});Object.assign(y,{x:.545,y:.5});
 const rc=cast();assert.equal(rc.daggerAt,null);
 tick(.24);const d=drop();assert.ok(d);
 assert.ok(Math.abs(d.nextAt-(.24+1.023))<1e-7);
 assert.ok(Math.abs(a.mapDistance(d.point,v)-350)<1);
 tick(.39);tick(.54);
 tick(1.25);assert.equal(u.m44B26Daggers?.length||0,0);
 tick(1.28);assert.equal(u.m44B26Daggers?.length,1);
 assert.ok(Math.abs(a.mapDistance(u.m44B26Daggers[0],v)-350)<1);
});
test('moved first victim delays homing arrival without premature impact',({a,v,cast,tick,active})=>{
 const hp=v.hp;cast();v.x=.54;
 tick(.24);assert.equal(v.hp,hp);
 assert.ok(active().nextAt>.37);
 tick(.38);assert.ok(v.hp<hp);assert.ok(active()===undefined);
});
test('moving owner cannot interrupt launched Q',({a,u,v,cast,tick})=>{
 const hp=v.hp;cast();u.x=.4;tick(.24);assert.ok(v.hp<hp);
});
test('owner death after launch retains Q impact and owned ground drop',({a,u,v,cast,tick})=>{
 const hp=v.hp;cast();u.hp=0;
 tick(.24);assert.ok(v.hp<hp);
 tick(1.28);assert.equal(u.m44B26Daggers.length,1);
});
test('first target death before impact does not erase launched missile or dagger',({a,u,v,cast,tick,drop})=>{
 cast();v.hp=0;tick(.24);
 assert.ok(drop());tick(1.28);assert.equal(u.m44B26Daggers.length,1);
});
test('target spell shield negates Q damage but not physical dagger trajectory',({a,u,v,cast,tick,drop})=>{
 a.applyEffectV41(v,'spell_shield',{source:v,duration:2,key:'b31b_spellshield'});
 const hp=v.hp;cast();tick(.24);
 assert.equal(v.hp,hp);assert.ok(drop());tick(1.28);
 assert.equal(u.m44B26Daggers.length,1);
});
test('secondary acquisition requires current vision',({a,v,cast,tick,other})=>{
 const [x]=other();Object.assign(x,{x:.535,y:.5});
 a.visible=(team,target)=>target.id!==x.id;
 const hp=x.hp;cast();tick(.24);tick(.39);
 assert.equal(x.hp,hp);
});
test('secondary visible when selected is allowed to finish after losing sight',({a,v,cast,tick,other})=>{
 const [x]=other();Object.assign(x,{x:.535,y:.5});
 const hp=x.hp;cast();tick(.24);
 a.visible=(team,target)=>target.id!==x.id;
 tick(.39);assert.ok(x.hp<hp);
});
test('newly visible secondary at impact is acquired rather than cast-locked',({a,v,cast,tick,other})=>{
 const [x]=other();Object.assign(x,{x:.535,y:.5});
 const hp=x.hp;a.visible=(team,target)=>target.id!==x.id;
 cast();a.visible=()=>true;
 tick(.24);tick(.39);assert.ok(x.hp<hp);
});
test('projectile guard blocks first contact and prevents any dagger',({a,u,v,cast,tick,drop})=>{
 const hp=v.hp;v.projectileGuardUntil=1;cast();tick(.24);
 assert.equal(v.hp,hp);assert.equal(drop(),undefined);
 tick(1.3);assert.equal(u.m44B26Daggers?.length||0,0);
});
test('wall between caster and primary stops Q before damage',({a,u,v,cast,tick,drop})=>{
 const orig=a.obstacleLine.bind(a),hp=v.hp;
 a.obstacleLine=(from,to)=>orig(from,to)||
  from.x<.512&&to.x>.512;
 cast();tick(.24);
 assert.equal(v.hp,hp);assert.equal(drop(),undefined);
});
test('cross-realm target is rejected after launch and generates no ground',({a,u,v,cast,tick,drop})=>{
 const hp=v.hp;cast();
 a.realmContextV453Dev69={id:'b31b_isolated_realm',casterId:v.id,
  targetId:'nobody',centerWorld:{x:v.x,y:v.y},radiusWorld:1200,
  lastValid:{[v.id]:{x:v.x,y:v.y}},endsAt:6};
 tick(.24);assert.equal(v.hp,hp);assert.equal(drop(),undefined);
});
test('Q bounce never acquires a fourth victim',({a,u,v,cast,tick,other,foe})=>{
 const [x,y]=other();Object.assign(x,{x:.535,y:.5});
 Object.assign(y,{x:.545,y:.5});
 const z=a.units.find(t=>t.team===foe&&![v.id,x.id,y.id].includes(t.id));
 Object.assign(z,{x:.55,y:.5});const hp=z.hp;
 cast();for(const t of [.24,.39,.54,.7])tick(t);
 assert.equal(z.hp,hp);
});
test('projectile guard on SECONDARY prevents bounce hit but not first drop',({a,u,v,cast,tick,drop,other})=>{
 const [x]=other();Object.assign(x,{x:.535,y:.5,projectileGuardUntil:1});
 const hp=x.hp;cast();tick(.24);assert.ok(drop());
 tick(.39);assert.equal(x.hp,hp);
 tick(1.28);assert.equal(u.m44B26Daggers.length,1);
});
test('Shunpo can consume a Q dagger only after actual landing',({a,u,v,cast,tick})=>{
 cast();tick(.24);
 const q=a.queueBoardSkillV453Dev69(u.team,u.id,'E',{targetId:'dagger_999'});
 assert.equal(q.ok,false);
 tick(1.28);const d=u.m44B26Daggers?.[0];assert.ok(d);
 a.round++;a.actionLocksV40={};
 const rc=cast('E',{targetId:'dagger_'+d.id});
 assert.equal(rc.daggerShunpo,true);assert.equal(rc.daggersCollected,1);
});
test('checkpoint after first contact persists drop and eventual bounce',({a,u,v,cast,tick,active,drop,other})=>{
 const [x]=other();Object.assign(x,{x:.535,y:.5});
 cast();tick(.24);
 const z=active(),d=drop();assert.ok(z&&d);
 const snap=a.snapshotV40(),copy=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(copy.snapshotV40()));
 assert.equal(copy.boardTemporalV453Dev69.find(t=>t.id===z.id).stage,1);
 assert.equal(copy.boardTemporalV453Dev69.find(t=>t.id===d.id).nextAt,d.nextAt);
 a.gameTime=.39;a.advanceBoardTemporalV453Dev69();
 copy.gameTime=.39;copy.advanceBoardTemporalV453Dev69();
 assert.equal(copy.units.find(t=>t.id===x.id).hp,x.hp);
});
test('one-time mana and cooldown with no duplicate damage on second scheduler call',({a,u,v,cast,tick})=>{
 const mana=u.mana,rc=cast();assert.equal(rc.pending,true);
 const afterMana=u.mana,cd=u.skillCds.Q;
 tick(.24);const hp=v.hp;tick(.24);
 assert.equal(v.hp,hp);assert.equal(u.mana,afterMana);
 assert.equal(u.skillCds.Q,cd);assert.equal(afterMana,mana);
});
let passed=0,failed=[];
for(const seat of ['blue','red'])for(const sc of cases){
 try{const f=fixture(seat);sc.fn(f);
  const snap=f.a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));passed++;
 }catch(e){failed.push({seat,name:sc.name,error:String(e?.stack||e)});}
}
for(const f of failed)console.error('M44_B31B_FAIL',JSON.stringify(f));
console.log('M44_B31B',JSON.stringify({cases:cases.length,seats:2,passed,failed:failed.length,certifiedKits:0}));
assert.equal(failed.length,0);
