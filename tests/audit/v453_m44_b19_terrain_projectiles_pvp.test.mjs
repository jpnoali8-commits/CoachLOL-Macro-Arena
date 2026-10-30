/* M44 B19 — executable mirrored PvP regression, authored effects only. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const scenarios=[];
function fixture(side,mine,theirs){
 const other=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:19190,draft:{[side]:{MID:mine},[other]:{MID:theirs}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===other+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const cast=(who,slot,options={})=>{
  const q=a.queueBoardSkillV453Dev69(who.team,who.id,slot,options);assert.equal(q.ok,true,JSON.stringify(q));
  const real=a.executeBoardSkillV453Dev69.bind(a);let out;
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{const r=real(actor,cmd);if(actor.id===who.id)out=r;return r;};
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=real;}
  assert.ok(out);return out;
 };
 return {a,u,v,cast};
}
const test=(name,mine,theirs,fn)=>scenarios.push({name,mine,theirs,fn});
test('Yorick enemy-only wall, B18 global behavior','Yorick','Annie',({a,u,v,cast})=>{
 cast(u,'W',{point:{x:v.x,y:v.y}});
 const w=a.m44B18SkillWallsV453().find(x=>x.shape==='ring');
 assert.equal(w.team,u.team);assert.equal(w.projectile,'pass');assert.equal(w.movement,'enemy');
 const edge={x:w.center.x+w.radius/a.worldWidth,y:w.center.y};
 assert.equal(a.walkable(edge.x,edge.y,u),true);assert.equal(a.walkable(edge.x,edge.y,v),false);
 assert.equal(a.walkable(edge.x,edge.y),false);
 const outside={x:w.center.x+350/a.worldWidth,y:w.center.y};
 assert.equal(a.obstacleLine(w.center,outside,u),false);
 assert.equal(a.obstacleLine(w.center,outside,v),true);
});
test('Taliyah wall blocks allies and enemies, not missiles','Taliyah','Annie',({a,u,v,cast})=>{
 cast(u,'R',{point:{x:.53,y:.5}});
 assert.equal(a.walkable(.515,.5,u),false);assert.equal(a.walkable(.515,.5,v),false);
 assert.equal(a.m44B19ProjectileWalkableV453({x:.515,y:.5}),true);
});
test('Azir wall filters movement by team','Azir','Annie',({a,u,v,cast})=>{
 cast(u,'R',{point:{x:.53,y:.5}});
 assert.equal(a.walkable(.53,.5,u),true);assert.equal(a.walkable(.53,.5,v),false);
 assert.equal(a.obstacleLine({x:.52,y:.5},{x:.54,y:.5},u),false);
 assert.equal(a.obstacleLine({x:.52,y:.5},{x:.54,y:.5},v),true);
});
test('Samira W barrier intercepts real Nami projectile and expires','Samira','Nami',({a,u,v,cast})=>{
 assert.equal(cast(u,'W').bladeWhirl,true);
 const barrier=a.projectileBarriersV453Dev43.find(x=>x.ownerId===u.id&&x.kind==='samira_blade_whirl');
 assert.ok(barrier);assert.equal(barrier.radius,360);
 assert.ok(Arena.fromSnapshotV40(map,mask,a.snapshotV40()).projectileBarriersV453Dev43.some(x=>x.id===barrier.id));
 const hp=u.hp,p=a.launchWaveShadowV453Dev69(v,'R',{x:.5,y:.5});
 assert.equal(p.ok,true,JSON.stringify(p));
 a.gameTime+=.5;a.advanceChampionProjectilesV453Dev42();
 assert.equal(u.hp,hp);
 assert.ok(a.championProjectileHistoryV453Dev42?.some(x=>x.id===p.projectileId&&x.reason==='bloqueio_posicional'));
 a.gameTime+=3;a.advanceChampionProjectilesV453Dev42();
 assert.ok(!a.projectileBarriersV453Dev43.some(x=>x.id===barrier.id));
});
for(const [champ,slot,options] of [
 ['Briar','Q',u=>({targetId:u.id})],
 ['Pantheon','W',u=>({targetId:u.id})],
 ['Rakan','W',u=>({point:{x:u.x+.004,y:u.y}})]
])test('Poppy W denies '+champ+' '+slot+' predebit','Poppy',champ,({a,u,v,cast})=>{
 cast(u,'W');const mana=v.mana,cd=v.skillCds[slot];
 const q=a.queueBoardSkillV453Dev69(v.team,v.id,slot,options(u));
 assert.equal(q.ok,true,JSON.stringify(q));
 const real=a.executeBoardSkillV453Dev69.bind(a);let result;
 a.executeBoardSkillV453Dev69=(who,p)=>{const r=real(who,p);if(who.id===v.id)result=r;return r;};
 try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=real;}
 assert.equal(result?.reason,'m44_b17_poppy_anti_dash');
 assert.equal(v.mana,mana);assert.equal(v.skillCds[slot],cd);
});
test('non-dashes excluded','Poppy','Annie',({a})=>{
 for(const p of [{shape:'move_point',m44B16BId:'Bard.E'},{shape:'move_point',m44B17BId:'Taliyah.R'},{shape:'move_point',m44B17AId:'Lissandra.E'}])
  assert.equal(a.m44B19IsAuthoredDashV453(p),false);
});
let passed=0;const errors=[];
for(const side of ['blue','red'])for(const item of scenarios){
 try{const f=fixture(side,item.mine,item.theirs);item.fn(f);
  const snap=f.a.snapshotV40();assert.equal(checksumV40(snap),checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));passed++;
 }catch(e){errors.push({side,name:item.name,error:String(e?.stack||e)});}
}
for(const e of errors)console.error('M44_B19_FAIL',JSON.stringify(e));
console.log('M44_B19',JSON.stringify({scenarios:scenarios.length,seats:2,passed,failed:errors.length,certifiedKits:0}));
assert.equal(errors.length,0);assert.equal(passed,scenarios.length*2);
