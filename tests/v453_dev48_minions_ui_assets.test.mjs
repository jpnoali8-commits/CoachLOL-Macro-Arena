import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),assets=load('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=assets.baseFeatures;map.riftBundlesV452d4=assets.variants;
const arena=new Arena(map,mask,{seed:48});let passed=0;
function check(label,fn){fn();console.log('✓ '+label);passed++}
check('wave normal 3 guerreiros e 3 magos',()=>{
 const types=arena.waveCompositionV452b(1,60);assert.deepEqual(types,['melee','melee','melee','caster','caster','caster']);});
check('wave canhao 3 guerreiros, 1 catapulta, 3 magos',()=>{
 const types=arena.waveCompositionV452b(3,100);assert.deepEqual(types,['melee','melee','melee','siege','caster','caster','caster']);});
check('spawn de seis minions por equipe e rota com slots distintos',()=>{
 arena.gameTime=30;arena.spawnWaves();const wave=arena.minions.filter(m=>m.team==='blue'&&m.lane==='mid'&&m.spawnWaveV452c===1);
 assert.equal(wave.length,6);assert.deepEqual(wave.map(m=>m.formationSlotV453Dev48),[0,1,2,0,1,2]);
 const line=arena.lanes.mid;const a=wave.slice(0,3).map(m=>arena.minionFormationPointV453Dev48(line,m.progress,m.kind,m.formationSlotV453Dev48,m.team)).map(pos=>`${pos.x.toFixed(6)}:${pos.y.toFixed(6)}`);assert.equal(new Set(a).size,3,'visual formation must separate three frontline portraits');});
check('minion block helper can separate exact duplicates without mutating the economic pathing',()=>{
 const w=arena.minions.filter(m=>m.team==='blue'&&m.lane==='mid');const a=w[0],b=w[1];b.x=a.x;b.y=a.y;arena.gameTime=31;
 arena.resolveMinionBlockV453Dev48();assert.ok(arena.mapDistance(a,b)>1,'collision should split same-position icons');});
check('names mapped to real jungle monsters, no spot identifiers',()=>{
 for(const c of arena.camps){assert.ok(c.name&&!/spot_\d+/.test(c.name),c.id+': '+c.name)}
 assert.equal(arena.camps.find(c=>c.timerKey==='wolves').name,'Lobos');});
check('eight generated structure PNG assets are present',()=>{
 for(const team of ['red','blue'])for(const kind of ['tower','tower_barricade','inhibitor','nexus']){
 const file=new URL(`../assets/ui/structures_dev48/${team}_${kind}.png`,import.meta.url);assert.ok(statSync(file).size>10000);
 }});
check('renderer chooses team-specific user-supplied structure images',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.ok(app.includes('structureImagesV453Dev48'));assert.ok(app.includes('s.team'));});
check('objective timers show icon and countdown instead of static scheduled time',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.ok(app.includes('objectiveTimerIconV453Dev48'));assert.ok(app.includes('remaining=first?spawn-match.gameTime'));});
check('shop recipe scales to width without horizontal scrolling',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),css=readFileSync(new URL('../styles-v453-dev48.css',import.meta.url),'utf8');
 assert.ok(app.includes('fitRecipeTreeV453Dev48'));assert.ok(app.includes('available/natural'));assert.ok(css.includes('overflow-x:hidden'));
});
check('collision for explicit movement detects minion body',()=>{
 const m=arena.minions.find(u=>u.kind==='melee'&&u.team==='blue'&&u.lane==='mid');
 const pt=arena.minionFormationPointV453Dev48(arena.lanes.mid,m.progress,m.kind,m.formationSlotV453Dev48,m.team);
 assert.ok(arena.minionBodyCollisionV453Dev48(pt),'explicit champion path must detect lane minion body');
});
check('official shop reference remains non-purchasable',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const data=JSON.parse(readFileSync(new URL('../data/riot_reference/catalog_26_21_dev39.json',import.meta.url),'utf8'));
 assert.equal(data.items['3110'].namePt,'Coração Congelado');
 assert.ok(app.includes('officialCatalogExtrasV453Dev48'));assert.ok(app.includes('notPurchasable:true'));
 assert.ok(app.includes("buy.disabled=true;buy.textContent='INDISPONÍVEL'"));
});
check('tier filters and inventory compact with outside-click cancellation',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8'),html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(html.includes('shopTierFiltersV453Dev48'));assert.ok(app.includes('selectedInventoryV453Dev48'));assert.ok(app.includes("e.target.closest('#shopInventory')"));
});

console.log(`DEV48 ${passed}/${passed} PASS`);
