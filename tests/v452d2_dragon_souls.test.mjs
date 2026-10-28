import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,SOUL_RULES_V452D2} from '../engine.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const make=()=>new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:45222,roundSeconds:10,mode:'bot'});
const test=(name,fn)=>{fn();console.log('✓ V4.5.2d-2 '+name);};
const setup=soul=>{const a=make(),att=a.units.find(x=>x.id==='blue_TOP'),vict=a.units.find(x=>x.id==='red_TOP');a.gameTime=1200;a.teams.blue.soulAt=1000;a.teams.blue.soulTypeV452=soul;att.hp=att.maxHp;vict.hp=vict.maxHp;vict.x=att.x+.002;vict.y=att.y;return {a,att,vict};};

test('Infernal: impacto em área, ICD 3 segundos e nenhum proc recursivo',()=>{
 const {a,att,vict}=setup('infernal'),other=a.units.find(x=>x.id==='red_MID');other.x=vict.x+.001;other.y=vict.y;other.hp=other.maxHp;
 const p=vict.hp,o=other.hp;a.damage(vict,5,att,'true','basic');
 assert.ok(vict.hp<p-80&&other.hp<o-80,'dano efetivo em dois inimigos');
 const hp=other.hp;a.damage(vict,5,att,'true','basic');assert.equal(other.hp,hp,'cooldown impede segundo proc');
 a.gameTime+=SOUL_RULES_V452D2.infernalCooldown;a.damage(vict,5,att,'true','basic');assert.ok(other.hp<hp,'rearma ao vencer ICD');
});
test('Hextech: descarga verdadeira e slow em até quatro inimigos, sem cadeia infinita',()=>{
 const {a,att,vict}=setup('hextech');for(const foe of a.units.filter(x=>x.team==='red')){foe.x=vict.x+.001;foe.y=vict.y;foe.hp=foe.maxHp;}
 const before=a.effectJournalV41.length;a.damage(vict,2,att,'true','basic');
 const newly=a.effectJournalV41.slice(before);assert.equal(newly.filter(x=>x.type==='slow'&&x.kind==='apply').length,4);
 assert.equal(att.soulHexAtV452d2,a.gameTime+8);
 const mark=a.effectJournalV41.length;a.damage(vict,2,att,'true','basic');assert.equal(a.effectJournalV41.slice(mark).filter(x=>x.type==='slow'&&x.kind==='apply').length,0);
});
test('Oceânica: restaura por quatro ticks, sem cura a cada ataque; 30% contra minions',()=>{
 const {a,att,vict}=setup('ocean');att.hp=att.maxHp-250;att.mana=att.maxMana-200;
 a.damage(vict,2,att,'true','basic');const heal=att.oceanSoulRestorationV452d2.heal;
 assert.ok(heal>25);const hp=att.hp;
 for(let i=1;i<=4;i++){a.gameTime++;a.advanceSoulEffectsV452d2();}
 assert.ok(att.hp>hp+heal*3.5);assert.equal(att.oceanSoulRestorationV452d2,null);
 const minion={id:'m_soul_test',team:'red',kind:'melee',hp:999,maxHp:999,armor:0};a.damage(minion,1,att,'true','basic');
 assert.ok(att.oceanSoulRestorationV452d2.heal<heal*.31);
});
test('Montanha: ganha escudo após cinco segundos e só renova após janela livre de dano',()=>{
 const {a,att,vict}=setup('mountain');a.teams.red.soulTypeV452='mountain';
 a.advanceSoulEffectsV452d2();assert.equal(a.effectResolverV41().has(vict,'shield'),true);
 const shield=a.effectResolverV41().list(vict).find(x=>x.key==='mountain_soul_v452d2');assert.ok(shield.power>=220);
 const initialHP=vict.hp;a.damage(vict,999,att,'true','basic');assert.ok(vict.hp<initialHP);assert.equal(shield.power,0);
 a.gameTime+=4;a.advanceSoulEffectsV452d2();assert.equal(a.effectResolverV41().list(vict).some(x=>x.key==='mountain_soul_v452d2'&&x.power>0),false);
 a.gameTime++;a.advanceSoulEffectsV452d2();assert.equal(a.effectResolverV41().list(vict).some(x=>x.key==='mountain_soul_v452d2'&&x.power>0),true);
});
test('Nuvens: bônus passivo e impulso após R com 30 segundos de ICD',()=>{
 const {a,att}=setup('cloud');const before=a.soulMovementBonusV452d2(att);assert.equal(before,.15);
 att.skillRanks.R=1;att.mana=999;const cast=a.performActionV40({actorId:att.id,kind:'skill',slot:'R',checkRange:false,costOverride:50,cooldownOverride:30});assert.equal(cast.ok,true);
 assert.equal(a.soulMovementBonusV452d2(att),.60);
 assert.equal(att.cloudSoulNextBoostAtV452d2,a.gameTime+30);
 a.gameTime+=6;assert.equal(a.soulMovementBonusV452d2(att),.15);
});
test('Quimtec: +13% dano e mitigação apenas abaixo de 50% HP',()=>{
 const {a,att,vict}=setup('chemtech');const base=vict.hp;
 a.damage(vict,100,att,'true','basic');const noBoost=base-vict.hp;
 att.hp=att.maxHp*.4;const before=vict.hp;a.damage(vict,100,att,'true','basic');assert.ok(before-vict.hp>noBoost,'amplifica dano do portador ferido');
 a.teams.red.soulTypeV452='chemtech';vict.hp=vict.maxHp*.4;const bef=vict.hp;a.damage(vict,100,att,'true','basic');assert.ok(bef-vict.hp<before-(vict.maxHp*.4),'redução defensiva');
});
test('Soul team permanente após morte; procs e restauração persistem em checkpoint',()=>{
 const {a,att,vict}=setup('ocean');a.damage(vict,1,att,'true','basic');const expected=att.oceanSoulRestorationV452d2;
 const restored=Arena.fromSnapshotV40(a.map,a.mask,a.snapshotV40());assert.deepEqual(restored.units.find(x=>x.id===att.id).oceanSoulRestorationV452d2,expected);
 att.hp=0;assert.equal(a.soulTypeV452d2(att),'ocean');a.advanceSoulEffectsV452d2();assert.equal(att.oceanSoulRestorationV452d2,null);
});
test('Hit de proc não ativa runas, Alma Infernal, nem queima/execute do Ancião',()=>{
 const {a,att,vict}=setup('infernal');att.elderBuffUntilV452=a.gameTime+150;att.runePageV43='sorcery';
 a.damage(vict,5,att,'true','basic');assert.equal(att.runeProcNextV43,0,'sem proc de cometa no AA');
 const hits=a.effectJournalV41.filter(x=>x.kind==='damage'&&x.sourceId===att.id);
 assert.ok(hits.length<=3,'sem recursão de almas');
 assert.ok(vict.elderBurnV452d,'burn ativado somente pelo golpe original');
});

