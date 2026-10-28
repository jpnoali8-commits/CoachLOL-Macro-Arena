import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const json=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const fresh=()=>new Arena(json('coachlol_map_v6.json'),json('masks_128.json'),{mode:'manual'});
const test=(name,callback)=>{callback();console.log('✓ '+name)};
function duel(a){
 const u=a.units.find(x=>x.id==='blue_MID'),enemy=a.units.find(x=>x.id==='red_MID');
 u.x=.5;u.y=.5;enemy.x=.504;enemy.y=.5;u.range=.085;u.skillRanks.Q=1;u.skillRanks.W=1;u.skillRanks.E=1;u.mana=500;
 a.gameTime=200;a.phase='planning';a.visible=()=>true;
 a.duelRequests[a.duelKey(u,enemy)]={key:a.duelKey(u,enemy),state:'ready',until:230,initiator:u.id,responder:enemy.id};
 return {u,enemy};
}
test('Fila Q-W-E funciona mesmo com ataques básicos desativados',()=>{
 const a=fresh(),{u,enemy}=duel(a);u.autoAttack=false;
 assert.equal(a.setOrder('blue',u.id,{kind:'attack',targetId:enemy.id,combo:['Q','W','E'],combatStyle:'combo'}).ok,true);
 const hp=enemy.hp;for(let t=200;t<=202;t++){a.gameTime=t;a.resolveCombat();}
 assert.equal(u.order.comboIndex,3);assert.equal(u.order.comboStatus,'concluído');assert.ok(enemy.hp<hp);
 for(let t=203;t<=208;t++){a.gameTime=t;a.resolveCombat()}
 assert.equal(u.order.comboIndex,3,'não reinicia sequência');
});
test('Cooldown não ignora habilidade em fila, AA continua normal',()=>{
 const a=fresh(),{u,enemy}=duel(a);u.autoAttack=true;u.skillCds.Q=206;
 assert.equal(a.setOrder('blue',u.id,{kind:'attack',targetId:enemy.id,combo:['Q','W'],combatStyle:'combo'}).ok,true);
 const hp=enemy.hp;a.resolveCombat();assert.equal(u.order.comboIndex,0);assert.match(u.order.comboStatus,/recarga/);
 assert.ok(enemy.hp<hp,'AA deve continuar sem travar durante o cooldown');
 a.gameTime=206;a.resolveCombat();assert.equal(u.order.comboIndex,1);a.gameTime=207;a.resolveCombat();assert.equal(u.order.comboIndex,2);
});
test('Sem mana, fila aguarda e não inventa cast',()=>{
 const a=fresh(),{u,enemy}=duel(a);u.autoAttack=false;u.mana=0;
 a.setOrder('blue',u.id,{kind:'attack',targetId:enemy.id,combo:['Q','W'],combatStyle:'combo'});
 const hp=enemy.hp;a.resolveCombat();assert.equal(u.order.comboIndex,0);assert.equal(enemy.hp,hp);assert.match(u.order.comboStatus,/mana/);
 u.mana=120;a.gameTime++;a.resolveCombat();assert.equal(u.order.comboIndex,1);
});
test('Evolução normal continua respeitando R 6,11,16',()=>{
 const a=fresh(),{u}=duel(a);u.level=5;u.skillPoints=1;
 assert.equal(a.upgradeSkill('blue',u.id,'R').ok,false);u.level=6;
 assert.equal(a.upgradeSkill('blue',u.id,'R').ok,true);
});
test('UI e draft usam provedor versionado oficial com reserva local',()=>{
 const asset=readFileSync(new URL('../riot-assets.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const draft=readFileSync(new URL('../draft.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../styles-v25.css',import.meta.url),'utf8');
 assert.match(asset,/16\.21\.1/);assert.match(asset,/data\/pt_BR\/champion/);
 assert.match(asset,/localFallback/);assert.match(html,/styles-v25.css/);assert.match(draft,/championPortrait/);assert.match(css,/\.abilityIcon/);
});
console.log('5 novos contratos v2.5 aprovados');
