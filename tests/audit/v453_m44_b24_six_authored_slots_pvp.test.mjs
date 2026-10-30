/* M44 B24 — six individual Q/W/E/R identities, PvP blue/red and deterministic snapshots. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,m44B14DOriginalBoardRuleV453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),cases=[];
function fixture(side,mine,theirs){
 const opp=side==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:20240,draft:{[side]:{MID:mine},[opp]:{MID:theirs}}});
 for(const z of a.units)Object.assign(z,{x:.07,y:.07,hp:20000,maxHp:20000,
   armor:0,mr:0,autoFollow:false,autoAttack:false,autoFarm:false,autoJungle:false});
 for(const z of a.minions)Object.assign(z,{x:.07,y:.07});
 a.visible=()=>true;a.canSeePoint=()=>true;
 const u=a.units.find(z=>z.id===side+'_MID'),v=a.units.find(z=>z.id===opp+'_MID');
 for(const z of [u,v])Object.assign(z,{level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(u,{x:.5,y:.5});Object.assign(v,{x:.525,y:.5});
 const cast=(who,slot,opts={})=>{
  const q=a.queueBoardSkillV453Dev69(who.team,who.id,slot,opts);
  assert.equal(q.ok,true,JSON.stringify(q));
  let receipt,fn=a.executeBoardSkillV453Dev69.bind(a);
  a.executeBoardSkillV453Dev69=(actor,cmd)=>{const z=fn(actor,cmd);if(actor.id===who.id)receipt=z;return z;};
  try{a.resolveBoardSkillsV453Dev69();}finally{a.executeBoardSkillV453Dev69=fn;}
  assert.equal(receipt?.ok,true,JSON.stringify(receipt));return receipt;
 };
 return {a,u,v,opp,point:{x:v.x,y:v.y},cast};
}
const test=(name,mine,theirs,fn)=>cases.push({name,mine,theirs,fn});
test('six B24 rules are real board identities, not training fallback','Jhin','Annie',()=>{
 for(const [name,slot] of [['Jhin','Q'],['Nautilus','W'],['Nautilus','E'],
  ['Thresh','E'],['Senna','R'],['Caitlyn','R']])
  assert.equal(m44B14DOriginalBoardRuleV453(name,slot)?.m44B24Id,name+'.'+slot);
 assert.equal(m44B14DOriginalBoardRuleV453('Aatrox','Q'),null);
});
test('Jhin Q initial grenade consumes exactly one skill cost','Jhin','Annie',({u,v,cast})=>{
 const mana=u.mana,r=cast(u,'Q',{targetId:v.id});
 assert.equal(r.dancingGrenade,true);assert.deepEqual(r.hitIds,[v.id]);
 assert.equal(u.mana,mana-40);assert.ok(u.skillCds.Q>0);
});
test('Jhin Q bounces through distinct nearby opponents','Jhin','Annie',({a,u,v,opp,cast})=>{
 const others=a.units.filter(z=>z.team===opp&&z.id!==v.id).slice(0,3);
 for(let i=0;i<others.length;i++)Object.assign(others[i],{x:v.x+(i+1)*.011,y:v.y,hp:20000,maxHp:20000});
 const r=cast(u,'Q',{targetId:v.id});
 assert.equal(r.hitIds.length,4);assert.equal(new Set(r.hitIds).size,4);
 assert.equal(r.hitIds[0],v.id);
});
test('Jhin Q increases later bounces on kill, excludes dead target','Jhin','Annie',({a,u,v,opp,cast})=>{
 v.hp=40;const other=a.units.find(z=>z.team===opp&&z.id!==v.id);
 Object.assign(other,{x:v.x+.018,y:v.y,hp:20000});
 const hp=other.hp,r=cast(u,'Q',{targetId:v.id});
 assert.equal(v.hp,0);assert.equal(r.hitIds[0],v.id);
 assert.ok(r.hitIds.includes(other.id));assert.ok(hp-other.hp>r.damages[0]);
});
test('Jhin Q cannot ricochet through a blocked ray','Jhin','Annie',({a,u,v,opp,cast})=>{
 const other=a.units.find(z=>z.team===opp&&z.id!==v.id);
 Object.assign(other,{x:v.x+.022,y:v.y});
 const base=a.obstacleLine.bind(a);a.obstacleLine=(p,q)=>p.x===v.x&&q.x===other.x?true:base(p,q);
 const r=cast(u,'Q',{targetId:v.id});assert.deepEqual(r.hitIds,[v.id]);
});
test('Nautilus W grants shield and activates short-lived AA empowerment','Nautilus','Annie',({a,u,v,cast})=>{
 const r=cast(u,'W');assert.equal(r.titansWrath,true);
 assert.ok(a.effectResolverV41().list(u).some(e=>e.type==='shield'&&e.power>0));
 const hp=v.hp;a.attack(u,v,80,'attack');assert.ok(hp-v.hp>80);
 const hp2=v.hp;a.gameTime=7;a.attack(u,v,80,'attack');
 assert.ok(hp2-v.hp<=80.01,'expired Titan Wrath still damages');
});
test('Nautilus W splashes enemies, not allies, on basic hit','Nautilus','Annie',({a,u,v,opp,cast})=>{
 const near=a.units.find(z=>z.team===opp&&z.id!==v.id);
 Object.assign(near,{x:v.x+.010,y:v.y});
 const ally=a.units.find(z=>z.team===u.team&&z.id!==u.id);
 Object.assign(ally,{x:v.x+.012,y:v.y});
 cast(u,'W');const eh=near.hp,ah=ally.hp;
 a.attack(u,v,80,'attack');assert.ok(near.hp<eh);assert.equal(ally.hp,ah);
});
test('Nautilus E performs three distinct outward waves','Nautilus','Annie',({a,u,v,cast})=>{
 const r=cast(u,'E');assert.equal(r.waves,3);
 const z=a.boardTemporalV453Dev69.find(z=>z.kind==='m44_b24_nautilus_riptide');
 v.x=u.x+.012;
 assert.ok(z);const hp=v.hp;a.advanceBoardTemporalV453Dev69();
 assert.equal(z.wave,1);assert.ok(v.hp<hp);const h1=v.hp;
 a.gameTime+=.35;a.advanceBoardTemporalV453Dev69();
 assert.equal(z.wave,2);assert.ok(v.hp<h1);const h2=v.hp;
 a.gameTime+=.35;a.advanceBoardTemporalV453Dev69();
 assert.ok(v.hp<h2);assert.equal(z.wave,3);
 assert.ok(!a.boardTemporalV453Dev69.includes(z));
});
test('Nautilus E hits later waves only when target enters radius','Nautilus','Annie',({a,u,v,cast})=>{
 v.x=u.x+.040;const hp=v.hp;cast(u,'E');a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);v.x=u.x+.027;
 a.gameTime+=.35;a.advanceBoardTemporalV453Dev69();assert.ok(v.hp<hp);
});
test('Thresh E flays visible opponents and displaces them safely','Thresh','Annie',({a,u,v,point,cast})=>{
 const original=v.x,r=cast(u,'E',{point});
 assert.ok(r.hitIds.includes(v.id));assert.ok(v.hp<20000);
 assert.ok(v.x>original);assert.ok(a.effectResolverV41().has(v,'slow'));
});
test('Thresh E does not displace a spell-shielded target','Thresh','Annie',({a,u,v,point,cast})=>{
 a.applyEffectV41(v,'spell_shield',{source:v,duration:3,key:'b24_flayshield'});
 const original=v.x;cast(u,'E',{point});
 assert.equal(v.x,original);
});
test('Thresh E does not damage an ally on the flay ray','Thresh','Annie',({a,u,v,point,cast})=>{
 const ally=a.units.find(z=>z.team===u.team&&z.id!==u.id);
 Object.assign(ally,{x:v.x,y:v.y});const hp=ally.hp;
 cast(u,'E',{point});assert.equal(ally.hp,hp);
});
test('Senna R center beam hits enemy, broader beam shields allies','Senna','Annie',({a,u,v,point,cast})=>{
 const ally=a.units.find(z=>z.team===u.team&&z.id!==u.id);
 Object.assign(ally,{x:u.x+.08,y:u.y+.018});
 const other=a.units.find(z=>z.team===v.team&&z.id!==v.id);
 Object.assign(other,{x:v.x+.02,y:v.y+.07});
 const hp=other.hp,r=cast(u,'R',{point});
 assert.ok(r.struck.includes(v.id));assert.ok(!r.struck.includes(other.id));
 assert.ok(r.shielded.includes(ally.id));assert.equal(other.hp,hp);
 assert.ok(a.effectResolverV41().has(ally,'shield'));
});
test('Senna R does not damage off-axis or allied bodies','Senna','Annie',({a,u,v,point,cast})=>{
 const ally=a.units.find(z=>z.team===u.team&&z.id!==u.id);
 Object.assign(ally,{x:v.x,y:v.y});const hp=ally.hp;
 cast(u,'R',{point});assert.equal(ally.hp,hp);
});
test('Caitlyn R locks target, fires on timer rather than immediately','Caitlyn','Annie',({a,u,v,cast})=>{
 const hp=v.hp,r=cast(u,'R',{targetId:v.id});
 assert.equal(r.aceInTheHole,true);assert.equal(v.hp,hp);
 a.gameTime=.8;a.advanceBoardTemporalV453Dev69();
 assert.ok(v.hp<hp);assert.equal(u.boardChannelUntilV453Dev69,0);
});
test('Caitlyn R is bodyblocked by the closest enemy champion','Caitlyn','Annie',({a,u,v,cast,opp})=>{
 const body=a.units.find(z=>z.team===opp&&z.id!==v.id);
 Object.assign(body,{x:.515,y:.5,hp:20000,maxHp:20000});
 const hp=v.hp,bh=body.hp;cast(u,'R',{targetId:v.id});
 a.gameTime=.8;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);assert.ok(body.hp<bh);
});
test('Caitlyn R hard CC cancels lock before shot','Caitlyn','Annie',({a,u,v,cast})=>{
 const hp=v.hp;cast(u,'R',{targetId:v.id});
 a.applyEffectV41(u,'stun',{source:v,duration:2,key:'b24_cait_cc'});
 a.gameTime=.8;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);assert.ok(a.m44B22ChannelInterruptHistory?.some(z=>
  z.kind==='m44_b24_caitlyn_ace'&&z.reason==='cc'));
});
test('Viktor R interrupts Caitlyn R via shared authored channel','Caitlyn','Viktor',({a,u,v,cast})=>{
 cast(u,'R',{targetId:v.id});
 assert.equal(a.m41ViktorStormDisruptV453Dev69(v,u),true);
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='m44_b24_caitlyn_ace'));
 assert.ok(a.m44B22ChannelInterruptHistory?.some(z=>
  z.kind==='m44_b24_caitlyn_ace'&&z.sourceId===v.id));
});
test('Caitlyn R caster death cancels delayed shot','Caitlyn','Annie',({a,u,v,cast})=>{
 const hp=v.hp;cast(u,'R',{targetId:v.id});u.hp=0;a.gameTime=.8;
 a.advanceBoardTemporalV453Dev69();assert.equal(v.hp,hp);
});
test('Caitlyn R target death removes delayed damage','Caitlyn','Annie',({a,u,v,cast})=>{
 cast(u,'R',{targetId:v.id});v.hp=0;a.gameTime=.8;
 a.advanceBoardTemporalV453Dev69();assert.equal(v.hp,0);
});
// B24 shared-source invariants: Sylas and Viego reuse this same B24 executor.
test('Sylas steals Senna Dawning Shadow and uses its authored beam','Sylas','Senna',({a,u,v,point,cast})=>{
 assert.equal(a.queueSylasHijackV453M14(u.team,u.id,v.id).ok,true);
 a.resolveSylasHijacksV453M14();
 assert.equal(u.sylasStolenV453M14?.sourceChamp,'Senna');
 const r=cast(u,'R',{point});
 assert.ok(r.hijacked&&r.dawningShadow);assert.ok(r.struck.includes(v.id));
 assert.equal(u.champ,'Sylas');assert.equal(u.sylasStolenV453M14,null);
});
test('Sylas steals Caitlyn Ace in the Hole without second mana debit','Sylas','Caitlyn',({a,u,v,cast})=>{
 assert.equal(a.queueSylasHijackV453M14(u.team,u.id,v.id).ok,true);
 a.resolveSylasHijacksV453M14();
 const r=cast(u,'R',{targetId:v.id});
 assert.ok(r.hijacked&&r.aceInTheHole);
 assert.equal(r.spentMana,0);assert.equal(u.champ,'Sylas');
 assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_b24_caitlyn_ace'&&z.ownerId===u.id));
});
function b24Possess(a,u,donor){
 donor.hp=100;a.damage(donor,500,u,'true','spell');
 const soul=u.m44B14CSouls?.[0];assert.ok(soul,'Viego must earn soul');
 assert.equal(a.queueViegoPossessV453M44B14C(u.team,u.id,soul.id).ok,true);
 a.resolveBoardSkillsV453Dev69();
 assert.equal(u.champ,donor.champ);assert.equal(u.team,donor.team==='blue'?'red':'blue');
}
test('Viego copies Jhin Q after taking his soul','Viego','Jhin',({a,u,v,cast})=>{
 b24Possess(a,u,v);
 const target=a.units.find(z=>z.team===v.team&&z.id!==v.id);
 Object.assign(target,{x:u.x+.02,y:u.y});
 const r=cast(u,'Q',{targetId:target.id});
 assert.equal(r.dancingGrenade,true);assert.ok(r.hitIds.includes(target.id));
 assert.equal(u.champ,'Jhin');assert.ok(u.m44B14CPossession);
});
test('Viego copies Nautilus W shield and empowered basic','Viego','Nautilus',({a,u,v,cast})=>{
 b24Possess(a,u,v);
 const target=a.units.find(z=>z.team===v.team&&z.id!==v.id);
 Object.assign(target,{x:u.x+.02,y:u.y});
 const r=cast(u,'W');assert.equal(r.titansWrath,true);
 const hp=target.hp;a.attack(u,target,80,'attack');assert.ok(hp-target.hp>80);
});
test('Viego copies Nautilus E three-wave scheduler','Viego','Nautilus',({a,u,v,cast})=>{
 b24Possess(a,u,v);
 const target=a.units.find(z=>z.team===v.team&&z.id!==v.id);
 Object.assign(target,{x:u.x+.012,y:u.y});
 const r=cast(u,'E');assert.equal(r.riptide,true);
 const hp=target.hp;a.advanceBoardTemporalV453Dev69();
 assert.ok(target.hp<hp);
 assert.ok(a.boardTemporalV453Dev69.some(z=>
  z.kind==='m44_b24_nautilus_riptide'&&z.ownerId===u.id));
});

test('Caitlyn R rejects nonchampion lock without paying mana','Caitlyn','Annie',({a,u,v})=>{
 v.champ=null;const mana=u.mana,cd=u.skillCds.R;
 const r=a.executeBoardSkillV453Dev69(u,{slot:'R',targetId:v.id});
 assert.equal(r.ok,false);assert.equal(r.reason,'m44_b24_caitlyn_requires_champion');
 assert.equal(u.mana,mana);assert.equal(u.skillCds.R,cd);
});
test('Senna R zero-length aim cannot hit the entire board','Senna','Annie',({a,u,v})=>{
 const mana=u.mana,hp=v.hp;
 const r=a.executeBoardSkillV453Dev69(u,{slot:'R',point:{x:u.x,y:u.y}});
 assert.equal(r.ok,false);assert.equal(r.reason,'m44_b24_direction_required');
 assert.equal(v.hp,hp);assert.equal(u.mana,mana);
});
test('Thresh E zero-length aim cannot become an omnidirectional flay','Thresh','Annie',({a,u,v})=>{
 const mana=u.mana,hp=v.hp;
 const r=a.executeBoardSkillV453Dev69(u,{slot:'E',point:{x:u.x,y:u.y}});
 assert.equal(r.ok,false);assert.equal(r.reason,'m44_b24_direction_required');
 assert.equal(v.hp,hp);assert.equal(u.mana,mana);
});

test('Nautilus E unfinished rings never migrate to a new realm','Nautilus','Mordekaiser',({a,u,v,cast})=>{
 v.x=u.x+.012;cast(u,'E');a.advanceBoardTemporalV453Dev69();
 const hp=v.hp;assert.equal(a.startRealmV453Dev69(v,u).ok,true);
 a.gameTime+=.35;a.advanceBoardTemporalV453Dev69();
 assert.equal(v.hp,hp);
 assert.ok(!a.boardTemporalV453Dev69.some(z=>z.kind==='m44_b24_nautilus_riptide'));
});

let passed=0;const failures=[];
for(const side of ['blue','red'])for(const c of cases){
 try{
  const f=fixture(side,c.mine,c.theirs);c.fn(f);
  const snap=f.a.snapshotV40(),restored=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(snap),checksumV40(restored.snapshotV40()));
  passed++;
 }catch(e){failures.push({side,name:c.name,error:String(e?.stack||e)});}
}
for(const f of failures)console.error('M44_B24_FAIL',JSON.stringify(f));
console.log('M44_B24',JSON.stringify({cases:cases.length,seats:2,passed,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);
