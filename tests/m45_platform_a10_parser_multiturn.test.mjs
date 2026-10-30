/**
 * M45 A10: PT-BR browser/Node compiler parity + two PvP rounds persistence.
 * SOURCE PIN: integration 374d87d5f49b52514ec68bbe666df086363c1ec5
 * Node: node tests/m45_platform_a10_parser_multiturn.test.mjs
 * Source compiler browser blob 2bfdfb77d7ea83aacdb62ef70623b0601ad47de8.
 * No speech/microphone or Rust gameplay is run here.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Arena,checksumV40} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
import {PvPRoomV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const browser=readFileSync(new URL('../commands.browser.js',import.meta.url),'utf8');
const blob=createHash('sha1').update('blob '+Buffer.byteLength(browser)+String.fromCharCode(0)).update(browser).digest('hex');
assert.equal(blob,'2bfdfb77d7ea83aacdb62ef70623b0601ad47de8','Browser compiler changed');
const shim={};Function('window',browser)(shim);
const browserCompiler=shim.CoachCommands;
assert.ok(browserCompiler?.interpretCommands&&browserCompiler?.applyCommands);
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
map.riftBaseFeaturesV452d4=manifest.baseFeatures;
map.riftBundlesV452d4=manifest.variants;
const arena=new Arena(map,mask,{mode:'pvp',seed:20261030});
const blue={seatId:'p1',team:'blue',role:'MID',unitId:'blue_MID',tokenHash:'fixture-blue'},
 red={seatId:'p2',team:'red',role:'MID',unitId:'red_MID',tokenHash:'fixture-red'};
const room=new PvPRoomV453Dev47({id:'a10a1010',arena,restored:{players:[blue,red]},checkpointPath:null});
let n=0;function check(name,fn){fn();n++;console.log('PASS A10 PERSIST '+name);}
const sampleTexts=[
 'MID farmar safe, sem trocar','JG red de baixo depois krugs de baixo',
 'ADC kite com AA','SUP dar peel no ADC; ADC farmar seguro',
 'TOP freezar wave; MID farmar safe','JG guardar smite'
];
check('01 compiler parity across six phrases and both teams',()=>{
 for(const team of ['blue','red'])for(const s of sampleTexts){
  assert.deepEqual(browserCompiler.interpretCommands(s,arena,{team}),interpretCommands(s,arena,{team}),team+': '+s);
 }
});
check('02 unknown role and blank input rejected identically',()=>{
 for(const t of ['xzzzz cometa sol','']){
  assert.deepEqual(browserCompiler.interpretCommands(t,arena,{team:'blue'}),interpretCommands(t,arena,{team:'blue'}));
  assert.equal(interpretCommands(t,arena,{team:'blue'}).ok,false);
 }
});
check('03 preview only: never mutate full Arena',()=>{
 const before=checksumV40(arena.snapshotV40());
 const draft=interpretCommands('MID farmar safe; JG guardar smite',arena,{team:'blue'});
 assert.equal(draft.ok,true);assert.equal(checksumV40(arena.snapshotV40()),before);
});
check('04 applying blue plan mutates no red champion',()=>{
 const redHash=checksumV40(arena.units.filter(u=>u.team==='red'));
 const p=interpretCommands('MID farmar safe; JG guardar smite',arena,{team:'blue'});
 assert.equal(applyCommands(p,arena,{team:'blue'}).ok,true);
 assert.equal(checksumV40(arena.units.filter(u=>u.team==='red')),redHash);
});
check('05 applying red plan mutates no blue champion',()=>{
 const blueHash=checksumV40(arena.units.filter(u=>u.team==='blue'));
 const p=interpretCommands('TOP freezar wave; ADC kite com AA',arena,{team:'red'});
 assert.equal(browserCompiler.applyCommands(p,arena,{team:'red'}).ok,true);
 assert.equal(checksumV40(arena.units.filter(u=>u.team==='blue')),blueHash);
});
const current=id=>arena.units.find(u=>u.id===id);
check('06 original persistent intent is typed and owned',()=>{
 assert.equal(current('blue_MID').policy,'safe');
 assert.equal(current('blue_MID').order.kind,'farm');
 assert.equal(current('blue_JG').smitePolicy.mode,'hold');
 assert.equal(current('red_TOP').tactics.wave,'freeze');
 assert.equal(current('red_ADC').combatStyle,'kite');
});
check('07 room ready locks gateway but offline applyCommands does not see seat lock',()=>{
 const before=arena.gameTime;
 assert.equal(room.confirm(blue).ok,true);
 assert.equal(arena.gameTime,before);
 assert.equal(room.ready.has('p1'),true);
 assert.equal(arena.teams.blue.ready,false,'legacy room tracks ready separately from Arena');
 const denied=room.command(blue,{sequence:1,kind:'order.stop',unitId:'blue_MID',payload:{}});
 assert.equal(denied.reason,'turno_bloqueado');
 const after=interpretCommands('MID farmar safe',arena,{team:'blue'});
 // Known gap if offline helper is ever attached to online commands: it can still mutate.
 assert.equal(applyCommands(after,arena,{team:'blue'}).ok,true);
});
check('08 second ready starts turn, no unilateral simulation',()=>{
 assert.equal(room.confirm(red).ok,true);
 assert.equal(arena.phase,'executing');
});
function runToPlanning(){
 let steps=0;
 while(arena.phase==='executing'&&steps<12){
  const result=room.advance(5);assert.equal(result.ok,true,JSON.stringify(result));steps++;
 }
 assert.equal(arena.phase,'planning','unexpected paused match');
 return steps;
}
check('09 first 30s turn reaches round two deterministically',()=>{
 assert.equal(runToPlanning(),6);assert.equal(arena.round,2);
 assert.equal(arena.gameTime,30);
});
check('10 key text intents survive one resolution',()=>{
 assert.equal(current('blue_MID').policy,'safe');
 assert.equal(current('blue_MID').order.kind,'farm');
 assert.equal(current('blue_JG').smitePolicy.mode,'hold');
 assert.equal(current('red_TOP').tactics.wave,'freeze');
 assert.equal(current('red_ADC').combatStyle,'kite');
});
check('11 server-only checkpoint restores persistent intentions',()=>{
 const checkpoint=room.checkpoint();
 const restored=Arena.fromSnapshotV40(map,mask,checkpoint.arena);
 const recover=new PvPRoomV453Dev47({id:room.id,arena:restored,restored:checkpoint,checkpointPath:null});
 assert.equal(recover.arena.units.find(x=>x.id==='blue_MID').order.kind,'farm');
 assert.equal(recover.arena.units.find(x=>x.id==='blue_JG').smitePolicy.mode,'hold');
 assert.equal(recover.arena.units.find(x=>x.id==='red_TOP').tactics.wave,'freeze');
 assert.equal(recover.arena.units.find(x=>x.id==='red_ADC').combatStyle,'kite');
});
check('12 second full human round retains persistent text intentions',()=>{
 assert.equal(room.confirm(blue).ok,true);
 assert.equal(room.confirm(red).ok,true);
 assert.equal(runToPlanning(),6);
 assert.equal(arena.round,3);assert.equal(arena.gameTime,60);
 assert.equal(current('blue_MID').policy,'safe');
 assert.equal(current('blue_MID').order.kind,'farm');
 assert.equal(current('blue_JG').smitePolicy.mode,'hold');
 assert.equal(current('red_ADC').combatStyle,'kite');
});
check('13 text preview is NOT a privileged multiplayer action packet',()=>{
 const rejected=room.gateway.submit('p1',{sequence:1,unitId:'blue_MID',kind:'text_plan',payload:{text:'MID farmar safe'}});
 assert.equal(rejected.ok,false);assert.equal(rejected.reason,'comando_invalido');
});
check('14 byte-pinned PvP frontend has no PTBR/voice integration',()=>{
 const client=readFileSync(new URL('../multiplayer/pvp_client_v453_dev47.js',import.meta.url),'utf8');
 const hash=createHash('sha1').update('blob '+Buffer.byteLength(client)+String.fromCharCode(0)).update(client).digest('hex');
 assert.equal(hash,'43f42ef9e9022db8aa3cb96a299e8ed69d8522f3');
 assert.equal(/\bCoachCommands\b|\binterpretCommands\b|SpeechRecognition|webkitSpeechRecognition|voiceLocal/.test(client),false);
});
console.log('M45 A10 '+n+'/14 SOURCE_PINNED_BROWSER_PARSER_AND_TWO_PVP_ROUNDS_V8; RUST NOT_RUN');
