/* M44 B17: original timed abilities, defensive gates, real owner damage; both PvP seats. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
function fixture(side,champ,other='Annie'){
 const enemy=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:1718,mode:'pvp',draft:{[side]:{MID:champ},[enemy]:{MID:other}}});
 for(const v of a.units)Object.assign(v,{x:.07,y:.07,hp:20000,maxHp:20000,
  armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const v of a.minions)Object.assign(v,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 const u=a.units.find(v=>v.id===side+'_MID'),v=a.units.find(v=>v.id===enemy+'_MID');
 Object.assign(u,{x:.5,y:.5,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(v,{x:.516,y:.5,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 return {a,u,v,side,enemy};
}
function cast(a,u,slot,args={}){
 const queued=a.queueBoardSkillV453Dev69(u.team,u.id,slot,args);
 assert.equal(queued.ok,true,JSON.stringify(queued));
 const orig=a.executeBoardSkillV453Dev69.bind(a);let receipt;
 a.executeBoardSkillV453Dev69=(actor,q)=>{
  const r=orig(actor,q);if(actor.id===u.id)receipt=r;return r;
 };
 try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=orig}
 assert.ok(receipt,'missing authoritative receipt');return receipt;
}
const checks=[
 ['kindred sanctuary saves BOTH teams',({a,u,v})=>{
  u.hp=v.hp=500;u.maxHp=v.maxHp=1000;
  assert.equal(cast(a,u,'R',{point:{x:v.x,y:v.y}}).lambsRespite,true);
  a.damage(v,5000,u,'true','spell');a.damage(u,5000,v,'true','spell');
  assert.equal(v.hp,100);assert.equal(u.hp,100);
  a.gameTime+=5;a.advanceBoardPassivesV453Dev69();
  assert.ok(v.hp>100&&u.hp>100,'sanctuary expiry must heal both teams');
 }],
 ['kindred dread three real basic attacks',({a,u,v})=>{
  assert.equal(cast(a,u,'E',{targetId:v.id}).mountingDread,true);
  const mark=v.m44B17MountingDread?.[u.id];assert.ok(mark&&mark.stacks===0);
  a.damage(v,20,u,'physical','basic');a.damage(v,20,u,'physical','basic');
  assert.equal(mark.stacks,2);
  const hp=v.hp;
  a.damage(v,20,u,'physical','basic');
  assert.equal(v.m44B17MountingDread?.[u.id],undefined);
  assert.ok(v.hp<hp-20,'dread must detonate beyond the third attack');
 }],
 ['poppy W stops enemy dash without debit',({a,u,v})=>{
  assert.equal(cast(a,u,'W').steadfastPresence,true);
  const mana=v.mana,cooldown=v.skillCds.Q;
  assert.equal(a.queueBoardSkillV453Dev69(v.team,v.id,'Q',
   {point:{x:.526,y:v.y}}).ok,true);
  const original=a.executeBoardSkillV453Dev69.bind(a);let result;
  a.executeBoardSkillV453Dev69=(actor,order)=>{
   const value=original(actor,order);if(actor.id===v.id)result=value;return value;
  };
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=original}
  assert.equal(result?.reason,'m44_b17_poppy_anti_dash');
  assert.equal(v.mana,mana);assert.equal(v.skillCds.Q,cooldown);
  assert.ok(u.m44B17Steadfast.blocked>=1);
 }],
 ['samira R requires SIX style and revalidates at commit',({a,u})=>{
  const bad=a.queueBoardSkillV453Dev69(u.team,u.id,'R');
  assert.equal(bad.reason,'m44_b17_samira_style_required');
  u.m44B17SamiraStyle=6;
  assert.equal(a.queueBoardSkillV453Dev69(u.team,u.id,'R').ok,true);
  const mana=u.mana,cd=u.skillCds.R;u.m44B17SamiraStyle=0;
  const orig=a.executeBoardSkillV453Dev69.bind(a);let result;
  a.executeBoardSkillV453Dev69=(actor,order)=>(result=orig(actor,order));
  try{a.resolveBoardSkillsV453Dev69()}finally{a.executeBoardSkillV453Dev69=orig}
  assert.equal(result?.reason,'m44_b17_samira_style_required');
  assert.equal(u.mana,mana);assert.equal(u.skillCds.R,cd);
  u.m44B17SamiraStyle=6;
  assert.equal(cast(a,u,'R').infernoTrigger,true);
  assert.equal(u.m44B17SamiraStyle,0);
 }],
 ['malz voidlings independently attack owner-marked targets',({a,u,v})=>{
  assert.equal(cast(a,u,'W').voidSwarm,true);
  const pets=a.boardSummonsV453Dev69.filter(p=>p.kind==='malz_voidling'&&p.ownerId===u.id);
  assert.equal(pets.length,3);
  const hp=v.hp;a.gameTime+=1;a.advanceBoardPassivesV453Dev69();
  assert.ok(v.hp<hp,'voidlings need actual owner damage');
 }],
 ['volibear W wound and repeat heal',({a,u,v})=>{
  u.hp=1000;
  assert.equal(cast(a,u,'W',{targetId:v.id}).repeatBite,false);
  assert.ok(v.m44B17VolibearWound?.[u.id]>a.gameTime);
  a.gameTime+=6;u.skillCds.W=0;
  const before=u.hp;
  assert.equal(cast(a,u,'W',{targetId:v.id}).repeatBite,true);
  assert.ok(u.hp>before,'repeat bite heals owner');
 }],
 ['poppy E physical wall impact stuns',({a,u,v})=>{
  a.obstacleLine=(from,to)=>from?.id===v.id&&to?.x>v.x;
  const result=cast(a,u,'E',{targetId:v.id});
  assert.equal(result.heroicCharge,true);
  assert.equal(result.wallStun,true);
  assert.ok(v.stunUntil>a.gameTime);
 }],
 ['volibear E delayed impact damages',({a,u,v})=>{
  assert.equal(cast(a,u,'E',{point:{x:v.x,y:v.y}}).skySplitter,true);
  const before=v.hp;a.gameTime+=1;a.advanceBoardPassivesV453Dev69();
  assert.ok(v.hp<before,'delayed lightning must damage');
 }]
];
let passed=0,snapshots=0;const failures=[];
for(const side of ['blue','red'])for(const [name,fn] of checks){
 try{
  const champ=name.startsWith('kindred')?'Kindred':
   name.startsWith('poppy')?'Poppy':
   name.startsWith('samira')?'Samira':
   name.startsWith('malz')?'Malzahar':'Volibear';
  const ctx=fixture(side,champ,name.startsWith('poppy W')?'Kindred':'Annie');
  fn(ctx);
  const snapshot=ctx.a.snapshotV40();
  assert.equal(checksumV40(snapshot),
   checksumV40(Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()));
  passed++;snapshots++;
 }catch(e){failures.push({side,name,error:String(e?.stack||e)})}
}
for(const f of failures)console.error('M44_B17_ADVERSARIAL_FAIL',JSON.stringify(f));
console.log('M44_B17_ADVERSARIAL '+JSON.stringify({checks:checks.length,seats:2,
 passed,snapshots,failures:failures.length,certifiedFullKits:0}));
assert.equal(failures.length,0);assert.equal(passed,16);
