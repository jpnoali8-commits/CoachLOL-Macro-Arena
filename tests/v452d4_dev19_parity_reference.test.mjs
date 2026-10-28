import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,CHAMPION_STATS_V38} from '../engine.mjs';
import {PATCH_V452D4_DEV19,championReferenceV452d4Dev19,itemReferenceV452d4Dev19,normalizeRiotReferenceV452d4Dev19} from '../tools/riot_reference_v452d4_dev19.mjs';
import {localParityAuditV452d4Dev19} from '../tools/audit_parity_v452d4_dev19.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
let passed=0;function test(name,fn){fn();passed++;console.log('✓ DEV19 '+name);}
const champions={data:{Nidalee:{id:'Nidalee',name:'Nidalee',partype:'Mana',stats:{hp:610,hpperlevel:100,mp:310,mpperlevel:30,attackdamage:58,attackdamageperlevel:3,armor:28,armorperlevel:4,spellblock:30,spellblockperlevel:1.3,movespeed:335,attackrange:525,attackspeed:.638,attackspeedperlevel:3,hpregen:6,hpregenperlevel:.8,mpregen:7,mpregenperlevel:.5}}}};
const items={data:{1001:{name:'Boots',gold:{total:300,base:300,sell:210,purchasable:true},maps:{'11':true},stats:{FlatMovementSpeedMod:25},from:[],into:['3006'],tags:['Boots']},3006:{name:'Berserker',gold:{total:1100,base:800,sell:770,purchasable:true},maps:{'11':true},stats:{PercentAttackSpeedMod:.35},from:['1001'],tags:[]},4000:{name:'Other mode',gold:{total:200,base:200,purchasable:true},maps:{'11':false},stats:{}}}};
test('patch fixado 26.21/16.21.1 e fonte informativa separada do motor',()=>{
 assert.equal(PATCH_V452D4_DEV19.game,'26.21');assert.equal(PATCH_V452D4_DEV19.dataDragon,'16.21.1');
 const res=normalizeRiotReferenceV452d4Dev19(champions,items);
 assert.equal(res.status,'REFERENCE_ONLY_NOT_LIVE_ENGINE');assert.deepEqual(res.counts,{champions:1,shopItems:2});
});
test('18 níveis com fórmula não linear, alcance fixo e AP zero por natureza',()=>{
 const ch=championReferenceV452d4Dev19(champions).Nidalee;
 assert.equal(ch.perLevel.length,18);assert.equal(ch.perLevel[0].hp,610);
 assert.ok(ch.perLevel[1].hp<710);
 assert.equal(ch.perLevel[17].hp,2310);assert.equal(ch.perLevel[17].ap,0);
 assert.equal(ch.perLevel[17].moveSpeed,335);assert.equal(ch.perLevel[17].attackRange,525);
 assert.ok(ch.perLevel[17].attackSpeed>ch.perLevel[0].attackSpeed);
 assert.equal(ch.hasDetailedSpells,false);assert.equal(ch.hasPassiveMechanics,false);
});
test('item SR com custo, stats e componentes, sem passivos/ativos falsos',()=>{
 const refs=itemReferenceV452d4Dev19(items);
 assert.deepEqual(Object.keys(refs),['1001','3006']);assert.deepEqual(refs['3006'].from,['1001']);
 assert.equal(refs['1001'].stats.FlatMovementSpeedMod,25);
 assert.equal(refs['3006'].price.total,1100);
 assert.equal(refs['3006'].passiveStatus,'UNVERIFIED_NOT_EXECUTABLE');
});
test('dados incompletos rejeitados em vez de preencher campeões por aproximação',()=>{
 assert.throws(()=>championReferenceV452d4Dev19({data:{Nidalee:{stats:{hp:1}}}}),/champion_stats_ausentes/);
 assert.throws(()=>itemReferenceV452d4Dev19({data:null}),/item_json_invalido/);
});
test('auditoria mede cobertura local e marca Nidalee/Elise/Shyvana/Mordekaiser ausentes',()=>{
 const audit=localParityAuditV452d4Dev19();
 assert.equal(audit.summary.selectableChampions,14);
 assert.equal(audit.summary.championKitManifests,5);
 assert.equal(audit.summary.completeKits,0);
 assert.equal(audit.summary.shopItems,41);
 assert.equal(audit.summary.championsWithAll18LevelsAudited,5);
 assert.equal(audit.summary.fullyVerifiedItems,0);
 for(const name of ['Nidalee','Elise','Shyvana','Mordekaiser']){
  assert.ok(audit.mechanicGaps.some(g=>g.champion===name&&g.state==='NOT_REGISTERED'));
 }
 assert.equal(audit.referenceImportStatus,'NOT_AVAILABLE_IN_THIS_EXECUTION');
});
test('importador não injeta balanceamento não testado no combate da dev18',()=>{
 const original=CHAMPION_STATS_V38.Jinx.hp;
 const engine=new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:26});
 const player=engine.units.find(x=>x.champ==='Jinx');
 assert.equal(player.maxHp,original);
 assert.equal(engine.units.some(x=>['Nidalee','Elise','Shyvana','Mordekaiser'].includes(x.champ)),false);
 const reference=normalizeRiotReferenceV452d4Dev19(champions,items);
 assert.equal(reference.champions.Nidalee.perLevel[0].hp,610);
 assert.equal(engine.units.find(x=>x.champ==='Jinx').maxHp,original);
});
console.log(`DEV19: ${passed}/6 PASS`);
