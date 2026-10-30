/** M44 B13 — adversarial and cross-mechanic PvP identities in the actual Arena. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let passed=0,snapshots=0;const failures=[];
function scenario(team,champ,label,fn){
 try{
  const other=team==='blue'?'red':'blue';
  const a=new Arena(map,mask,{seed:131399,mode:'pvp',
   draft:{[team]:{MID:champ,TOP:'Annie'},[other]:{MID:'Annie',TOP:'Malphite'}}});
  for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:9500,maxHp:9500,
   autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
  for(const v of a.minions)Object.assign(v,{x:.08,y:.08});
  const u=a.units.find(v=>v.id===team+'_MID'),
   e=a.units.find(v=>v.id===other+'_MID'),
   ally=a.units.find(v=>v.id===team+'_TOP'),
   second=a.units.find(v=>v.id===other+'_TOP');
  Object.assign(u,{x:.5,y:.5,hp:5000,maxHp:9000,mana:10000,maxMana:10000,
   level:16,skillRanks:{Q:5,W:5,E:5,R:3},
   skillCds:{Q:0,W:0,E:0,R:0}});
  Object.assign(e,{x:.525,y:.5,hp:15000,maxHp:15000,armor:0,mr:0});
  Object.assign(ally,{x:.515,y:.5,hp:3000,maxHp:9000});
  Object.assign(second,{x:.535,y:.5,hp:15000,maxHp:15000,armor:0,mr:0});
  a.visible=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
  function cast(slot,opts={}){
   const q=a.queueBoardSkillV453Dev69(team,u.id,slot,opts);
   assert.equal(q.ok,true,'queue '+champ+' '+JSON.stringify(q));
   let receipt;const native=a.executeBoardSkillV453Dev69.bind(a);
   a.executeBoardSkillV453Dev69=(actor,plan)=>(receipt=native(actor,plan));
   try{a.resolveBoardSkillsV453Dev69()}
   finally{a.executeBoardSkillV453Dev69=native;}
   assert.equal(receipt?.ok,true,'receipt '+champ+' '+JSON.stringify(receipt));
   return receipt;
  }
  const tick=()=>{a.gameTime++;a.round++;a.actionLocksV40={};
   a.advanceBoardPassivesV453Dev69();};
  fn({a,u,e,ally,second,cast,tick,team,other});
  const snap=a.snapshotV40();
  assert.equal(checksumV40(snap),
   checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
  passed++;snapshots++;
 }catch(error){failures.push({team,champ,label,error:String(error?.stack||error)});}
}
for(const team of ['blue','red']){
 scenario(team,'Leblanc','W2 returns without duplicate mana debit',({u,cast})=>{
  const origin=u.x;cast('W',{point:{x:.526,y:.5}});
  assert.equal(u.m44B13Return.point.x,origin);
  const mana=u.mana,r=cast('W');
  assert.equal(r.recast,true);assert.equal(r.spentMana,0);
  assert.equal(u.mana,mana);assert.equal(u.x,origin);
 });
 scenario(team,'Zed','W2 teleports to owner shadow without extra cost',({a,u,cast})=>{
  const r=cast('W',{point:{x:.526,y:.5}});
  assert.ok(a.boardSummonsV453Dev69.find(v=>v.id===r.entityId&&v.kind==='zed_shadow'));
  const mana=u.mana,recast=cast('W');
  assert.equal(recast.recast,true);assert.equal(recast.spentMana,0);
  assert.equal(u.mana,mana);assert.equal(u.x,.526);
 });
 scenario(team,'Kalista','Rend is bound to landed owner basics',({a,u,e,cast})=>{
  a.damage(e,30,u,'physical','basic');a.damage(e,30,u,'physical','basic');
  assert.equal(e.m44B13KalistaSpears[u.id].stacks,2);
  const hp=e.hp,r=cast('E');assert.equal(r.affected,1);
  assert.ok(e.hp<hp);assert.equal(e.m44B13KalistaSpears[u.id],undefined);
 });
 scenario(team,'Bard','Fate freezes allies and enemies',({a,u,e,ally,cast})=>{
  cast('R',{point:{x:.525,y:.5}});
  assert.equal(a.effectResolverV41().has(e,'stasis'),true);
  assert.equal(a.effectResolverV41().has(ally,'stasis'),true);
  const hp=e.hp;assert.equal(a.damage(e,200,u,'magic','spell'),0);
  assert.equal(e.hp,hp);
 });
 scenario(team,'Nami','Ebb and Flow alternates enemy ally enemy',({u,e,ally,second,cast})=>{
  const r=cast('W',{targetId:e.id});
  assert.equal(r.ebbFlow,true);
  assert.deepEqual(r.hops,[e.id,ally.id,second.id]);
 });
 scenario(team,'Ryze','Realm Warp remains delayed until t+2',({a,u,ally,cast,tick})=>{
  const original=ally.x;
  cast('R',{point:{x:.62,y:.5}});
  assert.equal(ally.x,original);tick();assert.equal(ally.x,original);
  tick();assert.ok(ally.x>.6);
 });
 scenario(team,'Malzahar','Nether Grasp suppresses and ticks',({a,u,e,cast,tick})=>{
  const hp=e.hp;cast('R',{targetId:e.id});
  assert.equal(a.effectResolverV41().has(e,'suppression'),true);
  tick();assert.ok(e.hp<hp);
 });
 scenario(team,'Nocturne','Paranoia restricts distant shared vision',({a,u,e,cast,other})=>{
  cast('R',{targetId:e.id});
  assert.ok(a.teams[other].m44B13ParanoiaUntil>a.gameTime);
  assert.equal(a.canSeePoint(other,{x:.85,y:.85}),false);
  assert.equal(a.canSeePoint(other,{x:e.x,y:e.y}),true);
 });
 scenario(team,'Samira','Blade Whirl intercepts swept projectile',({a,u,e,cast,tick})=>{
  cast('W');
  const p={id:++a.boardTemporalIdV453Dev69,kind:'m44_authored_projectile',
   ownerId:e.id,team:e.team,champ:'Ashe',slot:'R',
   origin:{x:.45,y:.5},current:{x:.45,y:.5},point:{x:.6,y:.5},
   range:2250,width:150,speed:600,power:250,damageType:'magic',
   hitIds:[],hitCount:0,distanceDone:0,maxHits:1,
   nextAt:a.gameTime+1,until:a.gameTime+5};
  a.boardTemporalV453Dev69.push(p);tick();
  assert.equal(a.boardTemporalV453Dev69.some(v=>v.id===p.id),false);
 });
 scenario(team,'Belveth','Royal Maelstrom reduces incoming damage',({a,u,e,cast})=>{
  cast('E');const hp=u.hp;a.damage(u,200,e,'physical','spell');
  assert.ok(u.hp>hp-150);
 });
 scenario(team,'Pantheon','Aegis guards front more than back',({a,u,e,cast})=>{
  u.m28FacingV453={x:1,y:0};cast('E');
  const initial=u.hp;a.damage(u,200,e,'physical','spell');
  const front=initial-u.hp;e.x=.475;
  const next=u.hp;a.damage(u,200,e,'physical','spell');
  assert.ok(next-u.hp>front);
 });
 scenario(team,'Skarner','Impale holds owner-linked enemy',({a,u,e,cast,tick})=>{
  const r=cast('R',{point:{x:.56,y:.5}});
  assert.ok(r.victims>=1);
  assert.equal(e.m44B13SkarnerImpaled?.ownerId,u.id);
  assert.equal(a.effectResolverV41().has(e,'suppression'),true);
  tick();
 });
 scenario(team,'Shyvana','Dragon fire creates persistent scorch zone',({a,u,cast})=>{
  u.boardFormV453M14='dragon';
  const r=cast('E',{point:{x:.56,y:.5}});
  assert.equal(r.dragon,true);
  assert.ok(a.boardTemporalV453Dev69.some(v=>
   v.kind==='m44_b13_zone'&&v.variant==='shyvana_e'&&v.ownerId===u.id));
 });
 scenario(team,'Jayce','level-one Mercury Cannon to Hammer conversion',({u,cast})=>{
  u.level=1;u.skillRanks.R=1;u.skillCds.R=0;
  const rec=cast('R');
  assert.equal(rec.transformed,true);assert.equal(rec.form,'hammer');
  assert.equal(u.m44B13JayceMode,'hammer');
 });
 scenario(team,'Yorick','Maiden is server pet not a sixth champion',({a,u,cast})=>{
  const before=a.units.length,r=cast('R');
  assert.equal(a.units.length,before);
  assert.ok(a.boardSummonsV453Dev69.find(v=>
   v.id===r.entityId&&v.kind==='yorick_maiden'&&v.ownerId===u.id&&v.power>0));
 });
}
for(const f of failures)console.error('M44_B13_ADVERSARIAL_FAIL',JSON.stringify(f));
console.log('M44_B13_ADVERSARIAL '+JSON.stringify({passed,snapshots,
 failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(passed,30);
