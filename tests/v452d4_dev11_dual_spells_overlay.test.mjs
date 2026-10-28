import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Arena,normalizeSummonerSlotsV452d4Dev11} from '../engine.mjs';
const rd=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const map=JSON.parse(rd('data/coachlol_map_v6.json')),mask=JSON.parse(rd('data/masks_128.json'));
const pairDraft={blue:{JG:'Warwick'},red:{JG:'LeeSin'},summonerSlots:{blue:{TOP:['ignite','tp'],JG:['smite','ghost'],MID:['ghost','barrier'],ADC:['heal','tp'],SUP:['flash','exhaust']},red:{JG:['tp','smite'],MID:['flash','ignite']}},smiteKeys:{blue:'d',red:'f'}};
const create=()=>new Arena(map,mask,{seed:45211,draft:pairDraft,roundSeconds:10});
let n=0;function test(label,fn){fn();n++;console.log('✓ DEV11 '+label)}
test('TOP pode usar Incendiar + TP sem Flash',()=>{
 const a=create(),u=a.units.find(x=>x.id==='blue_TOP');assert.deepEqual(u.summonerSlots,['ignite','tp']);
 assert.equal(a.hasSummonerV452d4Dev11(u,'ignite'),true);assert.equal(a.hasSummonerV452d4Dev11(u,'tp'),true);
 assert.equal(a.hasSummonerV452d4Dev11(u,'flash'),false);
 assert.equal(a.performActionV40({actorId:u.id,kind:'flash',point:{x:u.x,y:u.y}}).ok,false);
 assert.equal(a.queueSummoner('blue',u.id,'tp').ok,true);
});
test('MID pode escolher Fantasma + Barreira e não pode usar Ignite',()=>{
 const a=create(),u=a.units.find(x=>x.id==='blue_MID');assert.deepEqual(u.summonerSlots,['ghost','barrier']);
 assert.equal(a.queueSummoner('blue',u.id,'ghost').ok,true);
 assert.equal(a.queueSummoner('blue',u.id,'ignite').ok,false);
});
test('ADC Heal + TP, ambos acessíveis no motor',()=>{
 const a=create(),u=a.units.find(x=>x.id==='blue_ADC');assert.deepEqual(u.summonerSlots,['heal','tp']);
 assert.equal(a.queueSummoner('blue',u.id,'heal').ok,true);
 assert.equal(a.queueSummoner('blue',u.id,'tp').ok,true);
});
test('JG Smite D + Fantasma F obrigatório, sem Flash',()=>{
 const a=create(),u=a.units.find(x=>x.id==='blue_JG');assert.deepEqual(u.summonerSlots,['smite','ghost']);
 assert.equal(u.smiteKey,'d');assert.equal(a.hasSummonerV452d4Dev11(u,'smite'),true);
 assert.equal(a.queueSummoner('blue',u.id,'ghost').ok,true);
 assert.equal(a.performActionV40({actorId:u.id,kind:'flash',point:{x:u.x,y:u.y}}).ok,false);
});
test('JG do time vermelho recebe Teleporte D + Smite F',()=>{
 const a=create(),u=a.units.find(x=>x.id==='red_JG');assert.deepEqual(u.summonerSlots,['tp','smite']);assert.equal(u.smiteKey,'f');
});
test('evita Smite fora do JG e loadouts duplicados ou inválidos',()=>{
 assert.deepEqual(normalizeSummonerSlotsV452d4Dev11('MID',['smite','tp']),['flash','ignite']);
 assert.deepEqual(normalizeSummonerSlotsV452d4Dev11('JG',['ghost','ignite'],'f'),['flash','smite']);
 assert.deepEqual(normalizeSummonerSlotsV452d4Dev11('ADC',['flash','flash']),['flash','heal']);
 assert.deepEqual(normalizeSummonerSlotsV452d4Dev11('TOP',['tp','ignite']),['tp','ignite']);
});
test('snapshot conserva dois slots e tecla do Golpear',()=>{
 const a=create();const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 for(const u of a.units){const x=b.units.find(v=>v.id===u.id);assert.deepEqual(x.summonerSlots,u.summonerSlots);assert.equal(x.smiteKey,u.smiteKey);}
});
test('draft real contém dois seletores e persiste slots por função',()=>{
 const draft=rd('draft.js'),html=rd('draft.html');
 assert.match(draft,/draftSpellSlotsV452d4Dev11/);assert.match(draft,/draftSpellSelectV452d4Dev11/);
 assert.match(draft,/summonerSlots:\{blue:\{\},red:\{\}\}/);assert.match(draft,/p\.role==='JG'&&!previous\.includes\('smite'\)/);
 assert.match(html,/summonerSlots:ev\.detail\.summonerSlots/);
});
test('Smite 16:9 tem HP, mídia local, teclas imutáveis e botões operantes',()=>{
 const html=rd('index.html'),css=rd('styles.css'),app=rd('app.js');
 for(const id of ['smiteContestHpLabel','smiteContestHpFill','smiteContestMediaStage','smiteContestVideo','smiteContestCast','smiteContestHold'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/class="smiteContestDialog"/);assert.match(css,/aspect-ratio:16\/9/);assert.match(css,/smiteContestContent\{display:grid/);
 assert.match(app,/objectiveMediaV452d4Dev11/);assert.match(app,/smiteContestKey'\)\.disabled=true/);
 assert.ok(existsSync(new URL('../data/smite_media_v452d4_dev11.js',import.meta.url)));
});
test('draft antigo preserva Flash + secundário e JG Golpear F',()=>{
 const a=new Arena(map,mask,{seed:2,draft:{spells:{blue:{MID:'ghost'}}}});
 assert.deepEqual(a.units.find(x=>x.id==='blue_MID').summonerSlots,['flash','ghost']);
 assert.deepEqual(a.units.find(x=>x.id==='blue_JG').summonerSlots,['flash','smite']);
});
console.log(`DEV11 DUAL SUMMONER ${n}/10 PASS`);
