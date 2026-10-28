import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const r=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const make=()=>new Arena(r('coachlol_map_v6.json'),r('masks_128.json'),{seed:4516,roundSeconds:10,mode:'bot'});
let passed=0;
function test(name,fn){fn();passed++;console.log('✓ DEV16 BARON '+name);}

test('cerco: canhão com aura tem dano efetivo maior contra torres sem alterar dano-base',()=>{
 const a=make(),holder=a.units.find(u=>u.id==='blue_TOP');a.gameTime=1200;
 const tower={type:'tower',hp:2500,maxHp:2500,armor:0};
 const m={kind:'siege',team:'blue',x:holder.x,y:holder.y,damage:80,range:.03,hp:500,maxHp:500};
 const base=a.baronMinionAttackDamageV452d(m,tower);
 a.grantBaronV452d4Dev14('blue');
 const mods=a.baronMinionModifiersV452d(m);
 const empowered=a.baronMinionAttackDamageV452d(m,tower);
 assert.equal(mods.empowered,true);assert.equal(mods.bonusRange,750);assert.equal(mods.buildingMultiplier,2);
 assert.ok(empowered>base*2);assert.equal(m.damage,80);assert.equal(m.maxHp,500);
});

test('aura funciona somente próxima de campeão vivo com Barão e desaparece no prazo',()=>{
 const a=make(),holder=a.units.find(u=>u.id==='blue_TOP');a.gameTime=1200;a.grantBaronV452d4Dev14('blue');
 for(const ally of a.units)if(ally.team==='blue'&&ally.id!==holder.id)ally.baronBuffUntilV452=0;
 const m={kind:'melee',team:'blue',x:holder.x,y:holder.y,hp:240,maxHp:240};
 assert.equal(a.baronMinionModifiersV452d(m).empowered,true);
 holder.hp=0;assert.equal(a.baronMinionModifiersV452d(m).empowered,false);
 holder.hp=holder.maxHp;assert.equal(a.baronMinionModifiersV452d(m).empowered,true);
 a.gameTime=1380;assert.equal(a.baronMinionModifiersV452d(m).empowered,false);
});

test('aura não duplica com snapshots e só é renderizável por estado atual',()=>{
 const a=make(),holder=a.units.find(u=>u.id==='blue_TOP');a.gameTime=1200;a.grantBaronV452d4Dev14('blue');
 const m={kind:'caster',team:'blue',x:holder.x,y:holder.y,damage:70,hp:210,maxHp:210};
 const snap=a.snapshotV40();const copy=Arena.fromSnapshotV40(a.map,a.mask,snap);
 const newHolder=copy.units.find(u=>u.id===holder.id);
 const copied={...m,x:newHolder.x,y:newHolder.y};
 assert.deepEqual(copy.baronMinionModifiersV452d(copied),a.baronMinionModifiersV452d(m));
 assert.equal(copy.baronMinionModifiersV452d(copied).bonusAD,20);
 assert.equal(copied.damage,70);
});
console.log(`DEV16 Baron siege ${passed}/${passed} PASS`);
