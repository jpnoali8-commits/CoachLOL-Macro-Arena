import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const json=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const fresh=()=>new Arena(json('coachlol_map_v6.json'),json('masks_128.json'),{mode:'manual'});
const test=(name,fn)=>{fn();console.log('✓ '+name)};
test('Nami W em aliado cura, gasta mana, entra em cooldown e salta para inimigo ao alcance',()=>{
 const game=fresh(),nami=game.units.find(u=>u.id==='blue_SUP'),ally=game.units.find(u=>u.id==='blue_ADC'),enemy=game.units.find(u=>u.id==='red_ADC');
 nami.x=.5;nami.y=.5;ally.x=.505;ally.y=.5;enemy.x=.53;enemy.y=.5;
 nami.skillRanks.W=1;ally.hp=ally.maxHp-300;nami.mana=300;game.phase='planning';game.gameTime=200;
 game.visible=()=>true;game.duelPermission=()=>true;const r=game.queueTargetedSkill('blue',nami.id,'W',ally.id);assert.ok(r.ok,r.reason);
 const old=enemy.hp;game.resolveTargetedCasts();assert.ok(ally.hp>ally.maxHp-300);assert.ok(enemy.hp<old);assert.equal(nami.mana,230);assert.ok(nami.skillCds.W>game.gameTime);
 assert.equal(nami.pendingTargetedCast,null);
});
test('Nami W pode começar no inimigo e saltar para aliado',()=>{
 const game=fresh(),nami=game.units.find(u=>u.id==='blue_SUP'),ally=game.units.find(u=>u.id==='blue_ADC'),enemy=game.units.find(u=>u.id==='red_ADC');
 nami.x=.5;nami.y=.5;ally.x=.505;ally.y=.5;enemy.x=.52;enemy.y=.5;
 nami.skillRanks.W=1;ally.hp-=150;game.phase='planning';game.gameTime=200;game.visible=()=>true;game.duelPermission=()=>true;
 const hp=enemy.hp,ahp=ally.hp;assert.ok(game.queueTargetedSkill('blue',nami.id,'W',enemy.id).ok);game.resolveTargetedCasts();assert.ok(enemy.hp<hp);assert.ok(ally.hp>ahp);
});
test('Skill direcionada não existe para campeões sem kit funcional; inimigo oculto é rejeitado',()=>{
 const game=fresh(),nami=game.units.find(u=>u.id==='blue_SUP'),ahri=game.units.find(u=>u.id==='blue_MID'),enemy=game.units.find(u=>u.id==='red_MID');nami.skillRanks.W=1;
 assert.ok(!game.queueTargetedSkill('blue',ahri.id,'W',nami.id).ok);
 game.visible=()=>false;assert.ok(!game.queueTargetedSkill('blue',nami.id,'W',enemy.id).ok);
});
test('Salto ofensivo não causa dano antes de consentimento; a cura já realizada é preservada',()=>{
 const a=fresh(),n=a.units.find(x=>x.id==='blue_SUP'),ally=a.units.find(x=>x.id==='blue_ADC'),e=a.units.find(x=>x.id==='red_ADC');
 n.x=.5;n.y=.5;ally.x=.51;ally.y=.5;e.x=.52;e.y=.5;
 n.skillRanks.W=1;ally.hp-=190;a.gameTime=200;a.phase='planning';a.visible=()=>true;
 let permitted=false;a.duelPermission=()=>permitted;
 assert.ok(a.queueTargetedSkill('blue',n.id,'W',ally.id).ok);
 const enemyHp=e.hp,allyHp=ally.hp;a.resolveTargetedCasts();
 assert.ok(ally.hp>allyHp);assert.equal(e.hp,enemyHp,'inimigo não toma dano sem responder');
 permitted=true;a.gameTime=201;a.resolveTargetedCasts();assert.ok(e.hp<enemyHp);assert.equal(n.pendingTargetedCast,null);
});
test('Previa no primeiro Enter e aplicação no segundo; voz não reinicia automaticamente',()=>{
 const js=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(js,/textOrders'\)\.addEventListener\('keydown'/);
 assert.match(js,/commandPreviewSource===\$\('textOrders'\)\.value/);
 assert.match(js,/recognition\.continuous=false/);
 assert.match(js,/let accepted=false/);
 assert.match(js,/voiceBusy=true/);
 assert.match(html,/id="skillWidget"/);
 assert.ok(html.indexOf('id="skillWidget"')<html.indexOf('<h3>ORDENS E AÇÕES'));
});
console.log('5 novos contratos v2.7 aprovados');
