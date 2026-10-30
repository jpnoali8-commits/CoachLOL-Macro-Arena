/* M44 B20 — mobile source projectile defense and long dash interception, PvP bilateral. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side,mine,theirs){
 const other=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:20200,draft:{[side]:{MID:mine},[other]:{MID:theirs}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===other+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const cast=(who,slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(who.team,who.id,slot,opts);
  assert.equal(q.ok,true,JSON.stringify(q));
  const fn=a.executeBoardSkillV453Dev69.bind(a);let receipt;
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{const r=fn(actor,cmd);if(actor.id===who.id)receipt=r;return r;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=fn;}
  assert.ok(receipt);return receipt;
 };
 return {a,u,v,cast};
}
const test=(name,mine,theirs,fn)=>cases.push({name,mine,theirs,fn});

test('segment shield stops enemy but not friendly shots','Samira','Morgana',({a,u,v,cast})=>{
 cast(u,'W');
 const hit=a.m44B21ProjectileBarrierHitV453({x:.46,y:.5},{x:.54,y:.5},v.team,v);
 assert.ok(hit);assert.equal(hit.kind,'samira_blade_whirl');
 assert.equal(a.m44B21ProjectileBarrierHitV453({x:.46,y:.5},{x:.54,y:.5},u.team,u),null);
});
test('finite segment outside shield is never blocked','Samira','Morgana',({a,u,v,cast})=>{
 cast(u,'W');
 assert.equal(a.m44B21ProjectileBarrierHitV453({x:.60,y:.5},{x:.64,y:.5},v.team,v),null);
});
test('expired or dead source shields never absorb shots','Samira','Morgana',({a,u,v,cast})=>{
 cast(u,'W');
 assert.ok(a.m44B21ProjectileBarrierHitV453(v,u,v.team,v));
 u.hp=0;assert.equal(a.m44B21ProjectileBarrierHitV453(v,u,v.team,v),null);
 u.hp=20000;a.gameTime+=2.1;
 assert.equal(a.m44B21ProjectileBarrierHitV453(v,u,v.team,v),null);
});
test('original Morgana Q is intercepted before impact','Samira','Morgana',({a,u,v,cast})=>{
 cast(u,'W');const hp=u.hp;
 assert.equal(cast(v,'Q',{point:{x:u.x,y:u.y}}).ok,true);
 assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_authored_projectile'&&z.champ==='Morgana'));
 a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.hp,hp);
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='m44_authored_projectile'&&z.champ==='Morgana'));
 assert.ok(a.m44B21ProjectileInterceptHistory?.some(x=>x.champ==='Morgana'&&x.barrierId));
});
test('moving original Samira shield intercepts Ashe R','Samira','Ashe',({a,u,v,cast})=>{
 cast(u,'W');u.x=.55;v.x=.59;
 assert.equal(cast(v,'R',{point:{x:.53,y:.5}}).ok,true);
 const hp=u.hp;a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.hp,hp);
 assert.ok(a.m44B21ProjectileInterceptHistory?.some(x=>x.champ==='Ashe'&&x.slot==='R'));
});
test('non Samira shield stops authored projectile via shared geometry','Annie','Morgana',({a,u,v,cast})=>{
 const b={id:'fixture_b21',kind:'other_authorial_shield',team:u.team,ownerId:u.id,
  anchor:'owner',x:u.x,y:u.y,radius:300,until:3};
 a.projectileBarriersV453Dev43.push(b);
 const hp=u.hp;cast(v,'Q',{point:{x:u.x,y:u.y}});
 a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.hp,hp);
 assert.ok(a.m44B21ProjectileInterceptHistory?.some(x=>x.barrierId===b.id));
});
test('same fraction barrier ties resolve by id not insertion order','Annie','Morgana',({a,u,v})=>{
 a.projectileBarriersV453Dev43.push(
 {id:'zzz',team:u.team,x:.5,y:.5,radius:100,until:3},
 {id:'aaa',team:u.team,x:.5,y:.5,radius:100,until:3});
 assert.equal(a.m44B21ProjectileBarrierHitV453(v,u,v.team,v)?.barrierId,'aaa');
 a.projectileBarriersV453Dev43.reverse();
 assert.equal(a.m44B21ProjectileBarrierHitV453(v,u,v.team,v)?.barrierId,'aaa');
});
test('authored hit snapshot history survives restore','Samira','Morgana',({a,u,v,cast})=>{
 cast(u,'W');cast(v,'Q',{point:{x:u.x,y:u.y}});
 a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 const restored=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.ok(restored.m44B21ProjectileInterceptHistory?.some(x=>x.champ==='Morgana'));
});
test('friendly projectile can never hit allied barrier','Annie','Morgana',({a,u})=>{
 a.projectileBarriersV453Dev43.push({id:'blue_shield',team:u.team,x:u.x,y:u.y,radius:450,until:3});
 assert.equal(a.m44B21ProjectileBarrierHitV453({x:.53,y:.5},u,u.team,u),null);
});
test('R used to produce secondary effects only when actual impact','Samira','Sejuani',({a,u,v,cast})=>{
 cast(u,'W');const hp=u.hp;
 cast(v,'R',{point:{x:u.x,y:u.y}});
 a.gameTime+=1;a.advanceBoardTemporalV453Dev69();
 assert.equal(u.hp,hp);
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='m44_sejuani_storm'&&z.team===v.team));
});

test('Death Realm rejects projectile interception from another realm','Samira','Morgana',({a,u,v,cast})=>{
 cast(u,'W');
 const outside=a.units.find(x=>x.team===v.team&&x.id!==v.id);
 outside.x=.48;outside.y=.5;
 assert.equal(a.startRealmV453Dev69(u,v).ok,true);
 assert.equal(a.sameCombatRealmV453Dev69(outside,u),false);
 assert.equal(a.m44B21ProjectileBarrierHitV453(outside,u,outside.team,outside),null);
 assert.ok(a.m44B21ProjectileBarrierHitV453(v,u,v.team,v));
});
let passed=0;const failures=[];
for(const side of ['blue','red'])for(const item of cases){
 try{const f=fixture(side,item.mine,item.theirs);item.fn(f);
 const snap=f.a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));passed++;
 }catch(e){failures.push({side,name:item.name,error:String(e?.stack||e)});}
}
for(const f of failures)console.error('M44_B21_FAIL',JSON.stringify(f));
console.log('M44_B21',JSON.stringify({cases:cases.length,seats:2,passed,failures:failures.length,certifiedFullKits:0}));
assert.equal(failures.length,0);
