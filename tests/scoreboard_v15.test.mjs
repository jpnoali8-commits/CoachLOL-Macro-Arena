import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const map=JSON.parse(readFileSync(new URL('../data/coachlol_map_v6.json',import.meta.url)));
const masks=JSON.parse(readFileSync(new URL('../data/masks_128.json',import.meta.url)));
let count=0;
function test(label,check){check();count++;console.log('✓',label);}
function make(){const m=new Arena(map,masks,{mode:'manual'});m.structures=[];m.minions=[];for(const u of m.units){u.autoAttack=false;u.autoFollow=false;u.autoJungle=false;}return m;}
test('10 personagens começam com K/D/A zero e SUP com item inicial de função',()=>{
 const m=make();assert.equal(m.units.length,10);
 for(const u of m.units){assert.deepEqual([u.kills,u.deaths,u.assists],[0,0,0]);assert.deepEqual(u.items,u.role==='SUP'?['support_atlas']:[]);}
});
test('abate conta uma morte, um frag, uma assistência de aliado e ouro',()=>{
 const m=make(),killer=m.units.find(u=>u.id==='blue_ADC'),helper=m.units.find(u=>u.id==='blue_SUP'),enemy=m.units.find(u=>u.id==='red_ADC');
 m.gameTime=25;
 m.damage(enemy,35,helper);m.damage(enemy,enemy.hp+999,killer);
 assert.deepEqual([killer.kills,helper.assists,enemy.deaths,m.teams.blue.kills],[1,1,1,1]);
 assert.equal(killer.gold,800);
 m.damage(enemy,100,killer);assert.deepEqual([killer.kills,enemy.deaths],[1,1], 'não duplica uma morte');
});
test('assistências não contam participantes antigos, inimigos ou o próprio executor',()=>{
 const m=make(),killer=m.units.find(u=>u.id==='blue_ADC'),helper=m.units.find(u=>u.id==='blue_SUP'),enemy=m.units.find(u=>u.id==='red_ADC');
 m.gameTime=1;m.damage(enemy,18,helper);m.gameTime=25;m.damage(enemy,enemy.hp+999,killer);
 assert.equal(helper.assists,0);assert.equal(killer.assists,0);assert.equal(enemy.deaths,1);
});
test('partida salva restaura inventários e KDA serializados',()=>{
 const m=make(),u=m.units.find(u=>u.id==='blue_ADC');u.kills=3;u.deaths=1;u.assists=5;u.items=['boots','long_sword'];
 const data=JSON.parse(JSON.stringify(m.units));assert.equal(data.find(v=>v.id==='blue_ADC').items.length,2);
 assert.deepEqual([data.find(v=>v.id==='blue_ADC').kills,data.find(v=>v.id==='blue_ADC').deaths,data.find(v=>v.id==='blue_ADC').assists],[3,1,5]);
});
test('UI possui botão placar, modal e atalho Tab que previne focus default',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const script=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.ok(html.includes('id="scoreboardOpen"')&&html.includes('id="scoreboardOverlay"')&&html.includes('id="scoreboardClose"'));
 assert.ok(script.includes("e.key==='Tab'")&&script.includes('e.preventDefault();if(!e.repeat)setScoreboardOpen(!scoreboardOpen)'));
 assert.ok(script.includes("scoreboardItems(unit)"));
});
console.log(`${count} testes de scoreboard v1.5 aprovados`);
