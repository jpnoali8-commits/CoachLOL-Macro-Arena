/**
 * M45 PLATFORM-A09: PT-BR offline parser oracle against full real legacy Arena.
 * Run: node tests/m45_platform_a09_ptbr_parser_contract.test.mjs
 * commands.mjs source blob 671df897b0b9b18b75b3a996fb2b2294edc63c39.
 * The legacy browser parser is NOT an authenticated network command endpoint.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,checksumV40} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json'),manifest=data('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;map.riftBundlesV452d4=manifest.variants;
let seed=5912,count=0;
const arena=()=>new Arena(map,mask,{mode:'pvp',seed:seed++});
const preview=(text,team='blue',a=arena())=>interpretCommands(text,a,{team});
function check(label,fn){fn();count++;console.log('PASS A09 PTBR '+label);}
check('01 empty orders explicitly rejected',()=>{
 const v=preview('');assert.equal(v.ok,false);assert.ok(v.errors.some(e=>e.includes('Digite')));
});
check('02 excessive input length rejected',()=>{
 const v=preview('x'.repeat(1801));assert.equal(v.ok,false);
 assert.ok(v.errors.some(e=>e.includes('1.800')));
});
check('03 unknown role or champion rejected',()=>{
 const v=preview('xzzzz cometa sol');assert.equal(v.ok,false);assert.equal(v.commands[0].role,null);
});
check('04 team blue MID farm safe compiled',()=>{
 const v=preview('MID farmar safe, sem trocar');
 assert.equal(v.ok,true);assert.deepEqual(v.commands.map(x=>x.role),['MID']);
 assert.ok(v.commands[0].actions.some(x=>x.type==='automation'));
 assert.ok(v.commands[0].actions.some(x=>x.type==='policy'));
});
check('05 red TOP freeze and MID safe compile independently',()=>{
 const v=preview('TOP freezar wave; MID farmar safe','red');
 assert.equal(v.ok,true);assert.deepEqual(v.commands.map(x=>x.role),['TOP','MID']);
 assert.ok(v.commands[0].actions.some(x=>x.type==='tactics'));
});
check('06 JG hold Smite and ADC kite each receive authored action',()=>{
 const v=preview('JG guardar smite; ADC kite com AA');
 assert.equal(v.ok,true);assert.deepEqual(v.commands.map(x=>x.role),['JG','ADC']);
 assert.equal(v.commands[0].actions[0].type,'smitePolicy');
 assert.ok(v.commands[1].actions.some(x=>x.type==='combatStyle'));
});
check('07 jungle red then krugs produces path plan',()=>{
 const v=preview('JG red de baixo depois krugs de baixo');
 assert.equal(v.ok,true);assert.equal(v.commands[0].role,'JG');
 assert.ok(v.commands[0].actions.some(x=>x.type==='plan'));
});
check('08 recall and item purchase remain different actions',()=>{
 const v=preview('ADC recall; MID comprar anel de doran');
 assert.equal(v.ok,true);
 assert.ok(v.commands[0].actions.some(x=>x.type==='order'&&x.payload.kind==='recall'));
 assert.ok(v.commands[1].actions.some(x=>x.type==='buy'));
});
check('09 red SUP peel and ADC farm are scoped to red team',()=>{
 const v=preview('SUP dar peel no ADC; ADC farmar seguro','red');
 assert.equal(v.ok,true);assert.deepEqual(v.commands.map(x=>x.role),['SUP','ADC']);
 assert.ok(v.commands[0].actions.some(x=>x.type==='reaction'));
});
check('10 opponent champion alias does not confer ownership',()=>{
 const v=preview('Jinx kite com AA','red');
 assert.equal(v.ok,false);assert.equal(v.commands[0].role,null);
});
check('11 unknown authenticated team has no valid champions',()=>{
 const a=arena(),v=interpretCommands('MID farmar safe',a,{team:'unknown'});
 assert.equal(v.ok,false);assert.ok(v.errors.length>0);
});
check('12 applying red team plan mutates no blue champion',()=>{
 const a=arena(),before=checksumV40(a.units.filter(u=>u.team==='blue'));
 const red=interpretCommands('TOP freezar wave; MID farmar safe',a,{team:'red'});
 assert.equal(red.ok,true);assert.equal(applyCommands(red,a,{team:'red'}).ok,true);
 assert.equal(checksumV40(a.units.filter(u=>u.team==='blue')),before);
});
check('13 applying blue MID plan mutates no red champion',()=>{
 const a=arena(),before=checksumV40(a.units.filter(u=>u.team==='red'));
 const blue=interpretCommands('MID farmar safe, sem trocar',a,{team:'blue'});
 assert.equal(blue.ok,true);assert.equal(applyCommands(blue,a,{team:'blue'}).ok,true);
 assert.equal(checksumV40(a.units.filter(u=>u.team==='red')),before);
});
check('14 player ready prevents late edit of text commands',()=>{
 const a=arena(),v=interpretCommands('MID farmar safe',a,{team:'blue'});
 assert.equal(v.ok,true);a.teams.blue.ready=true;
 const before=checksumV40(a.units.filter(u=>u.team==='blue'));
 assert.equal(applyCommands(v,a,{team:'blue'}).ok,false);
 assert.equal(checksumV40(a.units.filter(u=>u.team==='blue')),before);
});
check('15 preview cannot be executed if it is invalid',()=>{
 const a=arena(),before=checksumV40(a.snapshotV40());
 const v=interpretCommands('NOT-A-ROLE do impossible command',a,{team:'blue'});
 assert.equal(v.ok,false);assert.equal(applyCommands(v,a,{team:'blue'}).ok,false);
 assert.equal(checksumV40(a.snapshotV40()),before);
});
console.log('M45 A09 '+count+'/15 REAL_PTBR_PARSER_GOLDENS, authenticated PvP gateway remains separate');