test('Eliminação por Alma Infernal não contabiliza duas mortes/recompensas',()=>{
 const {a,att,vict}=setup('infernal');vict.hp=60;const previousKills=att.kills,previousDeaths=vict.deaths,previousGold=att.gold;
 a.damage(vict,5,att,'true','basic');
 assert.equal(att.kills,previousKills+1);
 assert.equal(vict.deaths,previousDeaths+1);
 assert.equal(att.gold,previousGold+300);
});
test('Barão reduz recall de oito para quatro segundos simulados',()=>{
 const a=make(),u=a.units.find(x=>x.id==='blue_TOP');a.gameTime=1200;
 a.phase='executing';u.x=.51;u.y=.49;u.baronBuffUntilV452=1380;u.order={kind:'recall'};u.recallProgress=0;u.lastHitAt=-999;
 // No need to simulate other champions: only the chosen unit progresses.
 const original=a.units;a.units=[u];
 for(let i=1;i<4;i++){a.gameTime++;a.reviveAndMove();assert.notEqual(u.recallProgress,0,'canalização ainda ativa');}
 a.gameTime++;a.reviveAndMove();assert.equal(u.recallProgress,0);assert.equal(u.awaitingShop,true);
 a.units=original;
});

console.log('V4.5.2d-2: 10 contratos de Almas/Recall aprovados');
