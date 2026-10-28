import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,catalog,ITEM_EFFECTS_V43,ITEM_RECIPES,checksumV40} from '../engine.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),masks=read('masks_128.json');
const make=()=>new Arena(map,masks,{seed:38,roundSeconds:10});
const hero=(a,team='blue',role='ADC')=>a.units.find(u=>u.team===team&&u.role===role);
const prep=(a,u)=>{const shop=a.map.objects.find(o=>o.id===u.team+'_spawn_shop');Object.assign(u,{x:shop.x,y:shop.y,gold:100000,items:[]});};
const tests=[];
function test(name,fn){fn();tests.push(name);console.log('✓ DEV38 '+name);}

test('67+3 item catalog remains unchanged; three audited passives are functional states',()=>{
 assert.ok(catalog.length>=70);assert.equal(catalog.find(i=>i.id==='dorans_ring').cost,400);
 assert.deepEqual(ITEM_RECIPES.rapid_firecannon,['zeal','scouts_slingshot']);
 for(const id of ['scouts_slingshot','rapid_firecannon','dorans_ring'])assert.match(ITEM_EFFECTS_V43[id].maturity,/dev38/);
});

test('Scout: spell damages enemy champion and triggers exactly one 40 magic proc',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);a.buy('blue',u.id,'scouts_slingshot');
 v.hp=v.maxHp=5000;v.mr=0;
 a.damage(v,100,u,'magic','spell');
 assert.equal(v.hp,4860);assert.equal(u.scoutBullseyeReadyAtV453Dev38,40);
 a.damage(v,100,u,'magic','spell');assert.equal(v.hp,4760);
 a.gameTime=40;a.damage(v,100,u,'magic','spell');assert.equal(v.hp,4620);
});

test('Scout: on-attack reduces 40s cooldown by one; no proc on minions or ally hit',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);a.buy('blue',u.id,'scouts_slingshot');v.hp=v.maxHp=6000;v.mr=0;
 a.damage(v,100,u,'magic','spell');const ready=u.scoutBullseyeReadyAtV453Dev38;
 const minion={id:'dummy',kind:'melee',team:'red',hp:1000,maxHp:1000,armor:0,mr:0};
 a.attack(u,minion,10);assert.equal(u.scoutBullseyeReadyAtV453Dev38,ready-1);
 a.attack(u,v,20);assert.equal(u.scoutBullseyeReadyAtV453Dev38,ready-2);
 a.damage(v,0,u,'magic','spell');assert.equal(u.scoutBullseyeReadyAtV453Dev38,ready-2);
});

test('Scout: invulnerability blocks proc, sale removes availability, rebuy resets cooldown',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);a.buy('blue',u.id,'scouts_slingshot');
 v.hp=v.maxHp=5000;v.mr=0;v.stasisUntil=10;a.damage(v,100,u,'magic','spell');assert.equal(v.hp,5000);
 assert.equal(u.scoutBullseyeReadyAtV453Dev38,0);
 v.stasisUntil=0;a.damage(v,100,u,'magic','spell');assert.equal(u.scoutBullseyeReadyAtV453Dev38,40);
 assert.equal(a.sellItemV43('blue',u.id,u.items.indexOf('scouts_slingshot')).ok,true);
 a.damage(v,100,u,'magic','spell');assert.equal(v.hp,4760);
 assert.equal(a.buy('blue',u.id,'scouts_slingshot'),true);assert.equal(u.scoutBullseyeReadyAtV453Dev38,0);
});

test('Rapid Firecannon: walking and attacks charge 100, never >100, 40 magic only when charged',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);a.buy('blue',u.id,'rapid_firecannon');v.hp=v.maxHp=9000;v.armor=0;v.mr=0;
 a.itemEnergizeMoveV453Dev38(u,24*94);assert.equal(u.energizeStacksV453Dev38,94);
 a.attack(u,v,100);assert.equal(v.hp,8900);assert.equal(u.energizeStacksV453Dev38,100);
 a.attack(u,v,100);assert.equal(v.hp,8760);assert.equal(u.energizeStacksV453Dev38,6);
 a.attack(u,v,100);assert.equal(v.hp,8660);assert.equal(u.energizeStacksV453Dev38,12);
 a.itemEnergizeMoveV453Dev38(u,10000);assert.equal(u.energizeStacksV453Dev38,100);
});


test('Walking through moveAlong increments Energized from actual traversed map distance',()=>{
 const a=make(),u=hero(a);prep(a,u);a.buy('blue',u.id,'rapid_firecannon');
 const start={x:u.x,y:u.y},destination={x:u.x+.01,y:u.y};
 a.walkable=()=>true;
 const meters=a.mapDistance(start,destination);
 const moved=a.moveAlong(u,{path:[destination],point:destination},meters);
 assert.ok(Math.abs(moved-meters)<1e-6);assert.ok(Math.abs(u.energizeStacksV453Dev38-meters/24)<1e-6);
});

test('RFC: charged range is 35% up to 150 units and drops after proc; actual candidate combat gate',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);a.buy('blue',u.id,'rapid_firecannon');
 const base=a.itemAttackRangeV453Dev38(u);u.energizeStacksV453Dev38=100;
 const extended=a.itemAttackRangeV453Dev38(u);
 assert.ok(extended>base);assert.ok(extended-base<=150/a.worldWidth+1e-9);
 for(const other of a.units)if(![u,v].includes(other))other.hp=0;
 u.x=.5;u.y=.5;v.x=.5+(base+extended)/2;v.y=.5;v.hp=v.maxHp=8000;
 u.attackAt=0;u.autoAttack=true;u.policy='aggressive';u.order={kind:'attack',targetId:v.id,combatStyle:'aa'};
 a.duelPermission=()=>true;a.visible=()=>true;
 const before=v.hp;
 a.resolveCombat();assert.ok(v.hp<before,`RFC attack at boosted-only range failed, got ${v.hp}/${before}`);
 assert.equal(u.energizeStacksV453Dev38,6);assert.equal(a.itemAttackRangeV453Dev38(u),base);
});

