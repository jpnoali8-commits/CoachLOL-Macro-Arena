import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json');
const draft={blue:{TOP:'Volibear',JG:'Fiddlesticks',MID:'Ahri',ADC:'Kalista',SUP:'Nami'},
 red:{TOP:'Darius',JG:'LeeSin',MID:'Vex',ADC:'Caitlyn',SUP:'Leona'}};
const make=()=>new Arena(map,mask,{draft,seed:6921,mode:'pvp'});
const hero=(a,t,r)=>a.units.find(u=>u.team===t&&u.role===r);
function near(u,point){Object.assign(u,{x:point.x,y:point.y});}
const p={x:.17,y:.82};
function test(name,fn){fn();console.log('PASS DEV69 conditional: '+name);}

test('Fiddlesticks starts with 2 effigy charges in exclusive trinket slot; swaps blocked',()=>{
 const a=make(),f=hero(a,'blue','JG'),ordinary=hero(a,'blue','TOP');
 assert.equal(f.trinket,'effigy');assert.equal(f.wardCharges,2);assert.equal(f.items.length,0);
 assert.equal(a.setTrinket('blue',f.id,'oracle').ok,false);
 assert.equal(a.addWard('blue',ordinary.id,{x:ordinary.x,y:ordinary.y},'effigy').ok,false);
});
test('duration 130-300, one hp, no global decoy cap, no ordinary stealth ownership',()=>{
 const a=make(),u=hero(a,'blue','JG');near(u,p);u.level=1;
 const w1=a.addWard('blue',u.id,p,'stealth');assert.equal(w1.ok,true);
 assert.equal(w1.ward.type,'effigy');assert.equal(w1.ward.hp,1);assert.equal(w1.ward.until,130);
 assert.equal(u.wardCharges,1);
 for(let i=0;i<4;i++){u.wardCharges=2;assert.equal(a.addWard('blue',u.id,{x:p.x+i*.001,y:p.y},'effigy').ok,true);}
 assert.equal(a.wards.filter(w=>w.type==='effigy').length,5);
 assert.equal(a.wardVisionSuppressedV452d4Dev26(w1.ward),false);
 u.level=18;u.wardCharges=2;const w18=a.addWard('blue',u.id,p,'effigy').ward;assert.equal(w18.until,300);
});
test('charge recovery 115 seconds at level 1 and 30 seconds at level 18, cap 2',()=>{
 const a=make(),f=hero(a,'blue','JG');near(f,p);
 a.addWard('blue',f.id,p);assert.equal(f.wardCharges,1);
 a.gameTime=114;a.restoreVisionCharges();assert.equal(f.wardCharges,1);
 a.gameTime=115;a.restoreVisionCharges();assert.equal(f.wardCharges,2);
 f.level=18;f.wardCharges=2;f.trinketNextChargeAt=a.gameTime;
 a.addWard('blue',f.id,p);assert.equal(f.trinketNextChargeAt,145);
 a.gameTime=144;a.restoreVisionCharges();assert.equal(f.wardCharges,1);
 a.gameTime=145;a.restoreVisionCharges();assert.equal(f.wardCharges,2);
});
test('spending second effigy charge never shifts the first recharge timer',()=>{
 const a=make(),f=hero(a,'blue','JG');near(f,p);
 assert.equal(a.addWard('blue',f.id,p,'effigy').ok,true);
 assert.equal(f.trinketNextChargeAt,115);
 a.gameTime=20;
 assert.equal(a.addWard('blue',f.id,p,'effigy').ok,true);
 assert.equal(f.wardCharges,0);
 assert.equal(f.trinketNextChargeAt,115);
 a.gameTime=115;a.restoreVisionCharges();assert.equal(f.wardCharges,1);
 assert.equal(f.trinketNextChargeAt,230);
 a.gameTime=230;a.restoreVisionCharges();assert.equal(f.wardCharges,2);
});
test('visible enemy activates decoy exactly once; 2s self-destruct, no fog reveal',()=>{
 const a=make(),f=hero(a,'blue','JG'),enemy=hero(a,'red','JG');near(f,p);near(enemy,p);
 const w=a.addWard('blue',f.id,p).ward;
 a.gameTime=1;a.advanceConditionalItemsV453Dev69C();
 assert.equal(w.triggeredByV453Dev69C,enemy.id);
 const first=a.events.filter(x=>x.type==='effigy_danger').length;
 a.advanceConditionalItemsV453Dev69C();assert.equal(a.events.filter(x=>x.type==='effigy_danger').length,first);
 a.gameTime=2;a.advanceConditionalItemsV453Dev69C();assert.equal(w.hp,1);
 a.gameTime=3;a.advanceConditionalItemsV453Dev69C();assert.equal(w.hp,0);
 assert.equal(a.wardActive(w),false);
});
test('level 6 effigy provides 6s sweeper that reveals stealth wards but not control',()=>{
 const a=make(),f=hero(a,'blue','JG');f.level=6;near(f,p);
 const enemyWard={id:'test_enemy_ward',owner:'red_SUP',team:'red',type:'stealth',x:p.x,y:p.y,hp:3,createdAt:0,until:100,disabledUntil:0};
 a.wards.push(enemyWard);
 assert.equal(a.addWard('blue',f.id,p,'effigy').ok,true);
 assert.equal(a.oracleDetectsWardV452d4Dev28('blue',enemyWard),true);
 a.gameTime=6;a.advanceConditionalItemsV453Dev69C();
 assert.equal(a.oracleDetectsWardV452d4Dev28('blue',enemyWard),false);
});
test('Kalista exclusive spear binds one allied champion, reacquires free before 3 min',()=>{
 const a=make(),kal=hero(a,'blue','ADC'),first=hero(a,'blue','SUP'),second=hero(a,'blue','MID');
 assert.equal(kal.blackSpearAvailableV453Dev69C,true);
 assert.equal(a.bindBlackSpearV453Dev69C('red',kal.id,first.id).ok,false);
 assert.equal(a.bindBlackSpearV453Dev69C('blue',kal.id,hero(a,'red','SUP').id).ok,false);
 assert.equal(a.bindBlackSpearV453Dev69C('blue',kal.id,first.id).ok,true);
 assert.equal(a.bindBlackSpearV453Dev69C('blue',kal.id,second.id).ok,false);
 a.gameTime=7;a.advanceConditionalItemsV453Dev69C();
 assert.equal(kal.oathswornIdV453Dev69C,first.id);assert.equal(first.oathswornByV453Dev69C,kal.id);
 assert.equal(a.recoverBlackSpearV453Dev69C('blue',kal.id).ok,true);
 assert.equal(a.bindBlackSpearV453Dev69C('blue',kal.id,second.id).ok,true);
 a.gameTime=14;a.advanceConditionalItemsV453Dev69C();
 assert.equal(kal.oathswornIdV453Dev69C,second.id);assert.equal(first.oathswornByV453Dev69C,null);
 assert.equal(second.oathswornByV453Dev69C,kal.id);
 a.gameTime=180;assert.equal(a.recoverBlackSpearV453Dev69C('blue',kal.id).ok,false);
});
test('conditional state snapshots restore active decoys and pending oath without free progress',()=>{
 const a=make(),f=hero(a,'blue','JG'),kal=hero(a,'blue','ADC');near(f,p);
 a.addWard('blue',f.id,p);a.bindBlackSpearV453Dev69C('blue',kal.id,'blue_SUP');
 const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));
 assert.equal(hero(b,'blue','JG').trinket,'effigy');
 assert.equal(b.wards[0].type,'effigy');
 b.gameTime=7;b.advanceConditionalItemsV453Dev69C();
 assert.equal(hero(b,'blue','ADC').oathswornIdV453Dev69C,'blue_SUP');
});
console.log('DEV69 CONDITIONAL EXCLUSIVES 8/8 PASS');
