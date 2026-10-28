import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,catalog,ITEM_RECIPES,ITEM_EFFECTS_V43,recipeTreeV453Dev30,checksumV40} from '../engine.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),masks=read('masks_128.json');
const raw=read('riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const sr=read('riot_reference/sr_shop_26_21_dev49.json');
const specs={lost_chapter:{riotId:'3802',cost:1200,parts:['amp_tome','sapphire_crystal','glowing_mote'],stats:{ap:40,mana:300,abilityHaste:10}},catalyst_of_aeons:{riotId:'3803',cost:1300,parts:['ruby_crystal','ruby_crystal','sapphire_crystal'],stats:{hp:300,mana:375}}};
const make=()=>new Arena(map,masks,{seed:53});
const champ=a=>a.units.find(u=>u.id==='blue_MID');
const other=a=>a.units.find(u=>u.id==='red_MID');
let total=0;
const test=(label,fn)=>{fn();total++;console.log('✓ DEV53 '+label)};
test('itens oficiais normais: preço, atributos, receita, mapeamento e categoria',()=>{
 for(const [id,s] of Object.entries(specs)){
  const i=catalog.find(x=>x.id===id),r=raw[s.riotId];
  assert.ok(i);assert.equal(i.riotId,Number(s.riotId));assert.equal(i.cost,r.gold.total);assert.equal(i.cost,s.cost);
  assert.deepEqual(i.stats,s.stats);assert.deepEqual(ITEM_RECIPES[id],s.parts);
  assert.deepEqual(recipeTreeV453Dev30(id).components.map(x=>x.id),s.parts);
  assert.equal(sr.rows[s.riotId].status,'engine_playable');assert.equal(sr.rows[s.riotId].recipeVerified,true);
  assert.equal(r.maps['11'],true);assert.equal(r.gold.purchasable,true);
 }
});
test('compra por componentes desconta ouro e recompõe inventário com componentes duplicados',()=>{
 for(const [id,s] of Object.entries(specs)){
  const a=make(),u=champ(a),spawn=a.map.objects.find(x=>x.id==='blue_spawn_shop');
  Object.assign(u,{x:spawn.x,y:spawn.y,gold:20000,items:[]});const before=u.gold;
  for(const part of s.parts)assert.equal(a.buy('blue',u.id,part),true);
  assert.equal(a.itemPurchaseCost(u,id),s.cost-s.parts.reduce((n,p)=>n+catalog.find(x=>x.id===p).cost,0));
  assert.equal(a.buy('blue',u.id,id),true);assert.deepEqual(u.items,[id]);assert.equal(before-u.gold,s.cost);
 }
});
test('capítulo perdido programa três pulsos de 20% do mana máximo após subida de nível',()=>{
 const a=make(),u=champ(a);u.items=['lost_chapter'];u.level=1;u.xp=0;u.mana=0;
 a.gainXP(u,280);assert.equal(u.level,2);const scheduled=u.lostChapterManaPulsesV453Dev53;
 assert.equal(scheduled.length,1);assert.equal(scheduled[0].remaining,3);
 const pulse=scheduled[0].amount;assert.ok(Math.abs(pulse-u.maxMana*.2/3)<1e-7);
 const original=u.mana;for(let k=0;k<3;k++){a.advanceItemRegenV453Dev38();assert.ok(Math.abs(u.mana-original+pulse*0-pulse*(k+1))<1e-6)}
 assert.equal(u.lostChapterManaPulsesV453Dev53.length,0);
});
test('capítulo não recupera mana automaticamente sem subida de nível, nem após venda',()=>{
 const a=make(),u=champ(a);u.items=['lost_chapter'];u.mana=0;
 a.advanceItemRegenV453Dev38();assert.equal(u.mana,0);
 u.level=1;u.xp=0;a.gainXP(u,280);const before=u.mana;
 u.items=[];a.advanceItemRegenV453Dev38();assert.equal(u.mana,before);assert.deepEqual(u.lostChapterManaPulsesV453Dev53,[]);
});
test('capítulo acumula duas subidas e persiste em snapshot no meio dos pulsos',()=>{
 const a=make(),u=champ(a);u.items=['lost_chapter'];u.level=1;u.xp=0;u.mana=0;
 a.gainXP(u,660);assert.equal(u.level,3);assert.equal(u.lostChapterManaPulsesV453Dev53.length,2);
 a.advanceItemRegenV453Dev38();const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,masks,snap);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));
 assert.equal(b.units.find(x=>x.id===u.id).lostChapterManaPulsesV453Dev53.length,2);
});
test('catalisador converte 10% do dano efetivamente recebido de campeão em mana',()=>{
 const a=make(),u=champ(a),enemy=other(a);u.items=['catalyst_of_aeons'];Object.assign(u,{hp:1000,maxHp:1200,armor:0,mr:0,mana:0,maxMana:750});
 enemy.ad=0;enemy.items=[];const dealt=a.damage(u,100,enemy,'true','spell');assert.equal(dealt,100);assert.equal(u.mana,10);
});
test('catalisador não recupera mana de monstros, ataques bloqueados ou escudo total',()=>{
 const a=make(),u=champ(a),enemy=other(a);u.items=['catalyst_of_aeons'];Object.assign(u,{hp:1000,maxHp:1000,mana:0,maxMana:750,shield:250});
 a.damage(u,50,enemy,'true','spell');assert.equal(u.mana,0);u.shield=0;u.stasisUntil=a.gameTime+3;
 a.damage(u,50,enemy,'true','spell');assert.equal(u.mana,0);u.stasisUntil=0;
 a.damage(u,50,null,'true','other');assert.equal(u.mana,0);
});
test('catalisador cura 25% do mana pago apenas em habilidade autorizada',()=>{
 const a=make(),u=champ(a);u.items=['catalyst_of_aeons'];u.hp=u.maxHp-100;u.mana=400;u.skillRanks.Q=1;
 const before=u.hp,spent=u.mana;
 const ok=a.performActionV40({actorId:u.id,kind:'skill',slot:'Q',costOverride:40,cooldownOverride:5,checkRange:false,source:'dev53_test'});
 assert.equal(ok.ok,true);assert.equal(u.mana,spent-40);assert.ok(Math.abs(u.hp-before-10)<1e-8);
 const after=u.hp;const denied=a.performActionV40({actorId:u.id,kind:'skill',slot:'Q',costOverride:40,cooldownOverride:5,checkRange:false,source:'dev53_test'});
 assert.equal(denied.ok,false);assert.equal(u.hp,after);
});
test('catalisador respeita teto de mana e vida',()=>{
 const a=make(),u=champ(a),enemy=other(a);u.items=['catalyst_of_aeons'];u.mana=u.maxMana-3;u.hp=u.maxHp-2;u.armor=0;u.mr=0;u.skillRanks.Q=1;
 a.damage(u,80,enemy,'true','spell');assert.equal(u.mana,u.maxMana);
 a.performActionV40({actorId:u.id,kind:'skill',slot:'Q',costOverride:40,cooldownOverride:10,checkRange:false,source:'dev53_cap'});assert.ok(u.hp<=u.maxHp);
});
test('colisão contínua encontra um corpo em trajetória que antiga amostragem poderia saltar',()=>{
 const a=make();a.gameTime=30;a.spawnWaves();a.gameTime=40;a.updateMinionBodiesV453Dev51();
 const m=a.minions.find(x=>x.team==='blue'&&x.lane==='mid');
 for(const other of a.minions)if(other!==m)other.hp=0;
 const body=a.minionBodyPositionV453Dev51(m),r=a.minionBodyRadiusV453Dev51(m)+17;
 const start={x:body.x-(r+6)/a.worldWidth,y:body.y},end={x:body.x+(r+6)/a.worldWidth,y:body.y};
 assert.equal(a.minionBodyCollisionAlongV453Dev52(start,end)?.minion.id,m.id);
});
test('colisão geométrica não bloqueia percurso paralelo fora do raio',()=>{
 const a=make();a.gameTime=30;a.spawnWaves();a.gameTime=40;a.updateMinionBodiesV453Dev51();
 const m=a.minions.find(x=>x.team==='blue'&&x.lane==='mid');for(const o of a.minions)if(o!==m)o.hp=0;
 const body=a.minionBodyPositionV453Dev51(m),r=a.minionBodyRadiusV453Dev51(m)+17;
 const start={x:body.x-200/a.worldWidth,y:body.y+(r+2)/a.worldHeight},end={x:body.x+200/a.worldWidth,y:start.y};
 assert.equal(a.minionBodyCollisionAlongV453Dev52(start,end),null);
});
test('campeão pode sair de um bloco já ocupado, mas não atravessar outro',()=>{
 const a=make();a.gameTime=30;a.spawnWaves();a.gameTime=40;a.updateMinionBodiesV453Dev51();
 const m=a.minions.find(x=>x.team==='blue'&&x.lane==='mid');for(const o of a.minions)if(o!==m)o.hp=0;
 const p=a.minionBodyPositionV453Dev51(m);
 const inside={x:p.x+20/a.worldWidth,y:p.y};
 assert.equal(a.minionBodyCollisionAlongV453Dev52(inside,{x:p.x+100/a.worldWidth,y:p.y}),null);
 assert.equal(a.minionBodyCollisionAlongV453Dev52(inside,p)?.minion.id,m.id);
});
test('trajetória escolhe a primeira colisão, não a ordem dos minions no array',()=>{
 const a=make();a.gameTime=30;a.spawnWaves();a.gameTime=40;
 const [a1,b1]=a.minions.slice(0,2);for(const m of a.minions)if(m!==a1&&m!==b1)m.hp=0;
 const base={x:.493,y:.5};Object.assign(a1,{bodyX:.505,bodyY:.5});Object.assign(b1,{bodyX:.501,bodyY:.5});
 assert.equal(a.minionBodyCollisionAlongV453Dev52(base,{x:.52,y:.5})?.minion.id,b1.id);
});
test('mecânicas não invocam IA de bots e permanecem com classificação parcial explícita',()=>{
 assert.equal(ITEM_EFFECTS_V43.lost_chapter.kind,'level_up_mana_regen');
 assert.equal(ITEM_EFFECTS_V43.catalyst_of_aeons.kind,'eternity_mana_on_champion_hit_and_health_on_spell');
 assert.ok(ITEM_EFFECTS_V43.lost_chapter.maturity.includes('dev53'));
});
console.log(`DEV53 ${total}/${total} PASS`);
