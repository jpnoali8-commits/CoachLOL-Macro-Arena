import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena,CAMP_RULES_2026} from '../engine.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const fresh=()=>new Arena(load('coachlol_map_v6.json'),load('masks_128.json'),{mode:'manual',roundSeconds:10});
const test=(name,fn)=>{fn();console.log('✓ '+name)};
const only=(a,key)=>a.camps.find(c=>c.timerKey===key);
function isolate(a){for(const u of a.units){u.order={kind:'stop'};u.autoJungle=false;u.autoFollow=false;u.autoAttack=false;u.x=.08;u.y=.9;}a.phase='executing';}
test('temporizadores 2026 padrão, distintos de Swiftplay',()=>{
 for(const [kind,cfg] of Object.entries(CAMP_RULES_2026)){
  const a=fresh();isolate(a);assert.ok(cfg.spawn>0&&cfg.respawn>0);
  a.gameTime=cfg.spawn-1;a.updateObjectives();assert.equal(only(a,kind).alive,false,kind+' cedo');
  a.gameTime=cfg.spawn;a.updateObjectives();assert.equal(only(a,kind).alive,true,kind+' no spawn');
 }
});
test('respawn é respeitado por tipo de monstro sem reviver cedo',()=>{
 const a=fresh();isolate(a);a.gameTime=1200;a.updateObjectives();
 for(const key of ['red','blue','wolves','raptors','krugs','gromp','scuttle','dragon','baron']){
  const c=only(a,key),cfg=CAMP_RULES_2026[key];
  c.alive=false;c.health=0;c.respawnAt=1200+cfg.respawn;
  a.gameTime=1200+cfg.respawn-1;a.updateObjectives();assert.equal(c.alive,false,key+' cedo');
  a.gameTime=1200+cfg.respawn;a.updateObjectives();assert.equal(c.alive,true,key+' tardio');
 }
});
test('HP da jungle acompanha nível médio no spawn, nunca durante o combate',()=>{
 const a=fresh();isolate(a);a.gameTime=55;a.updateObjectives();const c=only(a,'red'),first=c.maxHealth;
 for(const u of a.units)u.level=10;
 a.gameTime=56;a.updateObjectives();assert.equal(c.maxHealth,first);
 c.alive=false;c.health=0;c.respawnAt=355;a.gameTime=355;a.updateObjectives();
 assert.equal(c.campLevel,10);assert.ok(c.maxHealth>first);assert.equal(c.health,c.maxHealth);
});
test('jungle ataca, monstro revida, depois perde paciência fora de leash',()=>{
 const a=fresh();isolate(a);a.gameTime=95;const c=only(a,'red');a.updateObjectives();
 const u=a.units.find(u=>u.id==='blue_JG');u.x=c.x;u.y=c.y;u.order={kind:'jungle',targetId:c.id};
 const hp=u.hp,monsterHP=c.health;a.updateObjectives();
 assert.equal(c.leashState,'engaged');assert.ok(c.health<monsterHP);a.gameTime+=2;a.updateObjectives();assert.ok(u.hp<hp,'monstro revidou');
 u.x=.08;u.y=.88;u.order={kind:'stop'};
 for(let n=0;n<6;n++){a.gameTime++;a.updateObjectives();}
 assert.equal(c.leashState,'soft');assert.equal(c.aggroId,null);
 const damaged=c.health;a.gameTime++;a.updateObjectives();assert.ok(c.health>damaged,'soft reset regenera 6%/s');
 for(let n=0;n<9;n++){a.gameTime++;a.updateObjectives();}
 assert.equal(c.leashState,'idle');assert.equal(c.health,c.maxHealth);
});
test('soft reset pode ser interrompido por novo ataque dentro da área',()=>{
 const a=fresh();isolate(a);a.gameTime=95;const c=only(a,'blue');a.updateObjectives();
 const u=a.units.find(u=>u.id==='blue_JG');u.x=c.x;u.y=c.y;u.order={kind:'jungle',targetId:c.id};a.updateObjectives();
 u.x=.10;u.y=.90;u.order={kind:'stop'};
 for(let n=0;n<6;n++){a.gameTime++;a.updateObjectives();}
 assert.equal(c.leashState,'soft');u.x=c.x;u.y=c.y;u.order={kind:'jungle',targetId:c.id};
 a.gameTime++;a.updateObjectives();assert.equal(c.leashState,'engaged');assert.ok(c.patience>=45);
});
test('hard reset impede golpes que fingiriam abater monstro retornando',()=>{
 const a=fresh();isolate(a);a.gameTime=100;const c=only(a,'red');a.updateObjectives();
 c.health=120;c.leashState='hard';c.resetAt=100;
 const u=a.units.find(u=>u.id==='blue_JG');u.x=c.x;u.y=c.y;u.ad=2000;u.order={kind:'jungle',targetId:c.id};
 a.gameTime=101;a.updateObjectives();assert.equal(c.alive,true);assert.ok(c.health>120);
});
test('campo oculto não revela morte, HP, reset ou respawn ao adversário',()=>{
 const a=fresh(),c=a.camps.find(c=>!a.visible('blue',c));
 assert.ok(c,'precisa haver monstro fora da visão');
 c.alive=false;c.health=0;c.respawnAt=1234;c.leashState='soft';
 const shot=a.perspective('blue').camps.find(v=>v.id===c.id);
 assert.ok(shot);assert.equal(shot.unknown,true);assert.equal(shot.alive,null);
 assert.equal('health' in shot,false);assert.equal('respawnAt' in shot,false);assert.equal('leashState' in shot,false);
});
test('validação identifica NaN e estágios de acampamento inválidos',()=>{
 const a=fresh();assert.deepEqual(a.validateInvariants(),[]);
 a.units[0].hp=NaN;a.camps[0].leashState='broken';assert.ok(a.validateInvariants().length>=2);
});
test('preparação e turnos continuam congelando mundo até confirmação',()=>{
 const a=fresh();for(let i=0;i<70;i++)a.tick();assert.equal(a.gameTime,0);
 a.lock('blue');assert.equal(a.playTurn().ok,false);assert.equal(a.gameTime,0);
 a.lock('red');assert.equal(a.playTurn().ok,true);a.continueExecution(1);assert.equal(a.gameTime,1);
});
test('confronto no último segundo fecha rodada após resposta, sem travar',()=>{
 const a=fresh();a.finishPreparation();a.phase='decision';a.round=3;
 a.executionStart=20;a.gameTime=30;a.executionRemaining=0;
 assert.equal(a.pauseForDecision('encounter','blue_ADC','red_ADC'),true);
 a.answerDecision();assert.equal(a.pendingDecision,null);
 assert.equal(a.phase,'planning');assert.equal(a.round,4);assert.equal(a.roundHistory.at(-1).seconds,10);
});
console.log('10 contratos v2.0 aprovados');
