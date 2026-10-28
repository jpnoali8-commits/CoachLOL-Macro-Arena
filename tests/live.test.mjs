import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const map=JSON.parse(readFileSync(new URL('../data/coachlol_map_v6.json',import.meta.url)));
const mask=JSON.parse(readFileSync(new URL('../data/masks_128.json',import.meta.url)));
const fresh=()=>new Arena(map,mask,{mode:'bot',decisionSeconds:30,seed:17});
let n=0;
function test(name,fn){fn();n++;console.log('✓',name)}
test('mundo ao vivo avança sem confirmação enquanto jogador planeja',()=>{
 const s=fresh();s.startLiveWindow();assert.equal(s.gameTime,0);assert.equal(s.units.length,10);
 const b=s.units.find(u=>u.id==='blue_ADC');const p={x:b.x,y:b.y};
 s.advanceLiveWindow(12);
 assert.equal(s.gameTime,12);assert.equal(s.round,1);
 assert.ok(Math.hypot(b.x-p.x,b.y-p.y)>0.00001,'campeão moveu sem clicar em Confirmar');
});
test('o mundo segue mesmo após o bot confirmar',()=>{
 const s=fresh();s.startLiveWindow();assert.equal(s.teams.red.ready,true);
 s.advanceLiveWindow(8);assert.equal(s.gameTime,8);assert.equal(s.teams.blue.ready,false);
});
test('encerramento da janela não reexecuta ticks já vividos',()=>{
 const s=fresh();s.startLiveWindow();s.advanceLiveWindow(10);s.lock('blue');const frame=s.finishLiveWindow();
 assert.equal(frame.seconds,10);assert.equal(s.gameTime,10);assert.equal(s.round,2);
 assert.equal(s.roundHistory.length,1);assert.equal(frame.mode,'live');
 s.startLiveWindow();s.advanceLiveWindow(6);s.lock('blue');s.finishLiveWindow();
 assert.equal(s.gameTime,16);assert.equal(s.round,3);
});
test('a janela respeita limite e encerra com timeout',()=>{
 const s=fresh();s.startLiveWindow();assert.equal(s.advanceLiveWindow(120),30);
 assert.equal(s.advanceLiveWindow(10),0);
 const frame=s.finishLiveWindow({timeout:true});assert.equal(frame.seconds,30);
});
test('cinco campeões e bot se movimentam sem necessidade de ordens repetidas',()=>{
 const s=fresh();s.startLiveWindow();const old=Object.fromEntries(s.units.map(u=>[u.id,[u.x,u.y]]));
 s.advanceLiveWindow(30);s.lock('blue');s.finishLiveWindow();s.startLiveWindow();s.advanceLiveWindow(30);
 assert.ok(s.units.filter(u=>Math.hypot(u.x-old[u.id][0],u.y-old[u.id][1])>.004).length>=6);
 assert.ok(s.waveIndex>=1);assert.ok(s.minions.length>0);
});
test('interceptação gera aviso e pausa deslocamento apenas dos envolvidos',()=>{
 const s=fresh();s.startLiveWindow();const blue=s.units.find(u=>u.id==='blue_MID'),red=s.units.find(u=>u.id==='red_JG');
 blue.x=.48;blue.y=.48;red.x=.485;red.y=.483;
 // clear masks for precise isolated test; vision and brush restrictions absent
 s.mask={...s.mask,wall:'0'.repeat(mask.wall.length),brush:'0'.repeat(mask.brush.length)};
 s.detectEncounters();
 assert.ok(s.lastTacticalAlerts.some(e=>e.kind==='encounter'&&e.team==='blue'));
 assert.ok(blue.holdUntil>s.gameTime);assert.ok(red.holdUntil>s.gameTime);
 const other=s.units.find(u=>u.id==='blue_ADC');assert.equal(other.holdUntil,0);
});
test('local replay at two equal ticks remains deterministic',()=>{
 const a=fresh(),b=fresh();for(const s of [a,b]){s.startLiveWindow();s.advanceLiveWindow(19);s.lock('blue');s.finishLiveWindow();s.startLiveWindow();s.advanceLiveWindow(15);}
 const normalize=s=>JSON.stringify({t:s.gameTime,units:s.units,mc:s.minions,events:s.events,teams:s.teams});
 assert.equal(normalize(a),normalize(b));
});
// Brush visual mask and enemy reveal must share the same concealment rule.
test('moita impede visão externa; entrar na mesma moita revela',()=>{
 const s=fresh(),size=mask.size;
 const cm={...mask,wall:'0'.repeat(size*size),brush:'0'.repeat(size*size)};
 const bits=cm.brush.split('');
 for(let y=58;y<66;y++)for(let x=58;x<66;x++)bits[y*size+x]='1';
 cm.brush=bits.join('');s.mask=cm;s.structures=[];s.minions=[];s.wards=[];
 const blue=s.units.find(u=>u.id==='blue_TOP'),red=s.units.find(u=>u.id==='red_TOP');
 for(const u of s.units){if(u!==blue&&u!==red){u.x=.10;u.y=.10;}}
 blue.x=.43;blue.y=.48;red.x=.48;red.y=.48;
 assert.equal(s.canSeePoint('blue',red),false);
 assert.equal(s.visible('blue',red),false);
 blue.x=.475;blue.y=.48;
 assert.equal(s.canSeePoint('blue',red),true);
 assert.equal(s.visible('blue',red),true);
});

console.log(`${n} testes live aprovados`);
