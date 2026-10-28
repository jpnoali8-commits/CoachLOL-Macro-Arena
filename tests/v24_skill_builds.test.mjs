import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,skillRankCap} from '../engine.mjs';
import {interpretCommands,applyCommands} from '../commands.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const fresh=draft=>new Arena(load('coachlol_map_v6.json'),load('masks_128.json'),{mode:'manual',roundSeconds:10,draft});
const test=(label,fn)=>{fn();console.log('✓ '+label)};
function upTo(a,u,level){for(let next=u.level+1;next<=level;next++){u.level=next;u.skillPoints++;a.autoSpendSkills(u);}}
function plan(a,command){const p=interpretCommands(command,a);assert.ok(p.ok,JSON.stringify(p.errors));const r=applyCommands(p,a);assert.ok(r.ok,JSON.stringify(r.errors));return p;}
test('Voli foca Q e depois W, com um ponto inicial por habilidade e R obrigatório',()=>{
 const a=fresh(),u=a.units.find(x=>x.id==='blue_TOP');assert.equal(u.champ,'Volibear');
 const p=plan(a,'Voli focar upar o Q depois W');assert.ok(p.commands[0].actions.some(x=>x.type==='skillPlan'));
 assert.equal(u.skillRanks.Q,1);upTo(a,u,3);
 assert.deepEqual([u.skillRanks.Q,u.skillRanks.W,u.skillRanks.E],[1,1,1]);
 upTo(a,u,6);assert.equal(u.skillRanks.R,1);
 upTo(a,u,11);assert.equal(u.skillRanks.R,2);
 upTo(a,u,16);assert.equal(u.skillRanks.R,3);
 assert.equal(u.skillPoints,0);
});
test('Jinx foca Q antes de E com ordem persistente em outras rodadas',()=>{
 const a=fresh(),u=a.units.find(x=>x.id==='blue_ADC');plan(a,'Jinx focar o Q depois E');
 assert.deepEqual(u.skillBuild.priority,['Q','E','W']);upTo(a,u,3);
 assert.deepEqual([u.skillRanks.Q,u.skillRanks.E,u.skillRanks.W],[1,1,1]);
 a.round=9;a.phase='planning';upTo(a,u,9);
 assert.equal(u.skillRanks.Q,5);assert.equal(u.skillRanks.R,1);assert.equal(u.skillBuild.phases[0].slot,'Q');
});
test('Vayne progride Q1 W1 E1, Q3 e então maximiza W, R nos níveis 6,11,16',()=>{
 const a=fresh({blue:{TOP:'Volibear',JG:'Warwick',MID:'Ahri',ADC:'Vayne',SUP:'Nami'}});
 const u=a.units.find(x=>x.id==='blue_ADC');assert.equal(u.champ,'Vayne');
 plan(a,'Vayne upar 3 pontos no Q depois focar W');
 upTo(a,u,3);assert.deepEqual([u.skillRanks.Q,u.skillRanks.W,u.skillRanks.E],[1,1,1]);
 upTo(a,u,5);assert.equal(u.skillRanks.Q,3);assert.equal(u.skillRanks.W,1);
 upTo(a,u,10);assert.equal(u.skillRanks.W,5);assert.equal(u.skillRanks.Q,3);assert.equal(u.skillRanks.R,1);
 upTo(a,u,18);assert.equal(u.skillRanks.R,3);assert.equal(u.skillRanks.Q,5);assert.equal(u.skillRanks.E,5);
});
test('R convencional não pode ser antecipado por comando ou upgrade manual',()=>{
 const a=fresh(),u=a.units.find(x=>x.id==='blue_ADC');plan(a,'Jinx focar R Q E W');
 assert.equal(u.skillRanks.R,0);u.level=5;u.skillPoints++;assert.equal(a.upgradeSkill('blue',u.id,'R').ok,false);
 assert.equal(skillRankCap(u,'R'),0);
});
test('Udyr recebe R como habilidade básica, sem ultimate grátis',()=>{
 const a=fresh({blue:{TOP:'Volibear',JG:'Udyr',MID:'Ahri',ADC:'Jinx',SUP:'Nami'}});
 const u=a.units.find(x=>x.id==='blue_JG');assert.equal(u.champ,'Udyr');
 assert.equal(u.skillRanks.R,0);assert.equal(skillRankCap(u,'R'),1);
 assert.equal(a.upgradeSkill('blue',u.id,'R').ok,true);u.level=16;assert.equal(skillRankCap(u,'R'),6);
});
test('UI tem resumo da ordem de skills, layout flutuante e controles de chat/configuração',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 for(const id of ['skillPlanSummary','autoSkillToggle','commandDock','chatOpen','settingsOpen','resizeLeft','resizeRight'])assert.ok(html.includes(id),id);
 assert.match(css,/\.commandDock,.boardColumn \.commandDock\{position:absolute!important/);
 assert.match(app,/u\.skillBuild\.phases/);
});
console.log('6 contratos novos v2.4 aprovados');
// Additional engine regressions for the AA/combo problem reported by players.
test('Combo Q→W executa habilidades sequenciais e não é cancelado por AA automático',()=>{
 const a=fresh();let u=a.units.find(x=>x.id==='blue_MID'),enemy=a.units.find(x=>x.id==='red_MID');
 u.x=.5;u.y=.5;enemy.x=.503;enemy.y=.5;u.range=.06;u.skillRanks.Q=1;u.skillRanks.W=1;u.mana=400;
 a.gameTime=100;a.phase='executing';a.visible=()=>true;a.units.filter(x=>x!==u).forEach(x=>x.autoAttack=false);
 const key=a.duelKey(u,enemy);a.duelRequests[key]={key,state:'ready',until:130,initiator:u.id,responder:enemy.id};
 u.order={kind:'attack',targetId:enemy.id,combatStyle:'combo',combo:['Q','W'],comboIndex:0};
 const hp=enemy.hp;a.resolveCombat();assert.equal(u.order.comboIndex,1);assert.ok(enemy.hp<hp,'AA must still inflict damage');
 a.gameTime=102;a.resolveCombat();assert.equal(u.order.comboIndex,2);assert.ok(u.shield>0,'W shield was cast');
 a.gameTime=104;const old=enemy.hp;a.resolveCombat();assert.equal(u.order.comboIndex,2,'finished combo cannot loop');assert.ok(enemy.hp<old,'basic attack continues after combo');
});
test('Udyr pode priorizar o R por texto sem regra de ultimate 6/11/16',()=>{
 const a=fresh({blue:{TOP:'Volibear',JG:'Udyr',MID:'Ahri',ADC:'Jinx',SUP:'Nami'}});
 const u=a.units.find(x=>x.id==='blue_JG');
 const preview=interpretCommands('JG focar upar R depois Q',a);
 assert.equal(preview.ok,true,JSON.stringify(preview.errors));assert.equal(applyCommands(preview,a).ok,true);
 assert.equal(u.skillRanks.R,1);assert.equal(u.skillPoints,0);
});
