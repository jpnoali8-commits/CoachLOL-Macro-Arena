import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,OBJECTIVE_BUFF_RULES_V452,BARON_CHAMPION_RULES_V452D4_DEV14,baronChampionBonusAtV452d4Dev14} from '../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const make=()=>new Arena(map,mask,{seed:45214,roundSeconds:10,mode:'bot'});
let total=0;
function test(name,fn){fn();total++;console.log('✓ DEV14 '+name);}
const eq=(a,b,reason='')=>assert.ok(Math.abs(a-b)<1e-7,reason+` (${a} != ${b})`);

test('Mão do Barão: 12–48 AD e 20–80 AP por minuto de captura, extremos limitados',()=>{
 assert.equal(BARON_CHAMPION_RULES_V452D4_DEV14.minMinutes,20);
 assert.deepEqual(baronChampionBonusAtV452d4Dev14(15*60),{ad:12,ap:20});
 assert.deepEqual(baronChampionBonusAtV452d4Dev14(20*60),{ad:12,ap:20});
 assert.deepEqual(baronChampionBonusAtV452d4Dev14(40*60),{ad:48,ap:80});
 assert.deepEqual(baronChampionBonusAtV452d4Dev14(60*60),{ad:48,ap:80});
 const mid=baronChampionBonusAtV452d4Dev14(30*60);
 assert.ok(mid.ad>25&&mid.ad<27,JSON.stringify(mid));
 assert.ok(mid.ap>42&&mid.ap<45,JSON.stringify(mid));
});

test('Barão: campeão recebe stats efetivos sem mutação ou multiplicador antigo no AA',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP'),enemy=a.units.find(x=>x.id==='red_TOP');
 a.gameTime=30*60;
 const base={ad:u.ad,ap:u.ap,aa:a.basicAttackPowerV452c(u,enemy,'auto'),elemental:a.elementalStatsV452d3(u)};
 const result=a.grantBaronV452d4Dev14('blue');assert.equal(result.ok,true);
 const buff=a.baronChampionBonusV452d4Dev14(u),effective=a.elementalStatsV452d3(u);
 eq(effective.ad,base.elemental.ad+buff.ad);eq(effective.ap,base.elemental.ap+buff.ap);
 eq(a.basicAttackPowerV452c(u,enemy,'auto'),base.aa+buff.ad);
 eq(u.ad,base.ad);eq(u.ap,base.ap);
 assert.equal(result.holders.length,5);
 assert.equal(a.baronChampionBonusV452d4Dev14(enemy),null);
});

test('Barão: escala fixada na morte do objetivo, mesmo que a partida avance',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP');a.gameTime=25*60;
 a.grantBaronV452d4Dev14('blue');const prior=a.baronChampionBonusV452d4Dev14(u);
 a.gameTime+=120;assert.deepEqual(a.baronChampionBonusV452d4Dev14(u),prior);
 assert.equal(a.teams.blue.baronUntil,25*60+180);
 a.gameTime=25*60+180;assert.equal(a.baronChampionBonusV452d4Dev14(u),null);
});

test('Barão: mortos na captura não recebem; morte não transfere buff nem renascimento',()=>{
 const a=make(),dead=a.units.find(x=>x.id==='blue_MID'),holder=a.units.find(x=>x.id==='blue_TOP');
 a.gameTime=24*60;dead.hp=0;a.grantBaronV452d4Dev14('blue');
 assert.equal(a.baronChampionBonusV452d4Dev14(dead),null);
 dead.hp=dead.maxHp;assert.equal(a.baronChampionBonusV452d4Dev14(dead),null);
 holder.hp=0;holder.baronBuffUntilV452=0;holder.baronCapturedAtV452d4Dev14=null;
 holder.hp=holder.maxHp;assert.equal(a.baronChampionBonusV452d4Dev14(holder),null);
 const red=a.units.find(x=>x.id==='red_TOP');assert.equal(a.baronChampionBonusV452d4Dev14(red),null);
});

test('Barão + Infernal: um único cálculo sobre atributos efetivos, sem acumular stacks',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP');
 a.gameTime=20*60;a.teams.blue.dragons.push('infernal','infernal');
 const before=a.elementalStatsV452d3(u);
 a.grantBaronV452d4Dev14('blue');const after=a.elementalStatsV452d3(u),bonus=a.baronChampionBonusV452d4Dev14(u);
 eq(after.ad-before.ad,bonus.ad*1.06);eq(after.ap-before.ap,bonus.ap*1.06);
 eq(a.elementalStatsV452d3(u).ad,after.ad);
});

test('Barão: snapshot conserva tempo de captura, aura individual e stats sem duplicar',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP');
 a.gameTime=35*60;a.grantBaronV452d4Dev14('blue');
 const ad=a.elementalStatsV452d3(u).ad,buff=a.baronChampionBonusV452d4Dev14(u);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40()),restored=b.units.find(x=>x.id===u.id);
 eq(b.elementalStatsV452d3(restored).ad,ad);
 assert.deepEqual(b.baronChampionBonusV452d4Dev14(restored),buff);
 assert.equal(b.baronMinionAuraV452({team:'blue',kind:'melee',x:restored.x,y:restored.y}),true);
});

