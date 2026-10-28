import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const get=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const make=()=>new Arena(get('coachlol_map_v6.json'),get('masks_128.json'),{seed:4522,roundSeconds:10});
function test(name,fn){fn();console.log('✓ V4.5.2b '+name);}
test('reação pode focar outro oponente próximo e visível',()=>{
 const a=make(),def=a.units.find(u=>u.id==='blue_ADC');
 const attacker=a.units.find(u=>u.id==='red_ADC'),alternate=a.units.find(u=>u.id==='red_SUP');
 for(const v of [def,attacker,alternate]){v.x=.5;v.y=.5;}
 alternate.x=.506;
 a.visible=()=>true;a.phase='decision';a.executionRemaining=8;
 a.pendingDecision={kind:'combat_reaction',unitId:def.id,enemyId:attacker.id,at:a.gameTime};
 const key=a.duelKey(attacker,def);a.duelRequests[key]={key,initiator:attacker.id,responder:def.id,state:'pending'};
 def.order={kind:'farm'};def.skillRanks.Q=1;
 const result=a.queueReactionCombo('blue',def.id,alternate.id,['Q'],{response:'fight',chase:true});
 assert.ok(result.ok,result.reason);
 assert.equal(def.reactionCombo.targetId,alternate.id);
 assert.equal(a.duelRequests[key].state,'ready','a janela ORIGINAL do agressor foi respondida');
 assert.equal(def.order.kind,'farm','não substitui a ordem macro persistente');
 assert.equal(a.pendingDecision,null);
});
test('alvo de reação na fog ou longe não pode ser rastreado',()=>{
 const a=make(),def=a.units.find(u=>u.id==='blue_ADC'),attacker=a.units.find(u=>u.id==='red_ADC'),other=a.units.find(u=>u.id==='red_SUP');
 a.phase='decision';a.pendingDecision={kind:'combat_reaction',unitId:def.id,enemyId:attacker.id};
 other.x=.95;other.y=.95; a.visible=()=>true;
 assert.equal(a.queueReactionCombo('blue',def.id,other.id,['Q']).ok,false);
 other.x=def.x;other.y=def.y;a.visible=(_team,u)=>u.id!==other.id;
 assert.equal(a.queueReactionCombo('blue',def.id,other.id,['Q']).ok,false);
 assert.ok(a.pendingDecision,'decisão continua aberta se o target é inválido');
});
test('janelas de reação não podem ser roubadas por outro aliado',()=>{
 const a=make(),def=a.units.find(u=>u.id==='blue_ADC'),attacker=a.units.find(u=>u.id==='red_ADC');
 a.phase='decision';a.pendingDecision={kind:'combat_reaction',unitId:def.id,enemyId:attacker.id};a.visible=()=>true;
 assert.equal(a.queueReactionCombo('blue','blue_MID',attacker.id,[]).ok,false);
});
test('wave inicial tem exatamente 3 melee e 3 caster por lado/rota',()=>{
 const a=make();a.gameTime=30;a.spawnWaves();
 for(const team of ['blue','red'])for(const lane of ['top','mid','bot']){
  const wave=a.minions.filter(m=>m.team===team&&m.lane===lane);
  assert.equal(wave.length,6,`${team}/${lane}`);
  assert.equal(wave.filter(m=>m.kind==='melee').length,3);
  assert.equal(wave.filter(m=>m.kind==='caster').length,3);
  assert.equal(wave.filter(m=>m.kind==='siege').length,0);
 }
});
test('terceira wave tem 3 guerreiros, 3 magos e 1 canhão (7)',()=>{
 const a=make();for(const t of [30,60,90]){a.gameTime=t;a.spawnWaves();}
 for(const team of ['blue','red'])for(const lane of ['top','mid','bot']){
  const wave=a.minions.filter(m=>m.team===team&&m.lane===lane&&m.spawnAt>=90);
  assert.equal(wave.length,7);
  assert.deepEqual(wave.map(m=>m.kind),['melee','melee','melee','siege','caster','caster','caster']);
 }
});
test('dev45: wave preserva tres melee e tres caster, com canhao quando devido',()=>{
 const a=make();
 assert.deepEqual(a.waveCompositionV452b(31,900).filter(x=>x==='melee').length,3);
 assert.equal(a.waveCompositionV452b(31,900).length,7);
 assert.equal(a.waveCompositionV452b(50,1900).filter(x=>x==='caster').length,3);
 assert.equal(a.waveCompositionV452b(50,1900).length,7);
});
test('código do modal permite mudança de alvo em uma reação',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 for(const token of ['reactionTargetChoice','activeTargetId','FOCAR INIMIGO',"queueReactionCombo('blue',group[0].id,activeTargetId"])
  assert.ok(app.includes(token),`UI sem ${token}`);
});
