import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Arena,catalog,ITEM_RECIPES,ITEM_EFFECTS_V43,checksumV40,recipeTreeV453Dev30} from '../engine.mjs';
const load=s=>JSON.parse(fs.readFileSync(new URL('../data/'+s,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),masks=load('masks_128.json');
const raw=load('riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json').data;
const sr=load('riot_reference/sr_shop_26_21_dev49.json');
const make=()=>new Arena(map,masks,{seed:56});
let count=0;
const test=(label,run)=>{run();count++;console.log('✓ DEV56 '+label)};
const specs={tear_of_the_goddess:{riot:'3070',cost:400,stats:{mana:240},parts:[]},hextech_alternator:{riot:'3145',cost:1100,stats:{ap:45},parts:['amp_tome','amp_tome']}};
const pair=()=>{const a=make(),u=a.units.find(v=>v.id==='blue_MID'),v=a.units.find(v=>v.id==='red_MID');Object.assign(v,{hp:9000,maxHp:9000,armor:0,mr:0,shield:0,stasisUntil:0});return {a,u,v}};
test('Arquivos oficiais SR: preço, atributos, receita, localização',()=>{
 for(const [id,x] of Object.entries(specs)){
  const item=catalog.find(i=>i.id===id),rr=raw[x.riot];
  assert.ok(item);assert.equal(item.riotId,Number(x.riot));assert.equal(item.cost,x.cost);assert.equal(rr.gold.total,x.cost);
  assert.equal(rr.maps['11'],true);assert.equal(rr.gold.purchasable,true);
  assert.deepEqual(item.stats,x.stats);assert.deepEqual(ITEM_RECIPES[id]||[],x.parts);
  assert.deepEqual(recipeTreeV453Dev30(id).components.map(p=>p.id),x.parts);
  assert.equal(sr.rows[x.riot].status,'engine_playable');
 }
});
test('Alternador: componentes duplicados consumidos com desconto exato',()=>{
 const {a,u}=pair(),shop=a.map.objects.find(x=>x.id==='blue_spawn_shop');Object.assign(u,{x:shop.x,y:shop.y,gold:5000,items:[]});
 assert.equal(a.buy(u.team,u.id,'amp_tome'),true);assert.equal(a.buy(u.team,u.id,'amp_tome'),true);
 assert.equal(a.itemPurchaseCost(u,'hextech_alternator'),300);
 assert.equal(a.buy(u.team,u.id,'hextech_alternator'),true);assert.deepEqual(u.items,['hextech_alternator']);assert.equal(u.gold,3900);
});
test('Lágrima: concede 240 mana na compra e retorna ao original na venda',()=>{
 const {a,u}=pair(),shop=a.map.objects.find(x=>x.id==='blue_spawn_shop');Object.assign(u,{x:shop.x,y:shop.y,gold:3000,items:[]});const initial=u.maxMana;
 assert.equal(a.buy(u.team,u.id,'tear_of_the_goddess'),true);assert.equal(u.maxMana,initial+240);
 assert.equal(a.sellItemV43(u.team,u.id,u.items.indexOf('tear_of_the_goddess')).ok,true);assert.equal(u.maxMana,initial);
});
test('Lágrima: habilidades contra campeões acumulam 6 mana; minions, 3',()=>{
 const {a,u,v}=pair(),m={id:'m3000',team:'red',kind:'caster',hp:1000,maxHp:1000,armor:0,mr:0};u.items=['tear_of_the_goddess'];
 a.damage(v,50,u,'magic','spell');assert.equal(u.tearManaBonusV453Dev56,6);
 a.damage(m,50,u,'magic','spell');assert.equal(u.tearManaBonusV453Dev56,9);
 assert.equal(u.tearChargesV453Dev56,2);
});
test('Lágrima: quatro cargas e reabastecimento no relógio autoritativo',()=>{
 const {a,u,v}=pair();u.items=['tear_of_the_goddess'];
 for(let i=0;i<5;i++)a.damage(v,10,u,'magic','spell');
 assert.equal(u.tearManaBonusV453Dev56,24);assert.equal(u.tearChargesV453Dev56,0);
 a.gameTime=8;a.damage(v,10,u,'magic','spell');assert.equal(u.tearManaBonusV453Dev56,30);
 a.gameTime=16;a.damage(v,10,u,'magic','spell');assert.equal(u.tearManaBonusV453Dev56,36);
});
test('Lágrima: não acumula mana em básicos, procs, dano a aliados ou feitiço bloqueado',()=>{
 const {a,u,v}=pair();u.items=['tear_of_the_goddess'];
 a.damage(v,10,u,'magic','item_hextech_alternator_v453_dev56');a.damage(v,10,u,'true','basic');
 assert.equal(u.tearManaBonusV453Dev56||0,0);
 v.stasisUntil=10;a.damage(v,10,u,'magic','spell');assert.equal(u.tearManaBonusV453Dev56||0,0);
});
test('Lágrima: ataques básicos ganham 5 dano físico exclusivamente contra minions',()=>{
 const {a,u,v}=pair();u.items=['tear_of_the_goddess'];
 const m={id:'m3400',team:'red',kind:'melee',hp:1000,maxHp:1000,armor:0,mr:0};
 a.damage(m,50,u,'physical','basic');assert.equal(m.hp,945);
 a.damage(v,50,u,'true','basic');assert.equal(v.hp,8950);
});
test('Lágrima: bônus armazenado é removido ao vender; reaquisição reinicia stacks',()=>{
 const {a,u,v}=pair(),shop=a.map.objects.find(x=>x.id==='blue_spawn_shop');Object.assign(u,{items:[],x:shop.x,y:shop.y,gold:3000});
 const orig=u.maxMana;assert.equal(a.buy(u.team,u.id,'tear_of_the_goddess'),true);
 a.damage(v,30,u,'magic','spell');assert.equal(u.maxMana,orig+246);
 assert.equal(a.sellItemV43(u.team,u.id,0).ok,true);assert.equal(u.maxMana,orig);
 assert.equal(a.buy(u.team,u.id,'tear_of_the_goddess'),true);assert.equal(u.tearManaBonusV453Dev56,0);assert.equal(u.maxMana,orig+240);
});
test('Alternador: ao causar dano, gera proc mágico uma vez; não encadeia',()=>{
 const {a,u,v}=pair();u.items=['hextech_alternator'];
 a.damage(v,100,u,'true','basic');assert.equal(v.hp,8860);
 a.damage(v,100,u,'true','basic');assert.equal(v.hp,8760);
 a.gameTime=40;a.damage(v,100,u,'true','basic');assert.equal(v.hp,8620);
});
test('Alternador: invulnerabilidade e acerto absorvido não consomem recarga',()=>{
 const {a,u,v}=pair();u.items=['hextech_alternator'];v.stasisUntil=6;
 a.damage(v,30,u,'magic','spell');assert.equal(u.hextechAlternatorReadyAtV453Dev56||0,0);
 v.stasisUntil=0;v.shield=200;a.damage(v,30,u,'magic','spell');assert.equal(u.hextechAlternatorReadyAtV453Dev56||0,0);
 v.shield=0;a.damage(v,30,u,'magic','spell');assert.equal(u.hextechAlternatorReadyAtV453Dev56,40);
});
test('Alternador: só herói adversário aciona, venda e recompra limpam cooldown',()=>{
 const {a,u,v}=pair(),shop=a.map.objects.find(x=>x.id==='blue_spawn_shop');Object.assign(u,{x:shop.x,y:shop.y,gold:10000,items:[]});
 assert.equal(a.buy(u.team,u.id,'hextech_alternator'),true);
 const m={id:'m3001',team:'red',kind:'melee',hp:1000,maxHp:1000,armor:0};a.damage(m,30,u,'physical','basic');assert.equal(u.hextechAlternatorReadyAtV453Dev56,0);
 a.damage(v,20,u,'true','basic');assert.equal(u.hextechAlternatorReadyAtV453Dev56,40);
 assert.equal(a.sellItemV43(u.team,u.id,0).ok,true);assert.equal(u.hextechAlternatorReadyAtV453Dev56,0);
 assert.equal(a.buy(u.team,u.id,'hextech_alternator'),true);assert.equal(u.hextechAlternatorReadyAtV453Dev56,0);
});
test('Minion block: 6 por wave, 7 na wave de canhão; coordenadas reais distintas',()=>{
 const a=make();a.gameTime=30;a.spawnWaves();a.gameTime=40;a.updateMinionBodiesV453Dev51();
 const mm=a.minions.filter(m=>m.team==='blue'&&m.lane==='mid');assert.equal(mm.length,6);
 assert.deepEqual(a.waveCompositionV452b(3,110),['melee','melee','melee','siege','caster','caster','caster']);
 const coords=new Set(mm.map(m=>[m.bodyX,m.bodyY].join(',')));assert.equal(coords.size,6);
});
test('Auditoria de corpos em onda comum não modifica estado econômico',()=>{
 const a=make();a.gameTime=30;a.spawnWaves();a.gameTime=40;a.updateMinionBodiesV453Dev51();
 const before=a.minions.map(m=>[m.hp,m.progress,m.x,m.y,m.damage]);const report=a.minionFootprintAuditV453Dev56();
 assert.equal(report.active,36);assert.equal(report.overlaps.length,0);assert.deepEqual(a.minions.map(m=>[m.hp,m.progress,m.x,m.y,m.damage]),before);
});
test('Auditoria identifica sobreposição fabricada sem alterar posições',()=>{
 const a=make();a.gameTime=30;a.spawnWaves();a.gameTime=40;a.updateMinionBodiesV453Dev51();
 const m=a.minions.filter(m=>m.hp>0&&m.spawnAt<=40);m[1].bodyX=m[0].bodyX;m[1].bodyY=m[0].bodyY;
 const r=a.minionFootprintAuditV453Dev56();assert.ok(r.overlaps.some(x=>(x.a===m[0].id&&x.b===m[1].id)||(x.b===m[0].id&&x.a===m[1].id)));
});
test('Snapshot conserva cargas, relógios de cooldown e posições físicas',()=>{
 const {a,u,v}=pair();u.items=['tear_of_the_goddess','hextech_alternator'];a.damage(v,20,u,'magic','spell');
 a.gameTime=30;a.spawnWaves();a.gameTime=40;a.updateMinionBodiesV453Dev51();
 const snap=a.snapshotV40(),b=Arena.fromSnapshotV40(map,masks,snap);
 assert.equal(checksumV40(snap),checksumV40(b.snapshotV40()));
 const restored=b.units.find(x=>x.id===u.id);assert.equal(restored.tearManaBonusV453Dev56,6);assert.equal(restored.hextechAlternatorReadyAtV453Dev56,40);
 assert.ok(Number.isFinite(b.minions[0].bodyX));
});
test('Classificação do catálogo mantém itens exclusivos e alternativos bloqueados',()=>{
 assert.equal(sr.counts.normalStore,202);assert.ok(sr.counts.normalPlayable>=94);assert.equal(sr.counts.normalPlayable+sr.counts.referenceOnly,sr.counts.normalStore);
 assert.ok(ITEM_EFFECTS_V43.tear_of_the_goddess.maturity.includes('dev56'));
 assert.ok(ITEM_EFFECTS_V43.hextech_alternator.maturity.includes('partial'));
});
console.log(`DEV56 ${count}/${count} PASS`);
