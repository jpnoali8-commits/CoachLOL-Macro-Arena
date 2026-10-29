/** M18 - four real clone families as server-owned targets.
 * Neeko W+disguise; Wukong W; LeBlanc Mirror Image passive; Shaco R.
 * Includes PvP public aliases, 2 seats, projection privacy and moving missiles.
 * NOT champion P+QWER parity certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../../multiplayer/authoritative_actions_v453_dev47.mjs';
const file=n=>JSON.parse(readFileSync(new URL('../../data/'+n,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
const seats=[
 {seatId:'B',unitId:'blue_MID',unitIds:['blue_TOP','blue_JG','blue_MID','blue_ADC','blue_SUP']},
 {seatId:'R',unitId:'red_MID',unitIds:['red_TOP','red_JG','red_MID','red_ADC','red_SUP']}
];
const kinds={Neeko:'neeko_clone',MonkeyKing:'wukong_clone',Leblanc:'leblanc_clone',Shaco:'shaco_clone'};
const teams=['blue','red'];let checks=0;
function ok(label,fn){fn();checks++;console.log('M18_PASS '+label);}
function make(team,champ,source='Annie'){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:69180,mode:'pvp',draft:{[team]:{MID:source},[other]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,
  autoFollow:false,autoFarm:false,autoJungle:false,combatUntil:0,deadUntil:0});
 const caster=a.units.find(v=>v.id===team+'_MID');
 const owner=a.units.find(v=>v.id===other+'_MID');
 Object.assign(caster,{champ:source,x:.5,y:.5,level:16,hp:1700,maxHp:1700,
  mana:10000,maxMana:10000,skillRanks:{Q:5,W:5,E:5,R:3},
  skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(owner,{champ,x:.528,y:.5,level:6,hp:1800,maxHp:1800,
  mana:1500,maxMana:1500,armor:0,mr:0,skillRanks:{Q:1,W:1,E:1,R:1},
  skillCds:{Q:0,W:0,E:0,R:0}});
 a.canSeePoint=()=>true;a.visible=(seat,v)=>v.team===seat||true;
 let disguise=null;
 if(champ==='Neeko'){
  const copy=a.units.find(v=>v.id===other+'_TOP');
  copy.champ='Jinx';
  const d=a.queueNeekoDisguiseV453M15(other,owner.id,copy.id);
  assert.equal(d.ok,true,d.reason);
  disguise=owner.neekoDisguiseV453M15?.publicId;
 }
 if(champ==='Leblanc'){
  const raw=a.damage(owner,1120,caster,'true','spell');
  assert.ok(raw>=1120,'LeBlanc low-health passive must trigger');
 }else{
  const skill=champ==='Shaco'?'R':'W';
  const place=champ==='MonkeyKing'?{x:.537,y:.5}:champ==='Neeko'?{x:.538,y:.5}:{x:.538,y:.5};
  const cast=a.queueKitSkillV42(other,owner.id,skill,place);
  assert.equal(cast.ok,true,champ+' '+skill+': '+cast.reason);
  a.resolveBoardSkillsV453Dev69();
 }
 const clone=a.boardSummonsV453Dev69.find(v=>v.ownerId===owner.id&&v.kind===kinds[champ]);
 assert.ok(clone,champ+' should have one real summon in server state');
 clone.x=.528;clone.y=.5; // normalized collision corridor; do not forge the entity itself
 // A Jhin R single-hit line must not depend on a tied collision depth when
 // champion and clone stand at the exact same position. Keep the owner behind.
 owner.x=.68;owner.y=.5;
 a.gameTime=1.25;
 assert.ok(clone.hp>0&&clone.stealthUntil<=a.gameTime&&clone.until>a.gameTime);
 const view=a.perspective(team);
 const visible=view.units.find(x=>x.id===clone.publicId);
 assert.ok(visible,'enemy sees the decoy as a public unit: '+champ);
 assert.equal(a.units.length,10,'exactly five real champions per seat');
 assert.ok(!view.boardSummons.some(v=>v.id===clone.id),'internal summon not exposed');
 assert.ok(!view.units.some(v=>v.id===clone.id),'internal summon ID never exposed');
 if(disguise){
  const real=view.units.find(x=>x.id===disguise);
  assert.ok(real&&real.champ==='Jinx','Neeko disguises as Jinx before W');
  assert.equal(visible.champ,'Jinx','Neeko W clone copies active appearance');
  assert.notEqual(disguise,clone.publicId);
  assert.ok(!view.units.some(x=>x.id===owner.id),'Neeko true ID stays private');
 }
 return {a,caster,owner,clone,team,other,seat:team==='blue'?'B':'R',disguise};
}
for(const team of teams)for(const champ of Object.keys(kinds)){
 ok(team+' '+champ+' enemy alias resolves and raw ID stays blocked',()=>{
  const t=make(team,champ);
  const gate=new AuthoritativeActionsV453Dev47(t.a,seats);
  const bad=gate.submit(t.seat,{sequence:1,unitId:t.caster.id,kind:'order.attack',
   payload:{targetId:t.clone.id}});
  assert.equal(bad.ok,false,'raw entity ID accepted for '+champ);
  assert.equal(bad.reason,'alvo_identidade_oculta','unexpected rejection reason '+bad.reason);
  const good=gate.submit(t.seat,{sequence:1,unitId:t.caster.id,kind:'order.attack',
   payload:{targetId:t.clone.publicId}});
  assert.equal(good.ok,true,good.reason);
  const receipt=gate.submit(t.seat,{sequence:1,unitId:t.caster.id,kind:'order.attack',
   payload:{targetId:t.clone.publicId}});
  assert.deepEqual(receipt,good,'same action idempotency');
 });
 ok(team+' '+champ+' targeted Annie Q consumes one resource and hits only decoy',()=>{
  const t=make(team,champ);
  const gate=new AuthoritativeActionsV453Dev47(t.a,seats);
  const hp=t.clone.hp,realHp=t.owner.hp,mana=t.caster.mana;
  const req={sequence:1,unitId:t.caster.id,kind:'skill.targeted',
   payload:{slot:'Q',targetId:t.clone.publicId}};
  const queued=gate.submit(t.seat,req);
  assert.equal(queued.ok,true,queued.reason);
  assert.equal(t.caster.mana,mana,'planning cannot commit cast mana');
  t.a.resolveBoardSkillsV453Dev69();
  assert.ok(t.clone.hp<hp,'clone ignored by targeted Q');
  assert.equal(t.owner.hp,realHp,'targeting a decoy must not hurt real owner');
  assert.ok(t.caster.mana<mana,'resource must be committed once');
  assert.ok(t.a.units.length===10);
  const after=t.clone.hp;t.a.resolveBoardSkillsV453Dev69();
  assert.equal(t.clone.hp,after,'no double effect');
  const snap=t.a.snapshotV40();
  const copy=Arena.fromSnapshotV40(map,mask,snap);
  assert.equal(checksumV40(copy.snapshotV40()),checksumV40(snap));
 });
 ok(team+' '+champ+' Lux Q flight hits decoy, no champion root or true-ID leak',()=>{
  const t=make(team,champ,'Lux');
  const start=t.clone.hp;
  const q=t.a.launchLuxBindingV453Dev68(t.caster,{x:.56,y:.5});
  assert.ok(q.ok,q.reason);
  const frozen=t.a.snapshotV40();
  const restored=Arena.fromSnapshotV40(map,mask,frozen);
  restored.canSeePoint=()=>true;restored.visible=()=>true;
  t.a.gameTime=restored.gameTime=2.4;
  t.a.advanceChampionProjectilesV453Dev42();
  restored.advanceChampionProjectilesV453Dev42();
  const other=restored.boardSummonsV453Dev69.find(v=>v.id===t.clone.id);
  assert.ok(other);
  assert.equal(other.hp,t.clone.hp,'projectile must replay identically');
  assert.ok(t.clone.hp<start,'projectile missed clone');
  assert.equal(t.a.effectResolverV41().has(t.clone,'root'),false);
  assert.ok(!t.a.perspective(team).units.some(v=>v.id===t.clone.id));
 });
 ok(team+' '+champ+' Jhin R projectile damage resolves on decoy without Slow/TrueSight',()=>{
  const t=make(team,champ,'Jhin');
  const initial=t.clone.hp;
  const q=t.a.queueKitSkillV42(team,t.caster.id,'R',null);
  assert.ok(q.ok,q.reason);t.a.resolveBoardSkillsV453Dev69();
  const mana=t.caster.mana;
  t.a.gameTime=2.4;
  const fired=t.a.queueKitSkillV42(team,t.caster.id,'R',{x:.56,y:.5});
  assert.ok(fired.ok,fired.reason);t.a.resolveBoardSkillsV453Dev69();
  assert.ok(t.clone.hp<initial,'Jhin projectile did not hit clone');
  assert.equal(t.caster.mana,mana,'recast should not consume mana');
  assert.equal(t.a.effectResolverV41().has(t.clone,'slow'),false);
  assert.equal(t.clone.m16TrueSightUntil?.[team],undefined);
 });
 ok(team+' '+champ+' expiration/stealth protects from targeting and no ghosts',()=>{
  const t=make(team,champ);
  const gate=new AuthoritativeActionsV453Dev47(t.a,seats);
  t.clone.stealthUntil=t.a.gameTime+2;
  const invisible=gate.submit(t.seat,{sequence:1,unitId:t.caster.id,kind:'skill.targeted',
   payload:{slot:'Q',targetId:t.clone.publicId}});
  assert.equal(invisible.ok,false);
  t.clone.stealthUntil=0;
  t.a.gameTime=t.clone.until+.01;
  const expired=gate.submit(t.seat,{sequence:1,unitId:t.caster.id,kind:'skill.targeted',
   payload:{slot:'Q',targetId:t.clone.publicId}});
  assert.equal(expired.ok,false);
  assert.ok(!t.a.perspective(team).units.some(v=>v.id===t.clone.publicId));
 });
}

for(const team of teams){
 ok(team+' Neeko clone fades after taking damage without exposing the owner',()=>{
  const t=make(team,'Neeko');
  const ownerAppearance=t.owner.neekoDisguiseV453M15?.publicId;
  const old=t.clone.hp;
  const hit=t.a.damage(t.clone,100,t.caster,'magic','spell');
  assert.ok(hit>0&&t.clone.hp<old);
  assert.equal(t.clone.damageFadeAt,t.a.gameTime+.5);
  assert.equal(t.owner.neekoDisguiseV453M15?.publicId,ownerAppearance);
  t.a.gameTime=t.clone.damageFadeAt-.1;
  t.a.advanceBoardSummonsV453Dev69();
  assert.ok(t.clone.hp>0,'Neeko W must not fade immediately before its timer');
  t.a.gameTime=t.clone.damageFadeAt+.01;
  t.a.advanceBoardSummonsV453Dev69();
  assert.ok(!t.a.boardSummonsV453Dev69.includes(t.clone),'Neeko W must disappear after fade timer');
  assert.ok(!t.a.perspective(team).units.some(u=>u.id===t.clone.publicId));
 });
 ok(team+' Neeko disguised apparent-lethal damage reveals only her real identity',()=>{
  const t=make(team,'Neeko');
  const before=t.owner.neekoDisguiseV453M15;
  assert.ok(before);
  const alias=before.publicId;
  const visualHp=before.visualHp;
  t.owner.maxHp=t.owner.hp=visualHp+500;
  const damage=t.a.damage(t.owner,visualHp+1,t.caster,'true','spell');
  assert.ok(damage>0&&t.owner.hp>0);
  assert.equal(t.owner.neekoDisguiseV453M15,null,'apparent lethal must break passive disguise');
  assert.ok(t.a.perspective(team).units.some(v=>v.id===t.owner.id));
  assert.ok(!t.a.perspective(team).units.some(v=>v.id===alias));
  assert.equal(t.a.m15ResolvePublicId(team,alias),null,'old disguised ID cannot select real Neeko');
 });
 ok(team+' MonkeyKing decoy basic strike damages a close real champion only once per tick',()=>{
  const t=make(team,'MonkeyKing');
  t.caster.x=t.clone.x+.006;t.caster.y=t.clone.y; // inside 175 units
  t.clone.nextAttackAt=2;
  const before=t.caster.hp;
  t.a.gameTime=2.1;
  t.a.advanceBoardSummonsV453Dev69();
  assert.ok(t.caster.hp<before,'Wukong clone was incorrectly inert');
  const hp=t.caster.hp;
  t.a.advanceBoardSummonsV453Dev69();
  assert.equal(t.caster.hp,hp,'Wukong clone double-attacked within same tick');
  assert.equal(t.a.units.length,10);
 });
 ok(team+' Leblanc passive creates one decoy under 60s cooldown and keeps its identity',()=>{
  const t=make(team,'Leblanc');
  const ready=t.owner.m16LeblancReadyAt;
  assert.equal(ready,60,'Mirror Image initial cooldown incorrect');
  assert.equal(t.a.boardSummonsV453Dev69.filter(s=>s.kind==='leblanc_clone').length,1);
  const oldAlias=t.owner.m16DecoyPublicAlias;
  const hit=t.a.damage(t.owner,30,t.caster,'true','spell');
  assert.ok(hit>0);
  assert.equal(t.owner.m16LeblancReadyAt,ready);
  assert.equal(t.owner.m16DecoyPublicAlias,oldAlias);
  assert.equal(t.a.boardSummonsV453Dev69.filter(s=>s.kind==='leblanc_clone').length,1);
 });
 ok(team+' Shaco clone lethal damage explodes once, spawns exactly three mini-boxes',()=>{
  const t=make(team,'Shaco');
  const dealt=t.a.damage(t.clone,99999,t.caster,'true','spell');
  assert.ok(dealt>0);
  assert.equal(t.clone.hp,0);
  assert.equal(t.clone.explodedV453M15,true);
  const initial=t.a.boardSummonsV453Dev69.filter(s=>s.kind==='shaco_minibox').length;
  assert.equal(initial,3);
  t.a.m15ExplodeShacoClone(t.clone);
  t.a.advanceBoardSummonsV453Dev69();
  assert.equal(t.a.boardSummonsV453Dev69.filter(s=>s.kind==='shaco_minibox').length,3);
  const snap=t.a.snapshotV40();
  assert.equal(checksumV40(snap),checksumV40(Arena.fromSnapshotV40(map,mask,snap).snapshotV40()));
 });
}

for(const team of teams)for(const champ of Object.keys(kinds)){
 for(const spec of [
  {caster:'Maokai',slot:'E',kind:'maokai_sapling',effect:'instant'},
  {caster:'Teemo',slot:'R',kind:'teemo_mushroom',effect:'dot'},
  {caster:'Jhin',slot:'E',kind:'jhin_lotus',effect:'delayed'}
 ]){
  ok(team+' '+champ+' '+spec.kind+' real cast respects decoy lifetime and effect type',()=>{
   const t=make(team,champ,spec.caster);
   const before=t.clone.hp;
   const queued=t.a.queueKitSkillV42(team,t.caster.id,spec.slot,
    {x:t.clone.x,y:t.clone.y});
   assert.ok(queued.ok,queued.reason);
   t.a.resolveBoardSkillsV453Dev69();
   const trap=t.a.m16Traps.find(v=>v.ownerId===t.caster.id&&v.kind===spec.kind);
   assert.ok(trap,'real authored ability did not create a server-owned trap');
   assert.equal(t.caster.mana<10000,true,'server must commit cast resource');
   t.a.gameTime=2.35;
   t.a.advanceMechanicsV453M16();
   assert.ok(trap.triggeredAt!==null,'visible clone did not trigger authored trap');
   if(spec.effect==='instant'){
    assert.ok(t.clone.hp<before,'Maokai explosion missed visible clone');
   }else if(spec.effect==='dot'){
    assert.ok(t.clone.statusEffectsV41?.some(e=>e.type==='dot'),
     'Teemo mushroom did not schedule clone DoT');
   }else{
    assert.ok(trap.explodeAt>t.a.gameTime);
    assert.equal(t.clone.hp,before,'Lotus E cannot damage immediately on trigger');
    t.a.gameTime=trap.explodeAt+.02;t.a.advanceMechanicsV453M16();
    if(t.clone.until>t.a.gameTime)
     assert.ok(t.clone.hp<before,'detonation missed living clone');
    else assert.equal(t.clone.hp,before,'expired decoy incorrectly hit by delayed explosion');
   }
   assert.equal(t.a.units.length,10);
  });
 }
}
console.log('M18_CLONES_SUMMARY '+checks+'/'+checks+' PASS');