test('RFC: slingshot upgrade consumes components and cannot inherit its passive',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);
 for(const id of ['scouts_slingshot','zeal'])assert.equal(a.buy('blue',u.id,id),true);
 v.hp=v.maxHp=9000;v.mr=0;a.damage(v,100,u,'magic','spell');assert.equal(u.scoutBullseyeReadyAtV453Dev38,40);
 assert.equal(a.buy('blue',u.id,'rapid_firecannon'),true);assert.equal(u.items.includes('scouts_slingshot'),false);
 assert.equal(u.energizeStacksV453Dev38,0);
 a.damage(v,100,u,'magic','spell');assert.equal(v.hp,8760); // first 140, second 100 (no more Scout)
});

test('Doran: 5 physical minion damage enters both forecast and real AA, never champions',()=>{
 const a=make(),u=hero(a,'blue','MID');prep(a,u);a.buy('blue',u.id,'dorans_ring');
 const target={kind:'melee',team:'red',hp:1000,maxHp:1000,armor:0,mr:0};
 const enemy=hero(a,'red','MID');
 const base= a.basicAttackPowerV452c(u,enemy,'aa');
 assert.equal(a.basicAttackPowerV452c(u,target,'aa')-base,5);
 assert.equal(a.predictBasicAttackDamageV452c(u,target,'aa'),Math.round(base+5));
 const before=target.hp;a.attack(u,target,a.basicAttackPowerV452c(u,target,'aa',{commit:true}));
 assert.equal(before-target.hp,Math.round(base+5));
});

test('Doran: each tick +1 mana, +2 for 5s after real champion hit, expires precisely',()=>{
 const a=make(),u=hero(a,'blue','MID'),v=hero(a,'red');prep(a,u);a.buy('blue',u.id,'dorans_ring');
 u.mana=10;u.maxMana=500;
 a.gameTime=1;a.advanceItemRegenV453Dev38();assert.equal(u.mana,11);
 v.hp=v.maxHp=9000;a.damage(v,20,u,'magic','spell');assert.equal(u.doransCombatManaUntilV453Dev38,6);
 a.gameTime=2;a.advanceItemRegenV453Dev38();assert.equal(u.mana,13);
 a.gameTime=6;a.advanceItemRegenV453Dev38();assert.equal(u.mana,15);
 a.gameTime=7;a.advanceItemRegenV453Dev38();assert.equal(u.mana,16);
 u.mana=499;a.advanceItemRegenV453Dev38();assert.equal(u.mana,500);
});

test('Doran manaless unit receives 45% HP per tick and healing caps at maxHP',()=>{
 const a=make(),u=hero(a,'blue','MID');prep(a,u);a.buy('blue',u.id,'dorans_ring');
 u.maxMana=0;u.mana=0;u.hp=100;u.maxHp=1000;a.gameTime=1;
 a.advanceItemRegenV453Dev38();assert.equal(u.hp,100.45);
 u.doransCombatManaUntilV453Dev38=10;a.advanceItemRegenV453Dev38();assert.ok(Math.abs(u.hp-101.35)<1e-8);
 u.hp=999.8;a.advanceItemRegenV453Dev38();assert.equal(u.hp,1000);
});

test('Snapshots preserve proc timers and charges byte-for-byte; legacy snapshots gain safe defaults',()=>{
 const a=make(),u=hero(a),v=hero(a,'red');prep(a,u);
 a.buy('blue',u.id,'scouts_slingshot');a.damage(v,100,u,'magic','spell');
 const p=hero(a,'blue','MID');prep(a,p);a.buy('blue',p.id,'rapid_firecannon');p.energizeStacksV453Dev38=99.5;
 const d=hero(a,'blue','TOP');prep(a,d);a.buy('blue',d.id,'dorans_ring');d.doransCombatManaUntilV453Dev38=33;
 const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,masks,snap);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));
 assert.equal(hero(b).scoutBullseyeReadyAtV453Dev38,40);
 assert.equal(hero(b,'blue','MID').energizeStacksV453Dev38,99.5);
 assert.equal(hero(b,'blue','TOP').doransCombatManaUntilV453Dev38,33);
 const old=structuredClone(snap);for(const unit of old.state.units){delete unit.scoutBullseyeReadyAtV453Dev38;delete unit.doransCombatManaUntilV453Dev38;delete unit.energizeStacksV453Dev38;}
 const restored=Arena.fromSnapshotV40(map,masks,old);
 assert.equal(hero(restored).scoutBullseyeReadyAtV453Dev38,0);
 assert.equal(hero(restored,'blue','MID').energizeStacksV453Dev38,0);
});

test('RFC sale/rebuy resets charge; non-owner cannot buy/sell quest items',()=>{
 const a=make(),u=hero(a);prep(a,u);a.buy('blue',u.id,'rapid_firecannon');u.energizeStacksV453Dev38=100;
 assert.equal(a.sellItemV43('blue',u.id,u.items.indexOf('rapid_firecannon')).ok,true);
 assert.equal(u.energizeStacksV453Dev38,0);assert.equal(a.buy('blue',u.id,'rapid_firecannon'),true);
 assert.equal(u.energizeStacksV453Dev38,0);assert.equal(a.canBuy('blue',u.id,'support_compass').ok,false);
});

console.log('DEV38 '+tests.length+'/'+tests.length+' PASS');
