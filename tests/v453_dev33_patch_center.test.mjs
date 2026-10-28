import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {selectLatestCompatible} from '../tools/check_riot_patch_v453_dev33.mjs';
import {patchFromDataDragon,normalizePatch,diffPatches,buildReviewQueue} from '../tools/patch_center_v453_dev33.mjs';
const ROOT=new URL('..',import.meta.url).pathname;
const log=(name,fn)=>{fn();console.log('✓ PATCH CENTER '+name);};
const rawItem=(version='16.21.1')=>({version,data:{'1058':{name:'Needlessly Large Rod',gold:{total:1200,base:1200,sell:840,purchasable:true},maps:{'11':true},stats:{FlatMagicDamageMod:65},into:['3089'],description:'Rod'},'3089':{name:'Rabadon',gold:{total:3500,base:1100,purchasable:true},maps:{'11':true},stats:{FlatMagicDamageMod:130},from:['1058','1058'],description:'Bonus AP passiva'}}});
const rawChampion=(version='16.21.1')=>({version,data:{Ahri:{id:'Ahri',name:'Ahri',key:'103',stats:{hp:590,mp:418,attackdamage:53,hpperlevel:104,armor:21}}}});
const detail=(version='16.21.1',cooldown=8)=>({version,data:{Ahri:{passive:{name:'Essence Theft',description:'Heals'},spells:[{id:'AhriQ',name:'Orb of Deception',cooldown:[cooldown,7,6,5,4],cooldownBurn:String(cooldown),cost:[65],costBurn:'65',range:[900],rangeBurn:'900',description:'Deals damage'},{id:'AhriW',name:'Fox-Fire',cooldown:[9],cooldownBurn:'9',description:'Fire'}]}}});
const make=(v='16.21.1',cd=8)=>normalizePatch({items:rawItem(v),champions:rawChampion(v),details:{Ahri:detail(v,cd)},version:v,strict:false});
log('patch normalization and pinned official version',()=>{
 assert.equal(patchFromDataDragon('16.21.1'),'26.21');
 assert.equal(patchFromDataDragon('16.22.1'),'26.22');
 assert.equal(make().status,'reference_staged_unapproved');
 assert.equal(make().validation.certifiedForCombat,false);
 assert.deepEqual(make().items['3089'].components,['1058','1058']);
 assert.deepEqual(make().champions.Ahri.spells.map(s=>s.slot),['Q','W']);
});
log('version mismatch and incomplete payload cannot silently be activated',()=>{
 assert.throws(()=>normalizePatch({items:rawItem(),champions:rawChampion(),version:'16.22.1',strict:false}),/incompatível/);
 assert.throws(()=>normalizePatch({items:rawItem(),champions:rawChampion(),version:'16.21.1',strict:true}),/incompleto/);
 assert.throws(()=>normalizePatch({items:rawItem(),champions:rawChampion(),details:{Ahri:detail('16.20.1')},version:'16.21.1',strict:false}),/outro patch/);
});
log('cost, nested recipe, AP, champion HP and spell cooldown independently diff',()=>{
 const before=make(),after=make('16.22.1',7);
 const newItem={...rawItem('16.22.1')};after.items['3089'].cost=3400;after.items['3089'].components=['1058'];after.items['3089'].stats.FlatMagicDamageMod=125;
 after.champions.Ahri.stats.hp=600;
 const diff=diffPatches(before,after),categories=new Set(diff.changes.map(c=>c.category));
 for(const item of ['gold','recipe','numeric','skill'])assert.ok(categories.has(item),item);
 assert.equal(diff.automaticCombatActivation,false);
 assert.ok(diff.changes.some(c=>c.field==='spells.Q'));
 assert.ok(diff.changes.some(c=>c.id==='3089'&&c.field==='components'));
 const queue=buildReviewQueue(diff);
 assert.equal(queue.pending.length,diff.changes.length);
 assert.ok(queue.pending.every(x=>x.decision==='pending'));
 assert.equal(queue.activation,'BLOCKED_UNTIL_APPROVED_AND_TESTED');
});
log('passive text hashes change but text itself is not injected as executable effect',()=>{
 const before=make(),after=make('16.22.1');after.champions.Ahri.passive.descriptionHash='new-content-hash';
 assert.ok(diffPatches(before,after).changes.some(c=>c.category==='passive'));
});
log('two different snapshots never compare across locales',()=>{
 const a=make(),b=make('16.22.1');b.locale='pt_BR';assert.throws(()=>diffPatches(a,b),/idiomas/);
});
log('batch stage/diff produces files and never edits engine',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'coach-patch-center-'));
 try{
  const write=(name,doc)=>{const f=path.join(dir,name);fs.writeFileSync(f,JSON.stringify(doc));return f;};
  const engine=fs.readFileSync(path.join(ROOT,'engine.mjs'));
  const a=write('a.json',rawItem()),ca=write('ca.json',rawChampion()),b=write('b.json',rawItem('16.22.1')),cb=write('cb.json',rawChampion('16.22.1'));
  const snap1=path.join(dir,'old.json'),snap2=path.join(dir,'new.json'),diff=path.join(dir,'diff.json');
  const run=(args)=>execFileSync(process.execPath,['tools/patch_center_v453_dev33.mjs',...args],{cwd:ROOT,stdio:'pipe'});
  run(['stage','--version','16.21.1','--items',a,'--champions',ca,'--out',snap1,'--allow-sample']);
  run(['stage','--version','16.22.1','--items',b,'--champions',cb,'--out',snap2,'--allow-sample']);
  assert.throws(()=>run(['stage','--version','16.22.1','--items',b,'--champions',cb,'--out',snap2,'--allow-sample']),/already exists|Command failed/);
  run(['diff','--from',snap1,'--to',snap2,'--out',diff]);
  assert.equal(JSON.parse(fs.readFileSync(diff)).status,'pending_manual_review');
  assert.ok(fs.existsSync(diff.replace('.json','_review.json')));
  assert.equal(Buffer.compare(fs.readFileSync(path.join(ROOT,'engine.mjs')),engine),0);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
log('scheduled release detection remains a one-shot, no combat mutation',()=>{
 const a=selectLatestCompatible(['16.21.1','16.20.1'],'16.21.1');assert.equal(a.hasUpdate,false);
 const b=selectLatestCompatible(['16.22.1','16.21.1'],'16.21.1');assert.equal(b.hasUpdate,true);assert.equal(b.patch,'26.22');
 assert.throws(()=>selectLatestCompatible([], '16.21.1'),/vazia/);
});
console.log('PATCH CENTER 7/7 PASS');
