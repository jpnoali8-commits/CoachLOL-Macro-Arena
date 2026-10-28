/** Dev69 M7 — unified seven-champion gate.
 * Ezreal and Irelia P/Q/W/E/R in the SAME large package with five prior kits.
 * Status: functional tests, NOT independent certification or permission to merge.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40,kitSpellV42,CHAMPION_KITS_V42,championLevelStatsV453Dev69M1} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json');
let n=0;function test(label,fn){fn();n++;console.log('✓ M7 '+label);}
function setup(champ,team){
 const enemyTeam=team==='blue'?'red':'blue';
 const a=new Arena(map,mask,{seed:6977,draft:{[team]:{MID:champ}},roundSeconds:10});
 for(const u of a.units)Object.assign(u,{x:.08,y:.08,autoAttack:false,autoFollow:false,autoJungle:false,autoFarm:false});
 const u=a.units.find(v=>v.id===team+'_MID'),v=a.units.find(v=>v.id===enemyTeam+'_MID'),
  ally=a.units.find(v=>v.id===team+'_TOP');
 Object.assign(u,{x:.5,y:.5,champ,mana:500,maxMana:500,hp:1000,maxHp:1000,
   skillRanks:{Q:1,W:1,E:1,R:1},skillCds:{Q:0,W:0,E:0,R:0},ap:0});
 Object.assign(v,{x:.532,y:.5,hp:2000,maxHp:2000,mr:0,armor:0});
 Object.assign(ally,{x:.57,y:.54});
 a.visible=()=>true;
 return {a,u,v,ally,team,enemyTeam};
}
const roster=['Nami','Vex','Lux','Ahri','Jinx','Ezreal','Irelia'];
test('single large seven-champion package has every individual P/Q/W/E/R rule',()=>{
 for(const champ of roster){
  assert.ok(CHAMPION_KITS_V42[champ],champ+' registry');
  assert.ok(CHAMPION_KITS_V42[champ].passive?.id,champ+' P');
  for(const slot of ['Q','W','E','R']){
   const skill=kitSpellV42(champ,slot);
   assert.ok(skill&&skill.kind&&skill.mana?.length&&skill.cooldown?.length,champ+slot);
   assert.notEqual(skill.kind,'training',champ+slot);
  }
  assert.ok(championLevelStatsV453Dev69M1(champ,18)?.hp>championLevelStatsV453Dev69M1(champ,1)?.hp,champ+' stats');
  assert.equal(CHAMPION_KITS_V42[champ].certification,'partial','no false full-certification');
 }
});
for(const team of ['blue','red']){
 const e=setup('Ezreal',team);
 test(team+' Ezreal W is real directional input restricted to owner',()=>{
  assert.equal(e.a.queueDirectionalSkill(e.enemyTeam,e.u.id,'W',{x:.8,y:.5}).ok,false);
  assert.equal(e.a.queueDirectionalSkill(team,e.u.id,'W',{x:.8,y:.5}).ok,true);
  assert.equal(e.u.mana,500);
 });
 e.a.resolveDirectionalSkills();
 test(team+' Ezreal W pays 50 mana once, travels before marking',()=>{
  assert.equal(e.u.mana,450);assert.equal(e.v.ezrealFluxV453Dev69M7??null,null);
  assert.equal(e.a.championProjectilesV453Dev42[0]?.kind,'ezreal_w');
 });
 e.a.gameTime=.45;e.a.advanceChampionProjectilesV453Dev42();
 test(team+' Ezreal W tags only the first valid champion, and activates passive',()=>{
  assert.equal(e.v.ezrealFluxV453Dev69M7?.ownerId,e.u.id);
  assert.ok(e.u.ezrealRisingForceV453Dev69M7.stacks>=1);
  assert.ok(e.a.basicAttackIntervalV452c(e.u)>0);
 });
 const checkpoint=Arena.fromSnapshotV40(map,mask,e.a.snapshotV40());
 test(team+' Ezreal W mark and passive survive checksum replay',()=>assert.equal(checksumV40(e.a.snapshotV40()),checksumV40(checkpoint.snapshotV40())));
 const hpBefore=e.v.hp;
 const shifted=e.a.castEzrealArcaneShiftV453Dev69M7(e.u,{x:.51,y:.5});
 test(team+' Ezreal E blinks and detonates marked enemy exactly once with refund',()=>{
  assert.equal(shifted.ok,true);assert.ok(e.u.x>.5);
  assert.ok(e.v.hp<hpBefore);
  assert.equal(e.v.ezrealFluxV453Dev69M7,null);
  assert.ok(e.u.mana>360);
  const prior=e.v.hp;e.a.ezrealConsumeFluxV453Dev69M7(e.u,e.v,{spell:true});
  assert.equal(e.v.hp,prior);
 });
 const invalid=setup('Ezreal',team);
 const before=invalid.u.mana;
 test(team+' Ezreal E zero-point is denied before spending mana',()=>{
  const denied=invalid.a.castEzrealArcaneShiftV453Dev69M7(invalid.u,{x:.5,y:.5});
  assert.equal(denied.ok,false);assert.equal(invalid.u.mana,before);
 });
 const r=setup('Ezreal',team);
 const cast=r.a.castEzrealBarrageV453Dev69M7(r.u,{x:.9,y:.5});
 test(team+' Ezreal R costs mana once and has real 1 sec channel',()=>{
  assert.equal(cast.ok,true);assert.equal(r.u.mana,400);
  assert.equal(r.v.hp,2000);assert.equal(r.a.ezrealBarrageWindsV453Dev69M7.length,1);
 });
 r.a.gameTime=.9;r.a.advanceEzrealBarrageV453Dev69M7();
 test(team+' Ezreal R cannot hit during windup',()=>assert.equal(r.v.hp,2000));
 const clone=Arena.fromSnapshotV40(map,mask,r.a.snapshotV40());
 r.a.gameTime=clone.gameTime=1;r.a.advanceEzrealBarrageV453Dev69M7();clone.advanceEzrealBarrageV453Dev69M7();
 test(team+' Ezreal R produces matching temporally launched missiles after reconnect',()=>{
  assert.equal(r.a.championProjectilesV453Dev42[0]?.kind,'ezreal_r');
  assert.equal(checksumV40(r.a.snapshotV40()),checksumV40(clone.snapshotV40()));
 });
 r.a.gameTime=clone.gameTime=1.4;r.a.advanceChampionProjectilesV453Dev42();clone.advanceChampionProjectilesV453Dev42();
 test(team+' Ezreal R travels through enemy minions with unique hit ledger',()=>{
  assert.ok(r.v.hp<2000);
  assert.equal(r.v.hp,clone.units.find(v=>v.id===r.v.id).hp);
  assert.equal(r.a.championProjectilesV453Dev42[0].hitIds.filter(id=>id===r.v.id).length,1);
 });
 const i=setup('Irelia',team);
 test(team+' Irelia W/R unauthorized team cannot queue skills',()=>{
  assert.equal(i.a.queueDirectionalSkill(i.enemyTeam,i.u.id,'W',{x:.6,y:.5}).ok,false);
  assert.equal(i.a.queueDirectionalSkill(i.enemyTeam,i.u.id,'R',{x:.6,y:.5}).ok,false);
 });
 const w=i.a.castIreliaDanceV453Dev69M7(i.u,{x:.6,y:.5});
 test(team+' Irelia W starts channeled stance with single mana charge',()=>{
  assert.ok(w.ok);assert.equal(i.u.mana,430);
  assert.equal(i.u.ireliaDanceV453Dev69M7.releaseAt,i.a.gameTime+1.5);
 });
 const stanceOrigin={x:i.u.x,y:i.u.y};
 const moveTo={x:i.u.x+.012,y:i.u.y};
 const attempted=i.a.moveAlong(i.u,{path:[moveTo],point:moveTo},200);
 test(team+' Irelia W real channel blocks path movement before release',()=>{
  assert.equal(attempted,0);
  assert.deepEqual({x:i.u.x,y:i.u.y},stanceOrigin);
 });
 i.u.autoAttack=true;i.u.policy='aggressive';
 i.v.x=i.u.x+.005;i.v.y=i.u.y;
 const untouched=i.v.hp;
 i.a.resolveCombat();
 test(team+' Irelia W prevents automatic basic attack during charge',()=>assert.equal(i.v.hp,untouched));
 const hp=i.u.hp;
 i.a.damage(i.u,100,i.v,'physical','spell');
 test(team+' Irelia W mitigates actual incoming physical damage while charging',()=>assert.ok(i.u.hp>hp-100));
 i.a.gameTime=1.6;i.a.advanceIreliaDanceV453Dev69M7();
 test(team+' Irelia W charged slash resolves physical damage in direction',()=>{
  assert.ok(i.v.hp<2000);
  assert.equal(i.u.ireliaDanceV453Dev69M7.released,true);
 });
 const j=setup('Irelia',team);
 assert.equal(j.a.castIreliaVanguardV453Dev69M7(j.u,{x:.6,y:.5}).ok,true);
 test(team+' Irelia R is authored projectile with one mana cost',()=>{
  assert.equal(j.u.mana,400);assert.equal(j.v.hp,2000);
  assert.equal(j.a.championProjectilesV453Dev42[0]?.kind,'irelia_r');
 });
 j.a.gameTime=.5;j.a.advanceChampionProjectilesV453Dev42();
 test(team+' Irelia R applies owned Unsteady mark and builds wall',()=>{
  assert.ok(j.v.hp<2000);assert.equal(j.v.ireliaMarkV453Dev42?.ownerId,j.u.id);
  assert.ok(j.u.ireliaFervorV453Dev69M7?.stacks>=1);
  assert.ok(j.a.ireliaVanguardWallsV453Dev69M7.length>0);
 });
 const saved=Arena.fromSnapshotV40(map,mask,j.a.snapshotV40());
 test(team+' Irelia R wall/mark/passive are checkpoint-deterministic',()=>{
  assert.equal(checksumV40(j.a.snapshotV40()),checksumV40(saved.snapshotV40()));
 });
}
const combined=new Arena(map,mask,{seed:6978,roundSeconds:10,draft:{
 blue:{TOP:'Irelia',JG:'Ezreal',MID:'Ahri',ADC:'Jinx',SUP:'Lux'},
 red:{TOP:'Vex',MID:'Nami'}}});
test('PvP match loads seven distinct champions together, one seat controls five',()=>{
 const blue=combined.units.filter(v=>v.team==='blue').map(x=>x.champ);
 const red=combined.units.filter(v=>v.team==='red').map(x=>x.champ);
 for(const c of ['Irelia','Ezreal','Ahri','Jinx','Lux'])assert.ok(blue.includes(c),c);
 for(const c of ['Vex','Nami'])assert.ok(red.includes(c),c);
 assert.equal(combined.units.filter(v=>v.team==='blue').length,5);
 assert.equal(combined.units.filter(v=>v.team==='red').length,5);
});
test('seven-roster PvP saves/reloads without state drift',()=>{
 const snap=combined.snapshotV40(),copy=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(copy.snapshotV40()));
});
// Mixed roster integration QA (no separate PR, no item mutations, same server match).
for(const u of combined.units){
 Object.assign(u,{x:.06,y:.06,autoAttack:false,autoFollow:false,autoFarm:false,autoJungle:false});
}
const by=(team,role)=>combined.units.find(v=>v.team===team&&v.role===role);
const ez=by('blue','JG'),irelia=by('blue','TOP'),jinx=by('blue','ADC'),ahri=by('blue','MID'),
 lux=by('blue','SUP'),nami=by('red','MID'),vex=by('red','TOP');
for(const u of [ez,irelia,jinx,ahri,lux,nami,vex]){
 u.mana=500;u.maxMana=500;u.skillRanks={Q:1,W:1,E:1,R:1};
 u.skillCds={Q:0,W:0,E:0,R:0};
 u.hp=1500;u.maxHp=1500;u.mr=0;u.armor=0;
}
Object.assign(ez,{x:.5,y:.5});Object.assign(irelia,{x:.5,y:.52});
Object.assign(jinx,{x:.5,y:.54});Object.assign(ahri,{x:.5,y:.56});
Object.assign(lux,{x:.5,y:.58});
Object.assign(nami,{x:.535,y:.5});Object.assign(vex,{x:.535,y:.52});
combined.visible=()=>true;
test('seven-roster mixed PvP prohibits blue seat from ordering red Nami E',()=>{
 const illegal=combined.queueTargetedSkill('blue',nami.id,'E',vex.id);
 assert.equal(illegal.ok,false);
 assert.equal(nami.mana,500);
});
test('mixed PvP red Nami buffs red Vex; Ezreal cannot steal ally buff',()=>{
 assert.equal(combined.queueTargetedSkill('red',nami.id,'E',vex.id).ok,true);
 combined.resolveTargetedCasts();
 assert.equal(nami.mana,445);
 assert.equal(vex.namiTidecallerV453Dev69M1.charges,3);
 assert.equal(ez.namiTidecallerV453Dev69M1??null,null);
});
const ahriBefore=ahri.hp;
combined.attack(vex,ahri,55);
test('mixed PvP Nami E empowers Vex basic, deals damage against Ahri once',()=>{
 assert.ok(ahri.hp<ahriBefore-55);
 assert.equal(vex.namiTidecallerV453Dev69M1.charges,2);
});
test('mixed PvP Ezreal W marks Nami without damage and without consuming other-team resources',()=>{
 assert.equal(combined.castEzrealEssenceFluxV453Dev69M7(ez,{x:.65,y:.5}).ok,true);
 assert.equal(nami.hp,1500);assert.equal(nami.mana,445);
});
combined.gameTime=.45;combined.advanceChampionProjectilesV453Dev42();
test('mixed PvP Ezreal W mark belongs only to Ezreal',()=>{
 assert.equal(nami.ezrealFluxV453Dev69M7?.ownerId,ez.id);
});
assert.equal(combined.castIreliaVanguardV453Dev69M7(irelia,{x:.65,y:.52}).ok,true);
combined.gameTime=.85;combined.advanceChampionProjectilesV453Dev42();
test('mixed PvP Irelia R marks Vex but cannot detonate Ezreal W on Nami',()=>{
 assert.equal(vex.ireliaMarkV453Dev42?.ownerId,irelia.id);
 assert.equal(nami.ezrealFluxV453Dev69M7?.ownerId,ez.id);
});
const beforeFlux=nami.hp;
assert.equal(combined.castEzrealArcaneShiftV453Dev69M7(ez,{x:.510,y:.5}).ok,true);
test('mixed PvP Ezreal E detonates own W after Irelia R, with no enemy cross-control',()=>{
 assert.ok(nami.hp<beforeFlux);
 assert.equal(nami.ezrealFluxV453Dev69M7,null);
 assert.equal(vex.namiTidecallerV453Dev69M1.charges,2);
});
const preNamiVex=ahri.hp,preCharges=vex.namiTidecallerV453Dev69M1.charges;
combined.damage(ahri,90,vex,'magic','spell');
test('same-match Nami E empowers allied Vex spell without touching enemy mana',()=>{
 assert.ok(ahri.hp<preNamiVex-90);
 assert.equal(vex.namiTidecallerV453Dev69M1.charges,preCharges-1);
 assert.equal(nami.mana,445);
});
combined.damage(ahri,40,vex,'magic','spell');
test('Nami E does not consume multiple charges from one same-instant area spell',()=>{
 assert.equal(vex.namiTidecallerV453Dev69M1.charges,preCharges-1);
});
const beforeNext=ahri.hp;
combined.gameTime+=1;
combined.damage(ahri,40,vex,'magic','spell');
test('next temporal spell consumes final Nami E charge and clears serializable buff',()=>{
 assert.ok(ahri.hp<beforeNext-40);
 assert.equal(vex.namiTidecallerV453Dev69M1,null);
});
const mixedCopy=Arena.fromSnapshotV40(map,mask,combined.snapshotV40());
test('mixed seven-champion interaction state round-trips in a single PvP checkpoint',()=>{
 assert.equal(checksumV40(combined.snapshotV40()),checksumV40(mixedCopy.snapshotV40()));
 assert.equal(mixedCopy.units.find(v=>v.id===vex.id).namiTidecallerV453Dev69M1,null);
});
console.log('DEV69 MULTI CHAMPIONS M7 '+n+'/'+n+' PASS');
