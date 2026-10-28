/** Dev69 M10 — board grammar 30 champs / 120 QWER slots.
 * Tests certify ONLY the described board prototypes, not official full kits.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,BOARD_KITS_V453_DEV69,checksumV40} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const roster=Object.keys(BOARD_KITS_V453_DEV69);
let total=0;
const check=(msg,run)=>{run();total++;console.log('✓ M10 '+msg)};
function fresh(champ,team){
 const other=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{mode:'pvp',seed:6910,draft:{[team]:{MID:champ}}});
 for(const v of a.units)Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,
  autoFarm:false,autoJungle:false});
 const u=a.units.find(v=>v.id===team+'_MID'),enemy=a.units.find(v=>v.id===other+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{champ,x:.5,y:.5,level:6,mana:1000,maxMana:1000,hp:1400,maxHp:1400,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x:.53,y:.5,hp:2000,maxHp:2000,armor:0,mr:0});
 Object.assign(ally,{x:.52,y:.51,hp:600,maxHp:1000});
 a.visible=()=>true;
 return {a,u,enemy,ally,team,other};
}
check('30 distinct champions, 120 described QWER slots',()=>{
 assert.equal(roster.length,30);
 for(const c of roster){
  const row=BOARD_KITS_V453_DEV69[c];
  for(const slot of ['Q','W','E','R']){
   assert.equal(row[slot]?.implemented,'board_prototype',c+slot);
   assert.ok(Array.isArray(row[slot].mana)&&row[slot].mana.length,c+slot+' mana');
   assert.ok(Array.isArray(row[slot].cooldown)&&row[slot].cooldown.length,c+slot+' cd');
  }
 }
});
for(const team of ['blue','red']){
 for(const champ of roster)for(const slot of ['Q','W','E','R']){
  const {a,u,enemy,ally,other}=fresh(champ,team),s=BOARD_KITS_V453_DEV69[champ][slot],
   before=u.mana;
  const route=()=>{
   if(s.shape==='target_enemy'){
    enemy.x=u.x+Math.min(200,s.range*.7)/a.worldWidth;enemy.y=u.y;
    return a.queueTargetedSkill(team,u.id,slot,enemy.id);
   }
   if(s.shape==='target_ally')return a.queueTargetedSkill(team,u.id,slot,ally.id);
   if(['line_enemy','cone_enemy'].includes(s.shape))
    return a.queueDirectionalSkill(team,u.id,slot,{x:.59,y:.5});
   if(['vision_point','move_point'].includes(s.shape))
    return a.queueKitSkillV42(team,u.id,slot,{x:.515,y:.5});
   if(s.shape==='circle_enemy'&&!s.originSelf)
    return a.queueKitSkillV42(team,u.id,slot,{x:enemy.x,y:enemy.y});
   return a.queueKitSkillV42(team,u.id,slot,null);
  };
  if(s.passiveOnly){
   check(team+' '+champ+' '+slot+' passive-only never spends mana',()=>{
    const result=route();assert.equal(result.ok,false);
    assert.equal(u.mana,before);
   });
   continue;
  }
  check(team+' '+champ+' '+slot+' queue/resolve one cost, no duplicate',()=>{
   const result=route();assert.equal(result.ok,true,champ+slot+' '+result.reason);
   assert.equal(u.mana,before,'queue does not spend mana');
   const duplicate=route();assert.equal(duplicate.ok,false,'no second pending order');
   a.resolveBoardSkillsV453Dev69();
   const cost=s.mana[0];assert.equal(u.mana,before-cost,'skill pays exactly once');
   const rest=u.mana;a.resolveBoardSkillsV453Dev69();assert.equal(u.mana,rest);
   const cp=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
   assert.equal(checksumV40(a.snapshotV40()),checksumV40(cp.snapshotV40()));
  });
 }
}
for(const team of ['blue','red']){
 const b=fresh('Blitzcrank',team);
 check(team+' Blitz Q pulls along the legal path rather than teleporting',()=>{
  const before=b.enemy.x;
  assert.equal(b.a.queueDirectionalSkill(team,b.u.id,'Q',{x:.6,y:.5}).ok,true);
  b.a.resolveBoardSkillsV453Dev69();
  assert.ok(b.enemy.x<before,'hook target moves toward Blitz');
  assert.ok(b.a.walkable(b.enemy.x,b.enemy.y));
 });
 const j=fresh('Jax',team);
 check(team+' Jax Q leaps toward target after valid hit',()=>{
  const before=j.u.x;
  assert.equal(j.a.queueTargetedSkill(team,j.u.id,'Q',j.enemy.id).ok,true);
  j.a.resolveBoardSkillsV453Dev69();
  assert.ok(j.u.x>before);
  assert.ok(j.a.walkable(j.u.x,j.u.y));
 });
 const m=fresh('Rammus',team);
 check(team+' Rammus Q moves onto a legal board cell',()=>{
  assert.equal(m.a.queueKitSkillV42(team,m.u.id,'Q',{x:.515,y:.5}).ok,true);
  m.a.resolveBoardSkillsV453Dev69();
  assert.equal(m.u.x,.515);
 });
 const n=fresh('Nasus',team);
 check(team+' Nasus Q prepares attack, consumes once and adds a persistent kill stack',()=>{
  assert.equal(n.a.queueKitSkillV42(team,n.u.id,'Q',null).ok,true);
  n.a.resolveBoardSkillsV453Dev69();
  assert.equal(n.u.boardNextBasicV453Dev69.charges,1);
  n.enemy.hp=60;
  n.a.damage(n.enemy,15,n.u,'physical','basic');
  assert.equal(n.u.boardNextBasicV453Dev69,null);
  assert.equal(n.u.boardSiphonStacksV453Dev69,3);
  const c=Arena.fromSnapshotV40(map,mask,n.a.snapshotV40());
  assert.equal(c.units.find(v=>v.id===n.u.id).boardSiphonStacksV453Dev69,3);
 });
 const v=fresh('Vayne',team);
 check(team+' Vayne W passive cannot be cast and 3 AAs trigger Silver Bolts',()=>{
  assert.equal(v.a.queueKitSkillV42(team,v.u.id,'W',null).ok,false);
  v.a.damage(v.enemy,50,v.u,'physical','basic');
  v.a.damage(v.enemy,50,v.u,'physical','basic');
  assert.equal(v.enemy.boardSilverBoltsV453Dev69.stacks,2);
  const hp=v.enemy.hp;
  v.a.damage(v.enemy,50,v.u,'physical','basic');
  assert.ok(v.enemy.hp<hp-50,'third auto deals bonus maxHP true damage');
  assert.equal(v.enemy.boardSilverBoltsV453Dev69,null);
 });
 const t=fresh('Taric',team);
 check(team+' Taric R grants allied invulnerability but never enemy immunity',()=>{
  assert.equal(t.a.queueKitSkillV42(team,t.u.id,'R',null).ok,true);
  t.a.resolveBoardSkillsV453Dev69();
  assert.equal(t.a.effectResolverV41().has(t.ally,'invulnerable'),false,'Taric R has mandatory cast delay');
  t.a.gameTime=3;t.a.advanceBoardTemporalV453Dev69();
  assert.ok(t.a.effectResolverV41().has(t.ally,'invulnerable'));
  assert.equal(t.a.effectResolverV41().has(t.enemy,'invulnerable'),false);
 });
 const o=fresh('Olaf',team);
 check(team+' Olaf R grants real temporary CC immunity',()=>{
  assert.equal(o.a.queueKitSkillV42(team,o.u.id,'R',null).ok,true);
  o.a.resolveBoardSkillsV453Dev69();
  assert.ok(o.a.effectResolverV41().has(o.u,'cc_immunity'));
  assert.equal(o.a.applyEffectV41(o.u,'stun',{source:o.enemy,duration:2}).ok,false);
 });
 const c=fresh('Chogath',team);
 check(team+' ChoGath R kills and increases champion maxHP once',()=>{
  c.enemy.hp=200;c.enemy.x=c.u.x+130/c.a.worldWidth;c.enemy.y=c.u.y;
  const before=c.u.maxHp;
  assert.equal(c.a.queueTargetedSkill(team,c.u.id,'R',c.enemy.id).ok,true);
  c.a.resolveBoardSkillsV453Dev69();
  assert.equal(c.u.maxHp,before+80);
  assert.equal(c.u.boardFeastStacksV453Dev69,1);
  c.a.resolveBoardSkillsV453Dev69();
  assert.equal(c.u.maxHp,before+80);
 });
 const ow=fresh('Blitzcrank',team);
 check(team+' enemy seat cannot queue target Q for enemy-owned champion',()=>{
  assert.equal(ow.a.queueDirectionalSkill(ow.other,ow.u.id,'Q',{x:.6,y:.5}).ok,false);
  assert.equal(ow.u.mana,1000);
 });
}

for(const team of ['blue','red']){
 const blocked=fresh('Rammus',team);
 blocked.u.order={kind:'attack',targetId:blocked.enemy.id,
  combo:['Q'],comboIndex:0,comboNextAt:0};
 const start={x:blocked.u.x,y:blocked.u.y},mana=blocked.u.mana;
 blocked.a.visible=(seat,v)=>v.team===seat;
 check(team+' hidden target cannot drive board-movement combo coordinates',()=>{
  blocked.a.resolveQueuedCombos();
  assert.equal(blocked.u.order.comboIndex,0);
  assert.equal(blocked.u.mana,mana);
  assert.deepEqual({x:blocked.u.x,y:blocked.u.y},start);
 });
 const vayne=fresh('Vayne',team);
 vayne.u.skillRanks.W=0;
 check(team+' unlearned Vayne W has no Silver Bolts trigger',()=>{
  vayne.a.damage(vayne.enemy,25,vayne.u,'physical','basic');
  vayne.a.damage(vayne.enemy,25,vayne.u,'physical','basic');
  vayne.a.damage(vayne.enemy,25,vayne.u,'physical','basic');
  assert.equal(vayne.enemy.boardSilverBoltsV453Dev69??null,null);
 });
}

console.log('DEV69 M10 '+total+'/'+total+' PASS');
