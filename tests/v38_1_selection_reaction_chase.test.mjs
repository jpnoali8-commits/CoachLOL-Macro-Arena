import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const make=(barrier=false)=>new Arena(read('coachlol_map_v6.json'),read('masks_128.json'),{seed:38,roundSeconds:10,
 ...(barrier?{draft:{blue:{TOP:'Volibear',JG:'Warwick',MID:'Ahri',ADC:'Jinx',SUP:'Nami'},red:{TOP:'Darius',JG:'LeeSin',MID:'Vex',ADC:'Caitlyn',SUP:'Leona'},spells:{blue:{ADC:'barrier'}}}}:{})});
function test(name,fn){fn();console.log('✓ V38.1',name)}
test('ataque visível aplica dano ANTES de consultar reação/aceitação',()=>{
 const a=make();a.finishPreparation();a.visible=()=>true;
 const atk=a.units.find(u=>u.id==='red_ADC'),def=a.units.find(u=>u.id==='blue_ADC');
 a.units.forEach(u=>{u.autoAttack=false;u.autoFollow=false;u.autoJungle=false;});
 atk.autoAttack=true;atk.x=.50;atk.y=.50;def.x=.504;def.y=.50;atk.order={kind:'attack',targetId:def.id,combatStyle:'aa'};
 a.phase='executing';a.executionRemaining=10;
 const initial=def.hp;a.resolveCombat();
 assert.ok(def.hp<initial,'Dano deve ocorrer sem consentimento');assert.equal(a.pendingDecision,null);
 a.gameTime++;a.processAmbushResponses();
 assert.equal(a.pendingDecision?.kind,'combat_reaction','Defensor recebe popup após o impacto');
 assert.equal(a.pendingDecision?.unitId,def.id);
});
test('resposta recebe Barrier + Q, gasta cooldown e preserva ordem persistente',()=>{
 const a=make(true),def=a.units.find(u=>u.id==='blue_ADC'),atk=a.units.find(u=>u.id==='red_ADC');
 assert.equal(def.summonerSpell,'barrier');
 def.skillRanks.Q=1;def.order={kind:'farm',spell:'none'};def.x=.5;def.y=.5;atk.x=.505;atk.y=.5;
 a.visible=()=>true;a.phase='decision';a.executionRemaining=9;
 a.pendingDecision={kind:'combat_reaction',unitId:def.id,enemyId:atk.id,at:a.gameTime};
 const key=a.duelKey(atk,def);a.duelRequests[key]={key,initiator:atk.id,responder:def.id,state:'pending'};
 const r=a.queueReactionCombo('blue',def.id,atk.id,['BARRIER','Q'],{response:'defend',chase:true});
 assert.ok(r.ok,r.reason);assert.equal(a.pendingDecision,null);assert.equal(a.phase,'executing');
 assert.equal(def.order.kind,'farm');assert.deepEqual(def.reactionCombo.combo,['BARRIER','Q']);
 a.gameTime++;a.resolveQueuedCombos();assert.ok(def.barrierCd>a.gameTime);assert.ok(def.shield>0);
 assert.equal(def.reactionCombo.comboIndex,1);
 const hp=atk.hp;a.gameTime++;a.resolveQueuedCombos();assert.ok(atk.hp<hp,'Q deve afetar atacante visível após Barreira');
 assert.equal(def.reactionCombo.comboIndex,2);
 a.gameTime++;a.resolveQueuedCombos();assert.equal(def.reactionCombo,null,'limpa somente a resposta temporária');
 assert.equal(def.order.kind,'farm');
});
test('Barreira do defensor funciona mesmo em retirada sem visão do agressor',()=>{
 const a=make(true),def=a.units.find(u=>u.id==='blue_ADC'),atk=a.units.find(u=>u.id==='red_ADC');
 assert.equal(def.summonerSpell,'barrier');
 a.phase='decision';a.pendingDecision={kind:'combat_reaction',unitId:def.id,enemyId:atk.id};
 a.visible=()=>true;assert.ok(a.queueReactionCombo('blue',def.id,atk.id,['BARRIER'],{response:'retreat'}).ok);
 a.visible=()=>false;a.gameTime+=1;a.resolveQueuedCombos();
 assert.ok(def.shield>=100, 'a defesa própria não depende do campo de visão');
 assert.equal(def.reactionCombo.comboIndex,1);
});
test('habilidades defensivas Yasuo/Braum/Mel bloqueiam mesmo fora do alcance de AA',()=>{
 for(const [champ,slot] of [['Yasuo','W'],['Braum','E'],['Mel','W']]){
  const a=make(),def=a.units.find(u=>u.id==='blue_ADC'),atk=a.units.find(u=>u.id==='red_ADC');
  def.champ=champ;def.skillRanks[slot]=1;def.mana=def.maxMana;
  def.x=.4;def.y=.4;atk.x=.6;atk.y=.6;
  a.phase='decision';a.pendingDecision={kind:'combat_reaction',unitId:def.id,enemyId:atk.id};
  assert.ok(a.queueReactionCombo('blue',def.id,atk.id,[slot],{response:'defend'}).ok);
  a.visible=()=>false;const enemyHP=atk.hp;a.gameTime++;a.resolveQueuedCombos();
  assert.equal(def.reactionCombo.comboIndex,1,champ+' deve ativar defesa mesmo sem alvo');
  assert.ok(def.projectileGuardUntil>a.gameTime,champ+' deve levantar guarda defensiva');
  assert.equal(atk.hp,enemyHP,champ+' defesa não causa dano a inimigo invisível');
 }
});
test('carregamento legado admite summoner implícito',()=>{
 const a=make(),def=a.units.find(u=>u.id==='blue_ADC');delete def.summonerSpell;
 assert.equal(a.equippedSummoner(def),'heal');
 assert.ok(a.queueSummoner('blue',def.id,'heal').ok);
});
test('reação contra alvo/ally falsos e feitiço não equipado é rejeitada',()=>{
 const a=make(),def=a.units.find(u=>u.id==='blue_ADC'),atk=a.units.find(u=>u.id==='red_ADC');
 a.phase='decision';a.pendingDecision={kind:'combat_reaction',unitId:def.id,enemyId:atk.id};
 assert.equal(a.queueReactionCombo('red',atk.id,def.id,['Q']).ok,false);
 assert.equal(a.queueReactionCombo('blue',def.id,atk.id,['IGNITE']).ok,false);
 assert.equal(a.queueReactionCombo('blue',def.id,atk.id,['BARRIER']).ok,false);
 assert.ok(a.pendingDecision,'invalid proposal never dismisses reaction');
});
test('perseguir escolhe caminhos reais e não depende de resposta',()=>{
 const a=make(),u=a.units.find(v=>v.id==='blue_ADC'),v=a.units.find(x=>x.id==='red_ADC');
 a.finishPreparation();a.visible=()=>true;
 u.x=.42;u.y=.62;v.x=.46;v.y=.59;
 assert.ok(a.walkable(u.x,u.y)&&a.walkable(v.x,v.y),'posições teste devem ser caminháveis');
 const r=a.setOrder('blue',u.id,{kind:'attack',targetId:v.id,chase:true,combatStyle:'aa'});assert.ok(r.ok,r.reason);
 u.autoFollow=false;u.manualMoveHold=false;v.stunUntil=999;
 const before=a.mapDistance(u,v);
 a.gameTime=75;for(let i=0;i<12;i++){a.gameTime++;a.reviveAndMove();}
 assert.ok(a.mapDistance(u,v)<before,'perseguidor deve encurtar a distância');
 a.visible=()=>false;
 const known={...u.order.lastSeen};v.x=.7;v.y=.7;a.gameTime++;a.reviveAndMove();
 assert.deepEqual(u.order.lastSeen,known,'não usa posição real do inimigo na fog');
});
test('ordem chase-only aceita alvo, não obriga atacar e está sujeita à visão',()=>{
 const a=make(),u=a.units.find(v=>v.id==='blue_ADC'),enemy=a.units.find(v=>v.id==='red_ADC');
 a.visible=()=>true;assert.ok(a.setOrder('blue',u.id,{kind:'chase',targetId:enemy.id}).ok);
 assert.equal(u.order.kind,'chase');
 assert.equal(a.setOrder('blue',u.id,{kind:'chase'}).ok,false);
 a.visible=()=>false;assert.equal(a.setOrder('blue',u.id,{kind:'chase',targetId:enemy.id}).ok,false);
});
test('UI possui retângulo de seleção Shift, tipos de engage, editor de resposta e loadout',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const css=readFileSync(new URL('../styles-v38-1.css',import.meta.url),'utf8');
 assert.match(app,/drawSelectionRectangle\(/);assert.match(app,/chooseArea\(inside\)/);
 assert.match(app,/shift&&wasMoved/);assert.match(css,/#groupSelectRect/);assert.match(app,/additive:true/);
 for(const word of ['combat_reaction','queueReactionCombo','reactionCombatChoice','comboEngageMode','Perseguir + lutar','Só perseguir'])assert.ok(app.includes(word),word);
 for(const id of ['secondarySummoner','summonerQuick'])assert.ok(html.includes(`id="${id}"`));
});
