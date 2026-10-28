import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const require=createRequire(import.meta.url);
const pg=require('../postgame.js');
const read=n=>readFileSync(new URL('../'+n,import.meta.url),'utf8');
const map=JSON.parse(read('data/coachlol_map_v6.json')),mask=JSON.parse(read('data/masks_128.json'));
const game=new Arena(map,mask,{seed:43,roundSeconds:10});
let passed=0;
function test(label,fn){fn();passed++;console.log('✓ POSTGAME DEV6 '+label);}
test('modelo usa KDA e saldo real por jogador; telemetria dev7 é autoritativa',()=>{
 const m=pg.model(game);
 assert.equal(m.players.length,10);assert.equal(m.teams.length,2);
 assert.equal(m.teams[0].gold,game.units.filter(u=>u.team==='blue').reduce((a,u)=>a+u.gold,0));assert.equal(m.teams[1].gold,game.units.filter(u=>u.team==='red').reduce((a,u)=>a+u.gold,0));
 assert.equal(m.teams[0].kills,0);assert.equal(m.players[0].cs,0);
 assert.equal(Object.hasOwn(m.players[0],'damage'),false);
 assert.equal(Object.hasOwn(m.players[0],'goldEarned'),true);assert.ok(m.players[0].goldEarned>=0,'histórico real de ouro presente na dev7');
 assert.equal(m.players.filter(p=>p.team==='blue').length,5);
});
test('filtros por equipe/função/métrica e classificação são estáveis',()=>{
 const j=game.units.find(u=>u.team==='blue'&&u.role==='JG');
 j.kills=4;j.assists=1;game.teams.blue.kills=6;
 const mid=game.units.find(u=>u.team==='blue'&&u.role==='MID');mid.kills=2;mid.assists=2;
 const data=pg.model(game);
 const sorted=pg.filteredPlayers(data,{team:'blue',role:'all',metric:'kills',sort:'desc'});
 assert.equal(sorted.length,5);assert.equal(sorted[0].role,'JG');
 assert.equal(pg.filteredPlayers(data,{team:'red',role:'ADC',metric:'kills',sort:'desc'}).length,1);
 assert.equal(pg.filteredPlayers(data,{team:'blue',role:'MID',metric:'kills',sort:'desc'})[0].champ,mid.champ);
 assert.equal(pg.filteredPlayers(data,{team:'blue',role:'all',metric:'kills',sort:'asc'})[0].kills,0);
 assert.equal(Math.round(sorted[0].kda),83);
});
test('ledgers fornecem timeline real ordenada e snapshot conserva informação',()=>{
 game.objectiveLedgerV44=[{time:210,objective:'dragon',owner:'blue',finisherId:'blue_JG',smiteSecured:true},{time:170,objective:'herald',owner:'red',finisherId:'red_JG'}];
 game.events.unshift({id:'manual',time:190,team:'red',kind:'death',text:'Morte registrada',unitId:'red_MID'});
 const model=pg.model(game);
 assert.deepEqual(model.timeline.map(e=>e.time),[170,190,210]);
 assert.equal(model.teams.find(t=>t.team==='blue').objectives,1);
 const b=Arena.fromSnapshotV40(map,mask,game.snapshotV40());
 assert.deepEqual(pg.model(b).timeline,model.timeline);
});
test('cinco abas, seletor de métrica, equipe, função, categorias e indicação de dados indisponíveis',()=>{
 const model=pg.model(game),state=pg.newState();
 assert.deepEqual(Object.keys(state.filters),['team','role','metric','sort']);
 const a=pg.render(model,state);
 for(const tab of ['scoreboard','overview','stats','graphs','runes'])assert.match(a,new RegExp('data-pg-tab="'+tab+'"'));
 assert.match(a,/Ouro = saldo atual/);
 state.tab='graphs';const b=pg.render(model,state);
 assert.match(b,/data-pg-filter="metric"/);assert.match(b,/data-pg-filter="team"/);assert.match(b,/data-pg-filter="role"/);assert.match(b,/data-pg-filter="sort"/);
 state.tab='stats';const c=pg.render(model,state);assert.match(c,/data-pg-category="combat"/);assert.match(c,/data-pg-category="economy"/);assert.match(c,/data-pg-category="vision"/);
 state.tab='overview';const d=pg.render(model,state);assert.match(d,/Dragão/);assert.match(d,/Arauto/);
 state.tab='runes';const e=pg.render(model,state);assert.match(e,/Runas configuradas/);assert.match(e,/Não personalizada/);
});
test('integração real das cinco abas no client e sem modificações da engine',()=>{
 const html=read('index.html'),app=read('app.js');
 assert.match(html,/postgame\.css/);assert.match(html,/<script src="postgame\.js"><\/script>/);
 assert.ok(html.indexOf('postgame.js')<html.indexOf('app.js'));
 assert.match(app,/window\.CoachPostgame\.mount\(match,\$\('resultTables'\)\)/);
 assert.ok(existsSync(new URL('../postgame.css',import.meta.url)));
 assert.equal(game.ended,false);
});
console.log(`V4.5.2d-4-dev6 POSTGAME ${passed}/5 PASS`);