test('Ancião dura 180s para vivos; não reaparece em mortos na conquista',()=>{
 const a=make(),dead=a.units.find(x=>x.id==='blue_SUP'),holder=a.units.find(x=>x.id==='blue_TOP');
 a.gameTime=35*60;dead.hp=0;const r=a.grantElderV452d4Dev14('blue');
 assert.equal(OBJECTIVE_BUFF_RULES_V452.elderSeconds,180);
 assert.equal(r.until,35*60+180);assert.equal(r.holders.length,4);
 assert.equal(a.hasElderV452(holder),true);
 dead.hp=dead.maxHp;assert.equal(a.hasElderV452(dead),false);
 a.gameTime=r.until-1;assert.equal(a.hasElderV452(holder),true);
 a.gameTime=r.until;assert.equal(a.hasElderV452(holder),false);
});

test('Ancião: execução abaixo de 20% após o tick, preserva cura e escudos',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP'),t=a.units.find(x=>x.id==='red_TOP');
 a.gameTime=35*60;a.grantElderV452d4Dev14('blue');
 t.hp=t.maxHp*.205;t.shield=0;
 a.damage(t,Math.max(3,t.maxHp*.02),u,'true','spell');
 assert.ok(t.elderPendingV452,'marcação do Ancião');
 const first=t.hp;t.hp=Math.round(t.maxHp*.34);
 a.gameTime++;a.resolveElderPendingV452();eq(t.hp,Math.round(t.maxHp*.34));
 assert.equal(t.elderPendingV452,null);
 t.hp=t.maxHp*.205;
 a.damage(t,Math.max(3,t.maxHp*.02),u,'true','spell');assert.ok(t.elderPendingV452);
 a.gameTime++;a.resolveElderPendingV452();assert.equal(t.hp,0);
 assert.equal(t.deaths,1);
});

test('Ancião: snapshot preserva janela de execução antes de vencer',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP'),t=a.units.find(x=>x.id==='red_TOP');
 a.gameTime=33*60;a.grantElderV452d4Dev14('blue');
 t.hp=t.maxHp*.205;a.damage(t,t.maxHp*.02,u,'true','spell');
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 const original=b.units.find(x=>x.id===t.id);
 assert.ok(original.elderPendingV452);
 b.gameTime++;b.resolveElderPendingV452();assert.equal(original.hp,0);
});

test('Captura real pelo motor: Barão concede AD/AP sem premiar mortos duas vezes',()=>{
 const a=make();a.gameTime=1200;a.phase='executing';
 const camp=a.camps.find(c=>c.timerKey==='baron'),u=a.units.find(x=>x.id==='blue_JG');
 const dead=a.units.find(x=>x.id==='blue_MID');dead.hp=0;u.awaitingShop=false;
 u.x=camp.x;u.y=camp.y;u.ad=100000;u.order={kind:'objective',targetId:camp.id};
 a.updateObjectives();assert.equal(camp.alive,false);
 assert.equal(a.objectiveLedgerV44.filter(e=>e.objective==='baron').length,1);
 assert.equal(a.teams.blue.baronUntil,1380);
 assert.equal(u.baronCapturedAtV452d4Dev14,1200);
 assert.equal(a.baronChampionBonusV452d4Dev14(dead),null);
 a.updateObjectives();assert.equal(a.objectiveLedgerV44.filter(e=>e.objective==='baron').length,1);
});

test('Captura real pelo motor: Ancião concede 180s aos vivos, sem stack elemental',()=>{
 const a=make();a.gameTime=2100;a.phase='executing';a.teams.blue.soulAt=1740;
 const camp=a.camps.find(c=>c.timerKey==='dragon'),u=a.units.find(x=>x.id==='blue_JG');
 const dead=a.units.find(x=>x.id==='blue_MID');dead.hp=0;u.awaitingShop=false;
 const before=a.teams.blue.dragons.length;
 u.x=camp.x;u.y=camp.y;u.ad=100000;u.order={kind:'objective',targetId:camp.id};
 a.updateObjectives();assert.equal(camp.dragonKind,'elder');assert.equal(camp.alive,false);
 assert.equal(a.objectiveLedgerV44.filter(e=>e.objective==='dragon').length,1);
 assert.equal(a.teams.blue.elderUntil,2280);assert.equal(u.elderBuffUntilV452,2280);
 assert.equal(a.hasElderV452(dead),false);assert.equal(a.teams.blue.dragons.length,before);
 a.updateObjectives();assert.equal(a.objectiveLedgerV44.filter(e=>e.objective==='dragon').length,1);
});
console.log(`V4.5.2d-4-dev14: ${total}/11 PASS`);
