#!/usr/bin/env node
/** M45 B02 Skills S12 — frozen authored projectile characterization.
 * Original gameplay engine SHA: 41679f7328a42e379fdfb8de5b92006e1bfb529f
 * Frozen source commit: f0b1147ac46e585a1d5374a178b1ea462f5dc278
 * This is a LEGACY V8/Node source oracle, NOT Rust correctness or live PvP/ACL.
 * Vision is mocked to true and time is stepped explicitly; no server authority.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,abilityRule} from '../../../../engine.mjs';
const load=name=>JSON.parse(readFileSync(new URL('../../../../data/'+name,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
const slotOf=champ=>champ==='Ahri'?'E':'R';
const hitTick=champ=>champ==='Ahri'?2:3;
const damageOf=champ=>champ==='Ahri'?80:200;
const effectOf=champ=>champ==='Ahri'?'charm':'stun';
function fixture(champ,team,opt={}){
 const enemyTeam=team==='blue'?'red':'blue';
 const x=opt.x??(champ==='Ahri'?.54:.58);
 const a=new Arena(map,mask,{seed:6918,mode:'pvp',
  draft:{[team]:{MID:champ}}});
 for(const v of a.units)
  Object.assign(v,{x:.08,y:.08,autoAttack:false,autoFollow:false,
   autoFarm:false,autoJungle:false});
 const owner=a.units.find(v=>v.id===team+'_MID');
 const enemy=a.units.find(v=>v.id===enemyTeam+'_MID');
 Object.assign(owner,{champ,x:.5,y:.5,level:6,mana:1000,maxMana:1000,
  skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0}});
 Object.assign(enemy,{x,y:.5,hp:1500,maxHp:1500,mr:0,armor:0});
 a.visible=()=>true;
 if(opt.spellShield)
  assert.equal(a.applyEffectV41(enemy,'spell_shield',{source:enemy,duration:8}).ok,true);
 if(opt.minion)
  a.minions.push({id:'s12_melee_'+enemyTeam,team:enemyTeam,
   kind:'melee',lane:'mid',x:.52,y:.5,hp:900,maxHp:900,
   armor:0,mr:0,spawnAt:0});
 if(opt.barrier)
  a.projectileBarriersV453Dev43.push({id:'s12_barrier',
   team:enemyTeam,x:.53,y:.5,radius:70,until:5});
 return {a,owner,enemy,team,enemyTeam};
}
const effects=(a,v)=>a.effectResolverV41().list(v);
const has=(a,v,type)=>effects(a,v).some(e=>e.type===type);
const projectiles=(a,champ)=>a.boardTemporalV453Dev69.filter(z=>
 z.kind==='m44_authored_projectile'&&z.champ===champ&&z.slot===slotOf(champ));
const simulate=(a,from=1,to=4)=>{
 for(let t=from;t<=to;t++){a.gameTime=t;a.advanceBoardTemporalV453Dev69();}
};
function launch(s,champ){
 const slot=slotOf(champ);
 assert.equal(s.a.queueBoardSkillV453Dev69(s.team,s.owner.id,slot,
  {point:{x:.9,y:.5}}).ok,true);
 s.a.resolveBoardSkillsV453Dev69();
 assert.equal(s.owner.mana,champ==='Ahri'?940:900);
 assert.equal(s.enemy.hp,1500,'casting never damages immediately');
 assert.equal(has(s.a,s.enemy,effectOf(champ)),false,
  'casting never applies instant authored CC');
 assert.equal(projectiles(s.a,champ).length,1);
 assert.equal(projectiles(s.a,champ)[0].speed,550);
}
let cases=0,restored=0;
for(const team of ['blue','red']){
 for(const champ of ['Ahri','Ashe']){
  // Default legacy Ahri input path is known-broken. Direct authored board route is real.
  const baseline=fixture(champ,team);
  if(champ==='Ahri'){
   assert.equal(abilityRule(baseline.owner,'E')?.kind,'board_effect');
   assert.equal(baseline.a.queueKitSkillV42(team,baseline.owner.id,'E',
    {x:.9,y:.5}).ok,false,'obsolete Ahri adapter is a known bug, NOT Rust desired behavior');
   assert.equal(baseline.owner.mana,1000);
  }
  launch(baseline,champ);
  for(let t=1;t<=4;t++){
   baseline.a.gameTime=t;baseline.a.advanceBoardTemporalV453Dev69();
   if(t<hitTick(champ)){
    assert.equal(baseline.enemy.hp,1500,'projectile cannot strike before impact');
    assert.equal(has(baseline.a,baseline.enemy,effectOf(champ)),false);
   }else{
    assert.equal(baseline.enemy.hp,1500-damageOf(champ),'exactly one impact');
    if(t===hitTick(champ))
     assert.equal(has(baseline.a,baseline.enemy,effectOf(champ)),true);
   }
  }
  assert.equal(projectiles(baseline.a,champ).length,0);
  assert.equal(baseline.owner.mana,champ==='Ahri'?940:900);
  cases++;
  const shielded=fixture(champ,team,{spellShield:true});
  launch(shielded,champ);assert.equal(has(shielded.a,shielded.enemy,'spell_shield'),true);
  simulate(shielded.a);
  assert.equal(shielded.enemy.hp,1500,'spell shield blocks primary damage');
  assert.equal(has(shielded.a,shielded.enemy,effectOf(champ)),false);
  assert.equal(has(shielded.a,shielded.enemy,'spell_shield'),false,'spell shield consumed');
  cases++;
  const minion=fixture(champ,team,{minion:true});
  launch(minion,champ);simulate(minion.a);
  const actualMinion=minion.a.minions.find(v=>v.id==='s12_melee_'+minion.enemyTeam);
  assert.ok(actualMinion);
  assert.equal(actualMinion.hp,champ==='Ahri'?820:900);
  assert.equal(minion.enemy.hp,champ==='Ahri'?1500:1300,
   'Ahri stops on first minion, Ashe R ignores minion');
  cases++;
  const blocked=fixture(champ,team,{barrier:true});
  launch(blocked,champ);simulate(blocked.a);
  assert.equal(blocked.enemy.hp,1500);
  assert.equal(has(blocked.a,blocked.enemy,effectOf(champ)),false);
  assert.equal(projectiles(blocked.a,champ).length,0);
  assert.ok(blocked.a.m44B21ProjectileInterceptHistory?.some(v=>
   v.barrierId==='s12_barrier'));
  cases++;
  const wall=fixture(champ,team,{x:.65});
  assert.equal(wall.a.obstacleLine(wall.owner,wall.enemy),true);
  launch(wall,champ);simulate(wall.a);
  assert.equal(wall.enemy.hp,1500);
  assert.equal(has(wall.a,wall.enemy,effectOf(champ)),false);
  assert.equal(projectiles(wall.a,champ).length,0);
  cases++;
  if(champ==='Ahri'){
   const tooFar=fixture(champ,team,{x:.58});
   assert.ok(tooFar.a.mapDistance(tooFar.owner,tooFar.enemy)>975);
   assert.equal(tooFar.a.obstacleLine(tooFar.owner,tooFar.enemy),false);
   launch(tooFar,champ);simulate(tooFar.a);
   assert.equal(tooFar.enemy.hp,1500);
   assert.equal(has(tooFar.a,tooFar.enemy,'charm'),false);
   cases++;
  }else{
   for(const splashShield of [false,true]){
    const splash=fixture('Ashe',team);
    const secondary=splash.a.units.find(v=>v.id===splash.enemyTeam+'_TOP');
    Object.assign(secondary,{x:.585,y:.508,hp:1500,maxHp:1500,mr:0,armor:0});
    if(splashShield)
     assert.equal(splash.a.applyEffectV41(secondary,'spell_shield',
      {source:secondary,duration:8}).ok,true);
    assert.equal(splash.a.obstacleLine(splash.enemy,secondary),false);
    launch(splash,'Ashe');simulate(splash.a,1,3);
    assert.equal(splash.enemy.hp,1300,'first champion receives primary impact');
    assert.equal(secondary.hp,splashShield?1500:1430,
     'Ashe separate AoE impact: 35% damage on unshielded nearby champion');
    assert.equal(has(splash.a,secondary,'slow'),!splashShield);
    if(splashShield)assert.equal(has(splash.a,secondary,'spell_shield'),false);
    cases++;
   }
  }
  // Restore in-flight snapshot and prove deterministic continuation on two seats.
  for(const shield of [false,true]){
   const original=fixture(champ,team,{spellShield:shield});
   launch(original,champ);
   simulate(original.a,1,1);
   assert.equal(projectiles(original.a,champ).length,1,'flight persists at tick 1');
   const snap=original.a.snapshotV40();
   const clone=Arena.fromSnapshotV40(map,mask,snap);
   clone.visible=()=>true; // original fixture's visibility stub is deliberately nonserialized
   assert.equal(checksumV40(snap),checksumV40(clone.snapshotV40()),'exact restored snapshot');
   for(let t=2;t<=4;t++){
    original.a.gameTime=clone.gameTime=t;
    original.a.advanceBoardTemporalV453Dev69();
    clone.advanceBoardTemporalV453Dev69();
    assert.equal(checksumV40(original.a.snapshotV40()),checksumV40(clone.snapshotV40()),
     'identical causal state after continuation tick '+t);
    const x=original.a.units.find(v=>v.id===original.enemy.id);
    const y=clone.units.find(v=>v.id===original.enemy.id);
    assert.equal(x.hp,y.hp);
    assert.equal(has(original.a,x,effectOf(champ)),has(clone,y,effectOf(champ)));
   }
   const final=original.a.units.find(v=>v.id===original.enemy.id);
   assert.equal(final.hp,shield?1500:1500-damageOf(champ));
   restored++;cases++;
  }
 }
}
assert.equal(cases,34);
assert.equal(restored,8);
console.log('M45_S12_PROJECTILE_FIDELITY seats=2 cases='+cases+
 ' midflight_restore='+restored+' PASS (LEGACY V8/Node source oracle, not Rust/WASM/HTTP)');
