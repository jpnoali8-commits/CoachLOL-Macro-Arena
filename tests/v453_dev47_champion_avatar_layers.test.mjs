import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Arena} from '../engine.mjs';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const start=source.indexOf('function championAvatarOrderV453Dev47(units)');
const end=source.indexOf('function drawImageFit(',start);
assert.ok(start>=0&&end>start,'client avatar ordering must exist');
const order=vm.runInNewContext(`${source.slice(start,end)}\nchampionAvatarOrderV453Dev47`,{});
const actors=[
 {id:'blue_alive',team:'blue',hp:100},
 {id:'blue_dead',team:'blue',hp:0,deadUntil:30},
 {id:'red_alive',team:'red',hp:75},
 {id:'red_dead',team:'red',hp:0,deadUntil:20},
 {id:'blue_alive_2',team:'blue',hp:90}
];
assert.deepEqual(Array.from(order(actors),u=>u.id),[
 'blue_dead','red_dead','blue_alive','red_alive','blue_alive_2'
],'all dead champion portraits must paint before all living portraits');
assert.deepEqual(Array.from(actors,u=>u.id),['blue_alive','blue_dead','red_alive','red_dead','blue_alive_2'],
 'sorting must not mutate authoritative team or unit order');
assert.ok(source.includes('for(const u of championAvatarOrderV453Dev47(shot.units))'),'map must use ordered projection');
assert.ok(source.includes("ctx.filter='grayscale(1) brightness(.46)'"),'dead avatars must have a visual grayscale filter');
assert.ok(source.includes('u.deadUntil-match.gameTime'),'respawn must come from authoritative clock');
assert.ok(source.indexOf('if(u.hp<=0){',source.indexOf('for(const u of championAvatarOrderV453Dev47(shot.units))'))<
 source.indexOf('drawCircle(p.x,p.y,isSelected?',source.indexOf('for(const u of championAvatarOrderV453Dev47(shot.units))')),
 'dead layer must be painted before living avatars');

const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=load('coachlol_map_v6.json'),mask=load('masks_128.json'),manifest=load('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;
map.riftBundlesV452d4=manifest.variants;
map.scryerConeMaskV452d4=manifest.scryerConeMask;
const arena=new Arena(map,mask,{seed:47});
const blue=arena.units.find(u=>u.team==='blue');
const red=arena.units.find(u=>u.team==='red');
blue.hp=0;blue.deadUntil=arena.gameTime+24;
red.hp=0;red.deadUntil=arena.gameTime+24;
const perspective=arena.perspective('blue');
assert.ok(perspective.units.some(u=>u.id===blue.id&&u.deadUntil===blue.deadUntil),
 'own dead champions retain respawn data in the private projection');
assert.ok(!perspective.units.some(u=>u.id===red.id),
 'enemy death must not reveal unseen enemy position on the map');
console.log('DEV47 AVATAR LAYERS 8/8 PASS');
