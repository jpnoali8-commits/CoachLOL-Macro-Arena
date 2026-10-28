import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),manifest=load('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;
map.riftBundlesV452d4=manifest.variants;
map.scryerConeMaskV452d4=manifest.scryerConeMask;
let passed=0;
function test(name,fn){fn();passed++;console.log('✓ DEV47 FLORIVIDENTE '+name);}
const make=()=>new Arena(map,mask,{seed:47,roundSeconds:30});
function setup(){
 const a=make(),site=a.riftAllFeaturesV452d4('scryers')[0];
 const caster=a.units.find(u=>u.team==='blue');caster.x=site.x;caster.y=site.y;
 const position={x:site.x+.13*.5,y:site.y};
 assert.equal(a.riftPulseContainsV452d4({team:'blue',kind:'scryer_bloom',x:site.x,y:site.y,heading:0},position),true);
 return {a,site,caster,position};
}
test('atravessa parede pelo cone pintado, sem alterar paredes reais',()=>{
 const {a,site,caster,position}=setup();
 const original=a.riftLineOfSightWallsV452d4;
 a.riftLineOfSightWallsV452d4=()=>false;
 assert.equal(a.canSeePoint('blue',position,[]),false);
 const ret=a.activateScryerBloomV452d4('blue',caster.id,site.id,0);
 assert.equal(ret.ok,true,ret.reason);
 assert.equal(a.riftVisionPulsesV452d4.at(-1).until,a.gameTime+30);
 assert.equal(a.canSeePoint('blue',position,[]),true);
 assert.equal(a.canSeePoint('red',position,[]),false);
 // Ordinary wall collision is unchanged; no permanent mask writes.
 assert.equal(a.riftLineOfSightWallsV452d4(position,site),false);
 a.riftLineOfSightWallsV452d4=original;
});
test('revela inimigo em moita sem expor o lado oposto ou fora do cone',()=>{
 const {a,site,caster,position}=setup();
 const enemy=a.units.find(u=>u.team==='red');enemy.x=position.x;enemy.y=position.y;
 a.brushRegionAt=(x)=>x===site.x?2:1;
 a.lineOfSight=()=>true;
 assert.equal(a.visible('blue',enemy,[]),false);
 assert.equal(a.activateScryerBloomV452d4('blue',caster.id,site.id,0).ok,true);
 assert.equal(a.visible('blue',enemy,[]),true);
 assert.equal(a.canSeePoint('red',position,[]),false);
 assert.equal(a.canSeePoint('blue',{x:site.x-.06,y:site.y},[]),false);
});
test('a visao dura uma rodada de 30 s e expira sem remover o respawn',()=>{
 const {a,site,caster,position}=setup();
 const result=a.activateScryerBloomV452d4('blue',caster.id,site.id,0);
 assert.ok(result.ok);const snap=a.snapshotV40();
 const b=Arena.fromSnapshotV40(map,mask,snap);
 assert.equal(b.canSeePoint('blue',position,[]),true);
 b.gameTime=29;assert.equal(b.canSeePoint('blue',position,[]),true);
 b.gameTime=30;assert.equal(b.canSeePoint('blue',position,[]),false);
 assert.ok(b.riftPlantTimersV452d4[site.id]>30);
});
test('florividente nao transforma o florividente Quimtec em visao global',()=>{
 const {a,site,caster,position}=setup();
 a.riftLineOfSightWallsV452d4=()=>false;
 const pulse={team:'blue',x:site.x,y:site.y,heading:0,until:30,kind:'firelight_bloom'};
 assert.equal(a.riftPulseContainsV452d4(pulse,position),false);
 assert.equal(a.activateScryerBloomV452d4('blue',caster.id,site.id,0).ok,true);
 assert.equal(a.riftPulseContainsV452d4(a.riftVisionPulsesV452d4.at(-1),position),true);
});
console.log(`DEV47 FLORIVIDENTE ${passed}/4 PASS`);
