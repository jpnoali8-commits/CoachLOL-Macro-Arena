import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {catalog,ITEM_RECIPES,ITEM_EFFECTS_V43} from '../engine.mjs';
import {loadOfficial,buildCatalog} from '../tools/catalog_official_v453_dev36.mjs';
import {generate} from '../tools/champion_reference_v453_dev36.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let n=0;function t(name,fn){fn();console.log('✓ DEV36 '+name);n++}
const official=loadOfficial(),report=official.audit;
const raw=fs.readFileSync(path.join(root,'data/riot_reference/source_16_21_1/riot/16.21.1/en_US/item.json'));
const sourceAudit=JSON.parse(fs.readFileSync(path.join(root,'data/riot_reference/source_audit_26_21_dev36.json')));
t('all 863 official item IDs retained; map-11 and purchasable counts exact',()=>{
 assert.equal(official.counts.all,863);assert.equal(official.counts.rift,315);assert.equal(official.counts.riotPurchasableRift,254);
 assert.equal(Object.keys(official.items).length,863);assert.equal(official.items['3089'].cost,3500);
});
t('source data verified against supplied hashes, and provenance not overstated',()=>{
 assert.equal(sourceAudit.filesVerifiedAgainstManifest,366);assert.equal(sourceAudit.items,863);
 assert.match(sourceAudit.sourceKind,/NOT_RIOT_SIGNED/);assert.equal(sourceAudit.sourceHashes['riot/16.21.1/en_US/item.json'],crypto.createHash('sha256').update(raw).digest('hex'));
 assert.equal(sourceAudit.wikiPagesReceivedButNotBundled,3);
});
t('every recipe preserves ingredients; no missing IDs or recipe cycles',()=>{
 assert.deepEqual(report.recipeMissingIds,[]);assert.deepEqual(report.recipeCycles,[]);
 assert.deepEqual(official.items['3089'].from,['1058','1058']);
 assert.deepEqual(official.items['3115'].from,['1043','1026','3108']);
});
t('support-item quest evolutions separated from normal shop',()=>{
 assert.equal(official.counts.conditional_evolution,5);
 for(const id of ['3869','3870','3871','3876','3877']){
  assert.equal(official.items[id].category,'conditional_evolution');assert.equal(official.items[id].localPlayable,false);
  assert.deepEqual(official.items[id].from,['3867']);
 }
});
t('champion exclusives and turret internal are not normal shop purchases',()=>{
 assert.equal(official.counts.champion_exclusive,7);
 assert.equal(official.items['3330'].requiredChampion,'FiddleSticks');
 assert.equal(official.items['3599'].requiredChampion,'Kalista');
 assert.equal(official.items['1515'].category,'minion_turret_internal');
 assert.equal(official.items['1515'].clientInStore,false);
});
t('dev36 snapshot retains 67 mapped originals; reference-only IDs remain non-purchasable',()=>{
 assert.ok(catalog.length>=67); 
 assert.ok(official.counts.localPlayableItems>=67); // subsequent reviewed batches may extend dev36's baseline
 assert.equal(official.status,'BROWSE_ONLY_DO_NOT_BUY');
 assert.ok(!catalog.some(x=>x.id==='riot_3869'));
 assert.equal(official.items['3089'].localPlayable,true);
 assert.equal(official.items['3869'].mechanicsCertified,false);
});
t('local/official recipe differences are reported without modifying game data',()=>{
 assert.deepEqual(official.audit.priceDeltas.map(x=>x.id).sort(),[]); // quest-only entries no longer pollute normal shop price audit
 assert.equal(official.audit.recipeDeltas.length,0); // dev37 reconciled the five originals
 assert.ok(Object.keys(ITEM_RECIPES).length>20);
 assert.ok(Object.keys(ITEM_EFFECTS_V43).length>10);
 assert.equal(official.audit.approvedForAutomaticGameplay,false);
});
t('all 173 champions have versioned bases, passive and Q/W/E/R metadata',()=>{
 const r=generate();assert.equal(r.count,173);
 for(const id of ['Mordekaiser','Elise','Nidalee','Shyvana']){
  const ch=r.champions[id];assert.ok(ch.stats.hp>0);assert.equal(ch.spells.length,4);
  assert.equal(ch.mechanicsCertified,false);
 }
 assert.equal(r.champions.Mordekaiser.spells[3].name,'Realm of Death');
});
t('partial and wrong-patch official inputs fail before publication',()=>{
 const en=JSON.parse(raw),pt=JSON.parse(fs.readFileSync(path.join(root,'data/riot_reference/source_16_21_1/riot/16.21.1/pt_BR/item.json'))),client=JSON.parse(fs.readFileSync(path.join(root,'data/riot_reference/source_16_21_1/communitydragon/latest/items.json')));
 assert.throws(()=>buildCatalog({en:{...en,version:'16.22.1'},pt,client}),/PATCH_VERSION/);
 assert.throws(()=>buildCatalog({en:{...en,data:{'1001':en.data['1001']}},pt,client}),/FULL_DATA_DRAGON_REQUIRED/);
});
t('viewer and in-game shop link exist without injecting unimplemented goods',()=>{
 const html=fs.readFileSync(path.join(root,'catalogo_riot_26_21.html'),'utf8');
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/COACHLOL_OFFICIAL_CATALOG/);assert.match(html,/Somente referência|Somente consulta|somente consulta/i);
 assert.match(index,/catalogo_riot_26_21\.html/);
 assert.ok(fs.statSync(path.join(root,'data/riot_reference/catalog_26_21_dev36.js')).size>700000);
});
t('unit-balancing patch records remain untouched and live combat is not activated',()=>{
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'data/patch_center/unit_balance_26_21_local_baseline_dev35.json')));
 assert.equal(baseline.units.turret_outer.hp,9000);
 assert.equal(official.items['1515'].mechanicsCertified,false);
 assert.equal(official.items['1515'].localPlayable,false);
});
console.log(`DEV36 ${n}/${n} PASS`);
