import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Arena,CHAMPION_BASE_AA_RANGE,baseAttackRangeWorld,skillRankCap} from '../engine.mjs';
const file=n=>readFileSync(new URL('../'+n,import.meta.url),'utf8');
const map=JSON.parse(file('data/coachlol_map_v6.json'));
const mask=JSON.parse(file('data/masks_128.json'));
const game=new Arena(map,mask,{roundSeconds:10});
for(const champ of ['Volibear','Warwick','Ahri','Jinx','Nami','Darius','LeeSin','Vex','Caitlyn','Leona']){
 const unit=game.units.find(u=>u.champ===champ);assert.ok(unit,champ);
 assert.equal(unit.range,CHAMPION_BASE_AA_RANGE[champ]/15000,`${champ}: AA range engine calibrated to champion baseline`);
}
console.log('✓ 10 campeões do elenco: base AA range alinhado ao motor');
const j=game.units.find(u=>u.champ==='Jinx');
assert.equal(skillRankCap(j,'R'),0);
assert.ok(game.upgradeSkill('blue',j.id,'Q').ok);
assert.equal(j.skillPoints,0);
assert.equal(game.upgradeSkill('blue',j.id,'W').ok,false);
j.level=3;j.skillPoints=2;
assert.equal(game.upgradeSkill('blue',j.id,'W').ok,true);
assert.equal(j.skillPoints,1);
assert.equal(game.upgradeSkill('blue',j.id,'E').ok,true);
assert.equal(j.skillPoints,0);
console.log('✓ 2 pontos permitem dois upgrades sucessivos, bloqueios respeitados');
const html=file('index.html'),app=file('app.js'),css=file('styles-v30.css'),browser=file('engine.browser.js');
assert.match(html,/styles-v30\.css/);
assert.match(html,/id="autoSkillToggle"/);
assert.match(app,/skillFloatUpgrade/);
assert.match(app,/holder\.append\(up\)/);
assert.match(app,/u\.skillPoints>0/);
assert.match(css,/#quickSkillUp,\.quickSkillUp\{display:none!important\}/);
assert.match(app,/currentDrawPos\(selected\),radius=selected\.range/);
assert.match(browser,/CHAMPION_BASE_AA_RANGE/);
assert.match(html,/id="debugControlsToggle"/);
assert.match(css,/\.devControl\{display:none!important\}/);
assert.match(app,/function setDebugControls/);
console.log('✓ UI: overlay nos slots, Auto Upar único, AA interpolado e ferramentas dev ocultas');
for(const action of ['stop','move','route','farm','fight','push','defend','ward','jungle','objective','recall','flash']){
 assert.ok(existsSync(new URL('../assets/ui/actions/'+action+'.svg',import.meta.url)));
 assert.match(css,new RegExp('action-'+action));
}
assert.match(app,/actionVector/);
console.log('✓ 12 ícones vetoriais locais com categorias e cores próprias');
assert.match(app,/sbSummoners/);assert.match(app,/shopRoleBanner/);assert.match(css,/shopBox\{width:min\(1410px/);
console.log('✓ Placar e loja conectados ao HTML do jogo (sem imagens estáticas)');
