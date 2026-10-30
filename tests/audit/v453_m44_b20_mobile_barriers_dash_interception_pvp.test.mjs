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
test('Samira moves with shield, snapshot and expiry','Samira','Annie',({a,u,cast})=>{
 assert.equal(cast(u,'W').bladeWhirl,true);
 const b=a.projectileBarriersV453Dev43.find(x=>x.kind==='samira_blade_whirl');
 assert.equal(b.anchor,'owner');u.x=.56;
 assert.equal(a.m44B20ProjectileBarrierCenterV453(b).x,.56);
 const restored=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.equal(restored.m44B20ProjectileBarrierCenterV453(restored.projectileBarriersV453Dev43.find(x=>x.id===b.id)).x,.56);
 a.gameTime+=2.1;assert.equal(a.m44B20ProjectileBarrierCenterV453(b),null);
});
test('Moving Samira W absorbs Nami wave at new location','Samira','Nami',({a,u,v,cast})=>{
 cast(u,'W');u.x=.56;v.x=.6;
 const shot=a.launchWaveShadowV453Dev69(v,'R',{x:.54,y:.5});
 assert.equal(shot.ok,true,JSON.stringify(shot));
 const hp=u.hp;a.gameTime+=.6;a.advanceChampionProjectilesV453Dev42();
 assert.equal(u.hp,hp);
 assert.ok(a.championProjectileHistoryV453Dev42?.some(x=>x.id===shot.projectileId&&x.reason==='bloqueio_posicional'));
});
test('Old Samira cast origin no longer absorbs projectile','Samira','Nami',({a,u,v,cast})=>{
 cast(u,'W');u.x=.64;v.x=.46;
 const shot=a.launchWaveShadowV453Dev69(v,'R',{x:.5,y:.5});assert.equal(shot.ok,true);
 a.gameTime+=.6;a.advanceChampionProjectilesV453Dev42();
 assert.ok(a.championProjectilesV453Dev42.some(x=>x.id===shot.projectileId));
});
test('Dead Samira cleans up source-attached barrier','Samira','Annie',({a,u,cast})=>{
 cast(u,'W');const b=a.projectileBarriersV453Dev43.find(x=>x.kind==='samira_blade_whirl');
 u.hp=0;assert.equal(a.m44B20ProjectileBarrierCenterV453(b),null);
 a.gameTime+=.2;a.advanceChampionProjectilesV453Dev42();
 assert.ok(!a.projectileBarriersV453Dev43.some(x=>x.id===b.id));
});
test('Fixed barrier remains at original position','Samira','Annie',({a,u})=>{
 const b={ownerId:u.id,team:u.team,x:.52,y:.53,until:2,radius:100};
 u.x=.7;assert.equal(a.m44B20ProjectileBarrierCenterV453(b).x,.52);
});
test('Poppy W pre-debit stops a >600 range dash crossing radius','Poppy','Briar',({a,u,v,cast})=>{
 cast(u,'W');v.x=.435;
 assert.ok(a.mapDistance(v,u)>600);
 assert.equal(a.m44B18DashBlockerV453(v,u)?.id,u.id);
 const mana=v.mana,cd=v.skillCds.R;
 const q=a.queueBoardSkillV453Dev69(v.team,v.id,'R',{targetId:u.id});
 assert.equal(q.ok,true,JSON.stringify(q));
 let receipt;const fn=a.executeBoardSkillV453Dev69.bind(a);
 a.executeBoardSkillV453Dev69=(who,p)=>{const x=fn(who,p);if(who.id===v.id)receipt=x;return x;};
 try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=fn;}
 assert.equal(receipt?.reason,'m44_b17_poppy_anti_dash');
 assert.equal(v.mana,mana);assert.equal(v.skillCds.R,cd);
});
test('Poppy avoids false interception for distant dash','Poppy','Briar',({a,u,v,cast})=>{
 cast(u,'W');v.x=.435;
 assert.equal(a.m44B18DashBlockerV453(v,{x:.445,y:.5}),null);
});
test('Viego borrowed Samira W follows actual owner','Viego','Samira',({a,u,v,cast})=>{
 v.hp=100;a.damage(v,500,u,'true','spell');
 const soul=u.m44B14CSouls?.[0];assert.ok(soul);
 assert.equal(a.queueViegoPossessV453M44B14C(u.team,u.id,soul.id).ok,true);
 a.resolveBoardSkillsV453Dev69();assert.equal(u.champ,'Samira');
 assert.equal(cast(u,'W').bladeWhirl,true);
 const b=a.projectileBarriersV453Dev43.find(x=>x.ownerId===u.id&&x.kind==='samira_blade_whirl');
 assert.ok(b);u.x=.54;assert.equal(a.m44B20ProjectileBarrierCenterV453(b).x,.54);
});
let passed=0;const failures=[];
for(const side of ['blue','red'])for(const item of cases){
 try{const f=fixture(side,item.mine,item.theirs);item.fn(f);
 const snap=f.a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));passed++;
 }catch(e){failures.push({side,name:item.name,error:String(e?.stack||e)});}
}
for(const f of failures)console.error('M44_B20_FAIL',JSON.stringify(f));
console.log('M44_B20',JSON.stringify({cases:cases.length,seats:2,passed,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
