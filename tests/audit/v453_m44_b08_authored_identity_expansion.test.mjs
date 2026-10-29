/** M44 B08: ten newly authored slots, recast/charge refinements and V40 replay. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,M44_B08_KITS_V453} from '../../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let pass=0,snapshots=0;const failures=[];
function setup(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:440808,mode:'pvp',draft:{
  [team]:{MID:champ,TOP:'Annie'},[other]:{MID:'Annie',TOP:'Malphite'}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,hp:7000,maxHp:7000,
  autoFollow:false,autoFarm:false,autoAttack:false,autoJungle:false});
 for(const v of a.minions)Object.assign(v,{x:.08,y:.08});
 const u=a.units.find(v=>v.id===team+'_MID'),
  e=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP'),
  secondary=a.units.find(v=>v.id===other+'_TOP');
 Object.assign(u,{x:.5,y:.5,hp:5000,maxHp:5000,level:16,mana:10000,maxMana:10000,
  skillRanks:{Q:5,W:5,E:5,R:3},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(e,{x:.527,y:.5,hp:12000,maxHp:12000,armor:0,mr:0});
 Object.assign(ally,{x:.518,y:.5,hp:3000,maxHp:7000});
 Object.assign(secondary,{x:.08,y:.08,hp:10000,maxHp:10000});
 a.visible=()=>true;a.canSeePoint=()=>true;a.walkable=()=>true;a.obstacleLine=()=>false;
 function cast(slot,options={}){
  const command={point:options.point??null,targetId:options.targetId??null,
   chargeSeconds:options.chargeSeconds??null};
  const q=a.queueBoardSkillV453Dev69(team,u.id,slot,command);
  assert.equal(q.ok,true,'queue '+champ+' '+slot+': '+JSON.stringify(q));
  const prev=a.executeBoardSkillV453Dev69.bind(a);let receipt;
  a.executeBoardSkillV453Dev69=(actor,intent)=>(receipt=prev(actor,intent));
  try{a.resolveBoardSkillsV453Dev69()}
  finally{a.executeBoardSkillV453Dev69=prev}
  assert.equal(receipt?.ok,true,'commit '+champ+' '+slot+': '+JSON.stringify(receipt));
  return receipt;
 }
 function tick(){a.gameTime++;a.round++;a.actionLocksV40={};a.advanceBoardPassivesV453Dev69();}
 return {a,u,e,ally,secondary,other,cast,tick};
}
function check(champ,team,label,fn){
 const f=setup(champ,team);
 try{fn(f);const snapshot=f.a.snapshotV40();
  assert.equal(checksumV40(snapshot),
   checksumV40(Arena.fromSnapshotV40(map,mask,snapshot).snapshotV40()));
  pass++;snapshots++;
 }catch(err){failures.push({champ,team,label,error:String(err.stack||err)})}
}
for(const team of ['blue','red']){
 check('Orianna',team,'E attached shield follows moving ally',({a,u,e,ally,cast,tick})=>{
  e.x=.508;const hp=e.hp;const receipt=cast('E',{targetId:ally.id});
  assert.equal(receipt.scheduled,true);assert.equal(e.hp,hp);tick();
  assert.ok(e.hp<hp);assert.ok(a.effectResolverV41().has(ally,'shield'));
  assert.equal(u.m44B07Ball.allyId,ally.id);
  ally.x=.529;assert.equal(a.m44B08OriannaPointV453Dev69(u).x,ally.x);
 });
 check('Orianna',team,'R delayed shockwave follows ally ball position',({a,u,e,ally,cast,tick})=>{
  u.m44B07Ball={allyId:ally.id,until:a.gameTime+20};
  ally.x=e.x;const hp=e.hp;cast('R');assert.equal(e.hp,hp);
  tick();assert.ok(e.hp<hp);assert.ok(a.effectResolverV41().has(e,'stun'));
 });
 check('Orianna',team,'R respects spell shield on knockback',({a,u,e,cast,tick})=>{
  u.m44B07Ball={x:e.x,y:e.y,until:a.gameTime+10};
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b08_shield'});
  const x=e.x;cast('R');tick();
  assert.equal(a.effectResolverV41().has(e,'stun'),false);
  assert.equal(e.x,x);
 });
 check('Orianna',team,'E loses ball when allied carrier dies',({a,u,ally,cast,tick})=>{
  cast('E',{targetId:ally.id});ally.hp=0;tick();
  assert.equal(u.m44B07Ball,null);
 });
 check('Karma',team,'R empowers one Q and detonates later',({a,u,e,cast,tick})=>{
  assert.equal(cast('R').empowered,true);assert.ok(u.m44B08Mantra);
  const hp=e.hp;cast('Q',{point:{x:.56,y:.5}});
  assert.equal(u.m44B08Mantra,null);assert.equal(e.hp,hp);
  tick();const first=e.hp;assert.ok(first<hp);
  tick();assert.ok(e.hp<first);assert.ok(a.effectResolverV41().has(e,'slow'));
 });
 check('Karma',team,'unempowered Q does not create Soulflare burst',({a,e,cast,tick})=>{
  cast('Q',{point:{x:.56,y:.5}});tick();tick();
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_b08_karma_burst'),false);
 });
 check('Senna',team,'Q ray damages enemy and heals same-line ally',({e,ally,cast,tick})=>{
  const hp=e.hp,heal=ally.hp;cast('Q',{point:{x:.56,y:.5}});
  assert.equal(e.hp,hp);tick();assert.ok(e.hp<hp);assert.ok(ally.hp>heal);
 });
 check('Senna',team,'Q ray wall suppresses damage and healing',({a,e,ally,cast,tick})=>{
  const hp=e.hp,heal=ally.hp;cast('Q',{point:{x:.56,y:.5}});
  a.obstacleLine=()=>true;tick();assert.equal(e.hp,hp);assert.equal(ally.hp,heal);
 });
 check('Thresh',team,'W shield and W2 rescues ally without new cost',({a,u,ally,cast,tick})=>{
  cast('W',{point:{x:ally.x,y:ally.y}});
  assert.equal(u.x,.5,'lantern cannot teleport caster');tick();
  assert.ok(a.effectResolverV41().has(ally,'shield'));
  const mana=u.mana;const res=cast('W',{targetId:ally.id});
  assert.equal(res.recast,true);assert.equal(res.spentMana,0);
  assert.equal(u.mana,mana);assert.equal(ally.x,u.x);
 });
 check('Thresh',team,'W2 revalidates terrain after queue',({a,u,ally,cast,tick})=>{
  cast('W',{point:{x:ally.x,y:ally.y}});tick();
  const q=a.queueBoardSkillV453Dev69(u.team,u.id,'W',{targetId:ally.id});
  assert.equal(q.ok,true);a.obstacleLine=()=>true;
  const x=ally.x;const receipt=a.executeBoardSkillV453Dev69(u,u.pendingBoardV453Dev69);
  assert.equal(receipt.ok,false);assert.equal(ally.x,x);
 });
 check('Thresh',team,'expired W does not allow rescue',({a,u,ally,cast})=>{
  cast('W',{point:{x:ally.x,y:ally.y}});a.gameTime+=7;
  const q=a.queueBoardSkillV453Dev69(u.team,u.id,'W',{targetId:ally.id});
  assert.equal(q.ok,false);
 });
 check('Zyra',team,'W seed Q germination plant fires on next tick',({a,u,e,cast,tick})=>{
  cast('W',{point:{x:e.x,y:e.y}});assert.equal(u.x,.5,'seed never moves Zyra');
  assert.equal(u.m44B08ZyraSeeds.length,1);const hp=e.hp;
  cast('Q',{point:{x:e.x,y:e.y}});tick();
  assert.ok(e.hp<hp);assert.equal(u.m44B08ZyraSeeds.length,0);
  assert.ok(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_b08_zyra_plant'));
  const after=e.hp;tick();assert.ok(e.hp<after);
 });
 check('Zyra',team,'Q no seed cannot invent a plant',({a,e,cast,tick})=>{
  cast('Q',{point:{x:e.x,y:e.y}});tick();
  assert.ok(e.hp<12000);
  assert.equal(a.boardTemporalV453Dev69.some(z=>z.kind==='m44_b08_zyra_plant'),false);
 });
 check('Nautilus',team,'R tracks enemy and knocks up line bystanders',({a,e,secondary,cast,tick})=>{
  secondary.x=.515;secondary.y=.5;const hp=e.hp;
  cast('R',{targetId:e.id});assert.equal(e.hp,hp);tick();
  assert.ok(e.hp<hp);assert.ok(secondary.hp<10000);
  assert.ok(a.effectResolverV41().has(e,'knockup'));
  assert.ok(a.effectResolverV41().has(secondary,'knockup'));
 });
 check('Nautilus',team,'R spell shield excludes primary knockup',({a,e,cast,tick})=>{
  a.applyEffectV41(e,'spell_shield',{source:e,duration:4,key:'b08_naut_shield'});
  cast('R',{targetId:e.id});tick();
  assert.equal(a.effectResolverV41().has(e,'knockup'),false);
 });
 check('Renata',team,'E crossing ray damages foes and shields allies',({a,e,ally,cast,tick})=>{
  const hp=e.hp;cast('E',{point:{x:.56,y:.5}});tick();
  assert.ok(e.hp<hp);assert.ok(a.effectResolverV41().has(e,'slow'));
  assert.ok(a.effectResolverV41().has(ally,'shield'));
 });
 check('Renata',team,'E ray cannot pass wall',({a,e,ally,cast,tick})=>{
  const hp=e.hp,old=ally.hp;cast('E',{point:{x:.56,y:.5}});
  a.obstacleLine=()=>true;tick();assert.equal(e.hp,hp);
  assert.equal(ally.hp,old);assert.equal(a.effectResolverV41().has(ally,'shield'),false);
 });
 check('Renata',team,'E point beyond range cannot strike distant champion',({a,e,cast,tick})=>{
  e.x=.61;const hp=e.hp;
  const rec=cast('E',{point:{x:.75,y:.5}});assert.equal(rec.scheduled,true);
  const zone=a.boardTemporalV453Dev69.find(z=>z.kind==='m44_b08_renata_e');
  assert.ok(zone);assert.ok(a.mapDistance(zone.origin,zone.point)<=800+1e-7);
  tick();assert.equal(e.hp,hp);
 });
 check('Pyke',team,'E dash is immediate; phantom deals delayed stun',({a,u,e,cast,tick})=>{
  const hp=e.hp;const rec=cast('E',{point:{x:.535,y:.5}});
  assert.equal(rec.dash,true);assert.ok(u.x>.53);assert.equal(e.hp,hp);
  tick();assert.ok(e.hp<hp);assert.ok(a.effectResolverV41().has(e,'stun'));
 });
 check('Pyke',team,'E phantom respects obstacle introduced before return',({a,e,cast,tick})=>{
  const hp=e.hp;cast('E',{point:{x:.535,y:.5}});
  a.obstacleLine=()=>true;tick();assert.equal(e.hp,hp);
 });
 check('Pyke',team,'Q zero charge stabs rather than displacing',({u,e,cast})=>{
  e.x=.52;const hp=e.hp,x=e.x;
  const rec=cast('Q',{point:{x:e.x,y:e.y},chargeSeconds:0});
  assert.equal(rec.stab,true);assert.ok(e.hp<hp);
  assert.equal(e.x,x);assert.equal(u.m44B07Hook,undefined);
 });
 check('Pyke',team,'Q insufficient charge rejects before mana debit',({a,u,e})=>{
  const mana=u.mana;
  const queued=a.queueBoardSkillV453Dev69(u.team,u.id,'Q',{
   point:{x:e.x,y:e.y},chargeSeconds:0});
  assert.equal(queued.ok,false);assert.equal(u.mana,mana);
 });
 check('Draven',team,'R manual recast reverses flying axes without paying twice',({a,u,e,cast,tick})=>{
  e.x=.72;cast('R',{point:{x:.73,y:.5}});
  const z=a.boardTemporalV453Dev69.find(v=>v.champ==='Draven'&&v.slot==='R');
  assert.ok(z&&!z.m44ReturnLeg);const mana=u.mana,cd=u.skillCds.R;
  const rec=cast('R');assert.equal(rec.recast,true);assert.equal(rec.spentMana,0);
  assert.equal(u.mana,mana);assert.equal(u.skillCds.R,cd);
  tick();assert.equal(z.m44ReturnLeg,true);
 });
 check('Renata',team,'Q2 shove damages and stuns second champion collision',({a,e,secondary,cast,tick})=>{
  Object.assign(secondary,{x:.534,y:.5,hp:10000,maxHp:10000});
  cast('Q',{point:{x:.56,y:.5}});tick();
  const hp=secondary.hp,x=e.x;
  const r=cast('Q',{point:{x:e.x+.01,y:e.y}});
  assert.equal(r.recast,true);assert.ok(e.x>x);
  assert.ok(secondary.hp<hp);assert.ok(a.effectResolverV41().has(secondary,'stun'));
 });
}
for(const error of failures)console.error('M44_B08_FAIL',JSON.stringify(error));
console.log('M44_B08_COHORT '+JSON.stringify({
 champions:Object.keys(M44_B08_KITS_V453),newSlots:10,
 refined:['Draven R recast','Renata Q2 secondary','Pyke Q charge/stab'],
 passed:pass,snapshots,failures:failures.length,certifiedKits:0}));
assert.equal(failures.length,0);assert.equal(pass,48);assert.equal(snapshots,48);
