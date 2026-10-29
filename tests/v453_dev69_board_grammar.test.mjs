/** Dev69 M9 — executable scalable board skills, no certification claim. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,BOARD_KITS_V453_DEV69,abilityRule,checksumV40} from '../engine.mjs';
const file=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=file('coachlol_map_v6.json'),mask=file('masks_128.json');
let count=0;const ok=(name,fn)=>{fn();count++;console.log('✓ BOARD '+name);};
// M9 baseline remains 30 complete P/QWER board descriptors; M15 special adapters are PARTIAL.
const champs=Object.keys(BOARD_KITS_V453_DEV69).filter(c=>!['Neeko','Shaco'].includes(c));
ok('30 champion descriptors and 120 different ability slots, all prototype',()=>{
 assert.equal(champs.length,30);
 for(const c of champs)for(const slot of ['Q','W','E','R']){
  const x=BOARD_KITS_V453_DEV69[c][slot];
  assert.equal(x.kind,'board_effect');assert.equal(x.implemented,'board_prototype');
  assert.ok(x.mana.length&&x.cooldown.length, c+slot);
 }
});
function fresh(c,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6999,mode:'pvp',draft:{[team]:{MID:c}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),foe=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ:c,x:.50,y:.50,mana:1000,maxMana:1000,hp:1400,maxHp:1400,
  level:6,skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(foe,{x:.53,y:.50,hp:2000,maxHp:2000,mr:0,armor:0});
 Object.assign(ally,{x:.52,y:.51,hp:500,maxHp:1000});
 a.visible=()=>true;return {a,u,foe,ally,team,other};
}
for(const team of ['blue','red']){
 const x=fresh('Annie',team);
 ok(team+' target spell cannot be queued by opposite seat',()=>{
  assert.equal(x.a.queueTargetedSkill(x.other,x.u.id,'Q',x.foe.id).ok,false);
  assert.equal(x.u.mana,1000);
 });
 ok(team+' targeted damage queued, paid only once by the executor',()=>{
  assert.equal(x.a.queueTargetedSkill(team,x.u.id,'Q',x.foe.id).ok,true);
  assert.equal(x.u.mana,1000);assert.equal(x.foe.hp,2000);
  x.a.resolveBoardSkillsV453Dev69();
  assert.ok(x.foe.hp<2000);assert.ok(x.u.mana<1000);
  const hp=x.foe.hp;x.a.resolveBoardSkillsV453Dev69();
  assert.equal(x.foe.hp,hp);
 });
 ok(team+' board snapshot/reconnect preserves resource and passive stack state',()=>{
  const snapshot=x.a.snapshotV40(),copy=Arena.fromSnapshotV40(map,mask,snapshot);
  assert.equal(checksumV40(snapshot),checksumV40(copy.snapshotV40()));
 });
 const h=fresh('Soraka',team);
 ok(team+' ally targeted heal and global ultimate cannot heal opponents',()=>{
  assert.equal(h.a.queueTargetedSkill(team,h.u.id,'W',h.foe.id).ok,false);
  assert.equal(h.a.queueTargetedSkill(team,h.u.id,'W',h.ally.id).ok,true);
  h.a.resolveBoardSkillsV453Dev69();assert.ok(h.ally.hp>500);
  const enemyHp=h.foe.hp;h.a.gameTime=1;
  assert.equal(h.a.queueKitSkillV42(team,h.u.id,'R',null).ok,true);
  h.a.resolveBoardSkillsV453Dev69();
  assert.equal(h.foe.hp,enemyHp);
 });
 const e=fresh('Ashe',team);
 ok(team+' line projectile resolves with deterministic geometric hit',()=>{
  assert.equal(e.a.queueDirectionalSkill(team,e.u.id,'R',{x:.9,y:.5}).ok,true);
  e.a.resolveBoardSkillsV453Dev69();
  assert.ok(e.foe.hp<2000);assert.ok(e.a.effectResolverV41().has(e.foe,'stun'));
 });
 const fog=fresh('Morgana',team);fog.a.visible=(seat,v)=>seat===v.team;
 ok(team+' no hidden target IDs accepted for enemy-target skills',()=>{
  assert.equal(fog.a.queueTargetedSkill(team,fog.u.id,'Q',fog.foe.id).ok,false);
  assert.equal(fog.a.queueDirectionalSkill(team,fog.u.id,'Q',{x:.9,y:.5}).ok,true);
 });
 const sh=fresh('Janna',team);
 ok(team+' reusable allied shield increases valid shield pool',()=>{
  assert.equal(sh.a.queueTargetedSkill(team,sh.u.id,'E',sh.ally.id).ok,true);
  sh.a.resolveBoardSkillsV453Dev69();
  assert.ok(sh.a.effectResolverV41().has(sh.ally,'shield'));
 });
 const cycle=fresh('Garen',team);cycle.u.hp=500;
 ok(team+' out of combat Garen passive heals only on simulation ticks',()=>{
  cycle.a.gameTime=9;cycle.a.advanceBoardPassivesV453Dev69();
  const hp=cycle.u.hp;assert.ok(hp>500);
  cycle.a.advanceBoardPassivesV453Dev69();assert.equal(cycle.u.hp,hp);
 });
}
ok('30 board champions can be drafted without falling back to training rules',()=>{
 for(const c of champs){const a=fresh(c,'blue');
  for(const slot of ['Q','W','E','R'])assert.equal(abilityRule(a.u,slot).kind,'board_effect');
 }
});

for(const team of ['blue','red']){
 const combo=fresh('Garen',team);
 combo.u.order={kind:'attack',targetId:combo.foe.id,combo:['W','Q'],comboIndex:0,comboNextAt:0};
 combo.a.visible=()=>false;
 ok(team+' Garen W self-shield combo works without revealing enemy',()=>{
  combo.a.resolveQueuedCombos();
  assert.equal(combo.u.order.comboIndex,1);
  assert.ok(combo.a.effectResolverV41().has(combo.u,'shield'));
 });
 combo.a.visible=()=>true;combo.a.gameTime=1;
 ok(team+' Garen Q combo uses the authored silence rather than training damage',()=>{
  combo.a.resolveQueuedCombos();
  assert.equal(combo.u.order.comboIndex,2);
  assert.ok(combo.a.effectResolverV41().has(combo.foe,'silence'));
 });
 const ashe=fresh('Ashe',team);
 ok(team+' Ashe basic hits apply Frost Shot slow to opposing units',()=>{
  ashe.a.damage(ashe.foe,40,ashe.u,'physical','basic');
  assert.ok(ashe.a.effectResolverV41().has(ashe.foe,'slow'));
 });
 const scout=fresh('Ashe',team);
 ok(team+' Ashe E scouting stays team-private, expires and survives checkpoint',()=>{
  assert.equal(scout.a.queueKitSkillV42(team,scout.u.id,'E',{x:.7,y:.5}).ok,true);
  scout.a.resolveBoardSkillsV453Dev69();
  assert.equal(scout.a.boardVisionV453Dev69.length,1);
  assert.ok(scout.a.visionSources(team).some(v=>v.kind==='board_scout'));
  assert.equal(scout.a.visionSources(scout.other).some(v=>v.kind==='board_scout'),false);
  const cp=Arena.fromSnapshotV40(map,mask,scout.a.snapshotV40());
  assert.equal(checksumV40(scout.a.snapshotV40()),checksumV40(cp.snapshotV40()));
  scout.a.gameTime=5;scout.a.advanceBoardPassivesV453Dev69();
  assert.equal(scout.a.visionSources(team).some(v=>v.kind==='board_scout'),false);
 });
 const magic=fresh('Morgana',team);
 ok(team+' Morgana E grants magic shield and a spell-blocking effect',()=>{
  assert.equal(magic.a.queueTargetedSkill(team,magic.u.id,'E',magic.ally.id).ok,true);
  magic.a.resolveBoardSkillsV453Dev69();
  assert.ok(magic.a.effectResolverV41().has(magic.ally,'magic_shield'));
  assert.ok(magic.a.effectResolverV41().has(magic.ally,'spell_shield'));
 });
}

console.log('DEV69 BOARD GRAMMAR '+count+'/'+count+' PASS');
