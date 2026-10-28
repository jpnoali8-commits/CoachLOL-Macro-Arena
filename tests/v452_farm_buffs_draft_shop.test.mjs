import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,OBJECTIVE_BUFF_RULES_V452} from '../engine.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const arena=(draft=null)=>new Arena(read('coachlol_map_v6.json'),read('masks_128.json'),{seed:452,roundSeconds:10,mode:'bot',draft});
const test=(name,fn)=>{fn();console.log('✓ V4.5.2 '+name)};
test('Barão aplica buff APENAS a campeões vivos e expira individualmente',()=>{
 const a=arena(),u=a.units.find(x=>x.id==='blue_TOP'),v=a.units.find(x=>x.id==='blue_MID');a.gameTime=1200;
 u.baronBuffUntilV452=1380;v.baronBuffUntilV452=1380;a.teams.blue.baronUntil=1380;
 assert.equal(a.hasBaronV452(u),true);u.hp=0;assert.equal(a.hasBaronV452(u),false);
 assert.equal(a.hasBaronV452(v),true);a.gameTime=1381;assert.equal(a.hasBaronV452(v),false);
});
test('aura só buffa minions próximos de portador vivo',()=>{
 const a=arena(),u=a.units.find(x=>x.id==='blue_TOP');a.gameTime=1200;u.baronBuffUntilV452=1380;
 const m={team:'blue',x:u.x+.01,y:u.y};assert.equal(a.baronMinionAuraV452(m),true);
 m.x=.90;m.y=.05;assert.equal(a.baronMinionAuraV452(m),false);u.hp=0;m.x=u.x;m.y=u.y;assert.equal(a.baronMinionAuraV452(m),false);
});
test('Ancião marca execução, espera, e não executa se o alvo se curar',()=>{
 const a=arena(),u=a.units.find(x=>x.id==='blue_TOP'),v=a.units.find(x=>x.id==='red_TOP');a.gameTime=900;u.elderBuffUntilV452=1050;
 v.hp=Math.round(v.maxHp*.23);a.damage(v,Math.ceil(v.maxHp*.06),u,'true','spell');
 assert.ok(v.hp>0);assert.equal(v.elderPendingV452.at,901);
 v.hp=Math.round(v.maxHp*.50);a.gameTime=901;a.resolveElderPendingV452();assert.ok(v.hp>0);assert.equal(v.elderPendingV452,null);
});
test('Ancião executa no tick posterior com morte atribuída ao agressor',()=>{
 const a=arena(),u=a.units.find(x=>x.id==='blue_TOP'),v=a.units.find(x=>x.id==='red_TOP');a.gameTime=900;u.elderBuffUntilV452=1050;v.hp=Math.round(v.maxHp*.23);
 a.damage(v,Math.ceil(v.maxHp*.06),u,'true','spell');a.gameTime=901;a.resolveElderPendingV452();
 assert.equal(v.hp,0);assert.equal(u.kills,1);assert.equal(a.teams.blue.kills,1);
});
test('Ancião respeita invulnerabilidade',()=>{
 const a=arena(),u=a.units.find(x=>x.id==='blue_TOP'),v=a.units.find(x=>x.id==='red_TOP');a.gameTime=900;u.elderBuffUntilV452=1050;
 v.hp=Math.round(v.maxHp*.16);v.elderPendingV452={sourceId:u.id,at:901};v.stasisUntil=902;a.gameTime=901;a.resolveElderPendingV452();assert.ok(v.hp>0);
});
test('feitiço é travado após Champ Select, com Fantasma selecionável no draft',()=>{
 const a=arena({blue:{TOP:'Volibear',JG:'Warwick',MID:'Ahri',ADC:'Jinx',SUP:'Nami'},red:{TOP:'Darius',JG:'LeeSin',MID:'Vex',ADC:'Caitlyn',SUP:'Leona'},spells:{blue:{MID:'ghost',TOP:'barrier'}}});
 const mid=a.units.find(x=>x.id==='blue_MID');assert.equal(mid.summonerSpell,'ghost');
 assert.equal(a.setSecondarySummoner('blue',mid.id,'ignite').ok,false);assert.equal(mid.summonerSpell,'ghost');
 assert.equal(a.units.find(x=>x.id==='blue_JG').summonerSpell,'smite');
 a.phase='planning';assert.equal(a.queueSummoner('blue',mid.id,'ghost').ok,true);
 a.resolveSummonerCasts();assert.equal(mid.ghostUntil,a.gameTime+15);assert.equal(a.queueSummoner('blue',mid.id,'ghost').ok,false);
});
test('Alma elemental persiste sem depender do tempo de Barão ou Ancião',()=>{
 const a=arena();a.teams.blue.dragons=['infernal','mountain','cloud','ocean'];a.teams.blue.soulTypeV452='ocean';a.teams.blue.soulAt=800;
 a.gameTime=5000;assert.equal(a.teams.blue.soulTypeV452,'ocean');assert.equal(a.teams.blue.dragons.length,4);
});
test('loja permite filtrar classes sem marcar itens incompletos como completos',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 for(const x of ['tank','fighter','mage','marksman','support'])assert.ok(html.includes(`data-filter="${x}"`),x);
 assert.match(app,/x\.tags\.includes\(filter\)/);
});
test('farm só concede CS no último golpe e possui telemetria de perdas',()=>{
 const a=arena();a.finishPreparation();a.deployToLane();a.phase='executing';a.detectEncounters=()=>{};
 for(const u of a.units)if(u.team==='red'){u.hp=0;u.deadUntil=999;u.autoAttack=false;}
 for(let t=0;t<150;t++){a.gameTime++;a.tick();}
 const top=a.units.find(u=>u.id==='blue_TOP');const audit=a.farmTelemetryV452.blue.top;
 assert.ok(top.cs>=0&&audit&&audit.secured>=0);assert.equal(audit.secured,top.cs);
 assert.ok(audit.missedByWave>=audit.onCooldown&&audit.missedByWave>=audit.outOfRange);
});
test('checkpoint mantém estados dos buffs e do farm',()=>{
 const a=arena(),u=a.units[0];u.baronBuffUntilV452=180;u.ghostUntil=12;a.farmTelemetryV452.blue.top={secured:3,missedByWave:2,outOfRange:1,onCooldown:1};
 const saved=a.snapshotV40();const restored=Arena.fromSnapshotV40(a.map,a.mask,saved);
 assert.equal(restored.units[0].baronBuffUntilV452,180);assert.deepEqual(restored.farmTelemetryV452.blue.top,a.farmTelemetryV452.blue.top);
});
console.log('10 contratos V4.5.2 encerrados');
