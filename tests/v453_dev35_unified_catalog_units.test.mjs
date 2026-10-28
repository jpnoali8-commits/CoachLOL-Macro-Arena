import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildUnifiedCatalog,normalizeTaxonomyOverrides,verifyUnitBalanceSnapshot,compareUnitBalance,canShopBuy,CATEGORIES} from '../tools/catalog_unified_v453_dev35.mjs';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const notes='https://wiki.leagueoflegends.com/en-us/Item_(League_of_Legends)';
let passed=0;function test(name,fn){fn();console.log('✓ DEV35 '+name);passed++;}
const example=(count=170)=>{
 const data={};for(let i=1000;i<1000+count;i++)data[String(i)]={name:`Fixture ${i}`,maps:{11:true},gold:{purchasable:true,total:300,base:300,sell:210},stats:{FlatHPPoolMod:200},tags:[]};
 data['1012'].from=['1000','1001'];data['1020'].maps['11']=false;data['1021'].gold.purchasable=false;data['1022'].gold.purchasable=false;data['1023'].gold.purchasable=false;
 return {version:'16.21.1',type:'item',data};
};
const taxonomy={'1021':{category:'minion_turret_internal',appliesTo:['melee','turret_outer'],source:notes},'1022':{category:'champion_exclusive',eligibleChampions:['Kalista'],source:notes}};
const snap=JSON.parse(fs.readFileSync(path.join(root,'data/patch_center/unit_balance_26_21_local_baseline_dev35.json'),'utf8'));
const bytes=fs.readFileSync(path.join(root,'engine.mjs'),'utf8');
test('reviewed source taxonomy separates shop, non-rift, internal unit and champion exclusive',()=>{
 const result=buildUnifiedCatalog(example(),{taxonomy});assert.equal(result.counts.shop,166);assert.equal(result.counts.non_summoners_rift,1);assert.equal(result.counts.minion_turret_internal,1);assert.equal(result.counts.champion_exclusive,1);assert.equal(result.counts.non_purchasable_other,1);
 assert.equal(result.records['1021'].shopAvailable,false);assert.equal(result.records['1022'].shopAvailable,false);assert.equal(result.records['1012'].shopAvailable,true);
});
test('exclusive champion items can be bought only when reviewed and source allows purchasing',()=>{
 const data=example();data.data['1022'].gold.purchasable=true;const staged=buildUnifiedCatalog(data,{taxonomy});
 assert.equal(staged.records['1022'].shopAvailable,false);assert.equal(canShopBuy(staged.records['1022'],'Kalista'),true);assert.equal(canShopBuy(staged.records['1022'],'Jinx'),false);assert.equal(canShopBuy(staged.records['1021'],'Kalista'),false);
});
test('Riot map11 flag and purchasable flag both necessary for shop items',()=>{const s=buildUnifiedCatalog(example(),{taxonomy});assert.ok(!s.records['1020'].shopAvailable&&!s.records['1021'].shopAvailable);});
test('internal items are not accidentally offered as recipe components',()=>{const src=example();src.data['1007'].from=['1021'];const out=buildUnifiedCatalog(src,{taxonomy});assert.deepEqual(out.validation.unsafeShopRecipes,['1007:1021']);});
test('all raw items preserved including non-shop records',()=>{const s=buildUnifiedCatalog(example(),{taxonomy});assert.equal(s.validation.total,170);assert.equal(Object.keys(s.records).length,170);});
test('missing ingredients detected instead of quietly stripped',()=>{const src=example();src.data['1012'].from=['99999'];const v=buildUnifiedCatalog(src,{taxonomy});assert.deepEqual(v.validation.recipeErrors,['MISSING_COMPONENT:1012:99999']);});
test('recipe cycles rejected before activation',()=>{const src=example();src.data['1000'].from=['1012'];const v=buildUnifiedCatalog(src,{taxonomy});assert.ok(v.validation.recipeErrors.some(x=>x.startsWith('RECIPE_CYCLE')));});
test('source evidence and champion restrictions mandatory for manual classification',()=>{assert.throws(()=>normalizeTaxonomyOverrides({'1022':{category:'champion_exclusive',source:notes}}),/ELIGIBILITY/);assert.throws(()=>normalizeTaxonomyOverrides({'1021':{category:'minion_turret_internal',source:'unsupported',appliesTo:['melee']}}),/EVIDENCE/);});
test('a short fake/partial Data Dragon export is rejected in production mode',()=>assert.throws(()=>buildUnifiedCatalog(example(30),{}),/PARTIAL/));
test('future or mismatched versions cannot silently replace 26.21',()=>assert.throws(()=>buildUnifiedCatalog({...example(),version:'16.22.1'},{}),/VERSION/));
test('existing local minion and turret baseline is a patch-pinned valid snapshot',()=>{assert.equal(verifyUnitBalanceSnapshot(snap).ok,true);assert.equal(snap.patch,'26.21');assert.ok(snap.source.includes('LOCAL_ENGINE'));});
test('baseline values match authoritative engine code and exclude guessed tower attack damage',()=>{
 assert.ok(bytes.includes('melee:{hp:465,damage:18,range:.014,speed:.0130,interval:1.6}'));
 assert.ok(bytes.includes("o.id.endsWith('_t1')?9000:o.id.endsWith('_t2')?5000:4750"));
 assert.equal(snap.units.turret_outer.hp,9000);assert.equal(snap.units.melee.hp,465);assert.equal('damage' in snap.units.turret_outer,false);
});
test('future unit patch differences are staged, not applied to the live engine',()=>{
 const changed=structuredClone(snap);changed.patch='26.22';changed.units.melee.hp+=30;changed.units.turret_outer.armor+=5;
 const report=compareUnitBalance(snap,changed);assert.equal(report.changes.length,2);assert.equal(report.status,'NOT_APPLIED');assert.equal(report.engineActivated,false);assert.ok(report.requiredQA.includes('baron_buffed_minions'));assert.ok(report.requiredQA.includes('herald_charge_and_turret_damage'));
});
test('invalid unit stats or missing archetypes fail hard',()=>{
 const bad=structuredClone(snap);bad.units.melee.hp=-2;assert.ok(!verifyUnitBalanceSnapshot(bad).ok);
 const missing=structuredClone(snap);delete missing.units.turret_nexus;assert.ok(verifyUnitBalanceSnapshot(missing).errors.includes('MISSING_UNIT:turret_nexus'));
});
test('CLI rejects partial official input and does not modify engine or browser',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'coach-dev35-'));try{const file=path.join(dir,'fake.json'),out=path.join(dir,'stage.json');fs.writeFileSync(file,JSON.stringify(example(25)));
  const original=fs.readFileSync(path.join(root,'engine.mjs'));const cmd=spawnSync(process.execPath,['tools/catalog_unified_v453_dev35.mjs','stage','--items',file,'--output',out],{cwd:root,encoding:'utf8'});
  assert.notEqual(cmd.status,0);assert.equal(fs.existsSync(out),false);assert.ok(fs.readFileSync(path.join(root,'engine.mjs')).equals(original));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('CLI stages complete controlled fixture only as reference without combat activation',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'coach-dev35-'));try{const file=path.join(dir,'fixture.json'),out=path.join(dir,'stage.json');fs.writeFileSync(file,JSON.stringify(example()));
  const cmd=spawnSync(process.execPath,['tools/catalog_unified_v453_dev35.mjs','stage','--items',file,'--output',out],{cwd:root,encoding:'utf8'});assert.equal(cmd.status,0,cmd.stderr);
  const staged=JSON.parse(fs.readFileSync(out));assert.equal(staged.validation.total,170);assert.equal(staged.status,'REFERENCE_ONLY_NOT_GAME_RULES');assert.equal(staged.validation.readyForLiveActivation,false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
console.log(`DEV35 ${passed}/${passed} PASS`);
