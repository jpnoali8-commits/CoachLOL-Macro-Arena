import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Arena,OBJECTIVE_PHASES_V44,OBJECTIVE_REWARD_V44,CAMP_RULES_2026,checksumV40} from '../engine.mjs';
const data=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const make=()=>new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:44,mode:'manual',roundSeconds:10});
const isolate=a=>{for(const u of a.units){u.order={kind:'stop'};u.autoJungle=false;u.autoAttack=false;u.autoFollow=false;u.x=.05;u.y=.95;}a.phase='executing';};
const camp=(a,type)=>a.camps.find(c=>c.timerKey===type);
const hero=(a,team='blue',role='JG')=>a.units.find(u=>u.id===team+'_'+role);
const test=(name,fn)=>{fn();console.log('✓ V4.4 '+name);};
const jungleSetup=(a,type='dragon',at=500)=>{isolate(a);a.gameTime=at;a.updateObjectives();const c=camp(a,type);assert.ok(c?.alive,'camp should be alive: '+type);return c;};
const pet=(a,u)=>{u.junglePet='mosstomper';u.smiteTier=1;u.smiteCharges=2;u.smiteCd=0;u.smiteRecoveries=[];u.smitePolicy={mode:'auto',rules:[]};};
const place=(u,c)=>{u.x=c.x;u.y=c.y;u.order={kind:'objective',targetId:c.id};};

test('janelas V4.4 compartilham o poço e nunca coexistem',()=>{
 const a=make();isolate(a);assert.equal(OBJECTIVE_PHASES_V44.herald.spawn,900);
 for(const [time,type] of [[479,null],[480,'voidgrubs'],[885,null],[900,'herald'],[1185,null],[1200,'baron']]){
  a.gameTime=time;a.updateObjectives();const live=['voidgrubs','herald','baron'].filter(x=>camp(a,x).alive);
  assert.deepEqual(live,type?[type]:[],String(time));
 }
});
test('Vastilarvas e Arauto não reaparecem após limpeza e respeitam janela final',()=>{
 const a=make(),c=jungleSetup(a,'voidgrubs',480),u=hero(a);place(u,c);u.ad=50000;for(let t=0;t<5&&c.alive;t++){a.gameTime+=2;a.updateObjectives();}
 assert.equal(c.alive,false);assert.equal(c.exhaustedV44,true);assert.equal(a.teams.blue.voidgrubs,3);u.order={kind:'stop'};u.x=.02;u.y=.9;
 a.gameTime=800;a.updateObjectives();assert.equal(c.alive,false);
 a.gameTime=900;a.updateObjectives();const h=camp(a,'herald');assert.ok(h.alive);a.gameTime=1185;a.updateObjectives();assert.equal(h.alive,false);assert.ok(h.exhaustedV44);
});
test('Smite funciona durante recarga de AA sem consumir ataque fictício',()=>{
 const a=make(),c=jungleSetup(a),u=hero(a);pet(a,u);place(u,c);
 u.jungleAttackAt=a.gameTime+50;c.health=430;
 a.updateObjectives();assert.equal(c.alive,false);assert.equal(c.lastClearTeam,'blue');
 assert.equal(u.smiteCharges,1);assert.equal(u.jungleAttackAt,550);
 assert.equal(a.objectiveLedgerV44.at(-1).smiteSecured,true);
});
test('Golpear não funciona remotamente e não consome carga',()=>{
 const a=make(),c=jungleSetup(a),u=hero(a);pet(a,u);u.x=.03;u.y=.03;
 c.health=300;const before=u.smiteCharges;assert.equal(a.useSmite(u,c),0);
 assert.equal(u.smiteCharges,before);assert.equal(c.health,300);
});
test('Golpear simultâneo determina quem conquista o objetivo antes do AA',()=>{
 const a=make(),c=jungleSetup(a),blue=hero(a),red=hero(a,'red');pet(a,blue);pet(a,red);
 place(blue,c);place(red,c);c.health=550;
 blue.jungleAttackAt=red.jungleAttackAt=a.gameTime+30;a.updateObjectives();
 assert.equal(c.alive,false);assert.equal(c.lastClearTeam,'blue','empatou: desempate pelo ID estável, não pela ordem de atualização');
 assert.equal(a.objectiveLedgerV44.at(-1).contested,true);
 assert.equal(a.objectiveLedgerV44.at(-1).smiteSecured,true);
 assert.equal(blue.smiteCharges,1);assert.equal(red.smiteCharges,1);
});
test('Assistência de objetivo épico é apenas para aliado presente e participante',()=>{
 const a=make(),c=jungleSetup(a),jg=hero(a),adc=hero(a,'blue','ADC'),sup=hero(a,'blue','SUP');
 place(jg,c);place(adc,c);adc.ad=50000;sup.gold=333;const old=adc.gold;c.health=200;
 a.updateObjectives();assert.equal(c.lastClearTeam,'blue');
 assert.ok(a.objectiveLedgerV44.at(-1).participants.includes(jg.id));
 assert.equal(jg.gold,500+OBJECTIVE_REWARD_V44.allyAssistGold);
 assert.equal(sup.gold,333,'aliado ausente não recebeu ouro');assert.ok(adc.gold>old);
});
test('intenção e dano privado do objetivo não vazam na perspectiva adversária',()=>{
 const a=make(),c=jungleSetup(a),u=hero(a);pet(a,u);place(u,c);c.health=200;
 a.updateObjectives();assert.equal(c.lastClearTeam,'blue');
 const red=a.perspective('red'),blue=a.perspective('blue');
 assert.equal(red.objectiveLedger.length,0);assert.equal(blue.objectiveLedger.length,1);
 assert.ok(red.events.some(e=>e.kind==='objective'&&e.public));
 assert.ok(blue.objectiveLedger[0].damageByActor[u.id]>0);
 assert.ok(red.events.every(e=>!(e.kind==='smite_cast'&&e.unitId===u.id)),'sem plano privado');
});
test('teamfights perto do poço têm agregado sem vazar identidade de participantes',()=>{
 const a=make();isolate(a);a.gameTime=1200;const c=camp(a,'dragon');
 const allies=[hero(a,'blue','JG'),hero(a,'blue','MID')],foes=[hero(a,'red','JG'),hero(a,'red','MID')];
 for(const u of [...allies,...foes]){u.x=c.x;u.y=c.y;}
 foes[0].hp=foes[0].maxHp;a.damage(foes[0],75,allies[0],'physical','spell');
 assert.equal(a.teamfightLedgerV44.length,1);const shot=a.perspective('blue').teamfights;
 assert.equal(shot.length,1);assert.equal(shot[0].hits,1);
 assert.equal(JSON.stringify(shot).includes('red_JG'),false);
});
test('snapshot de partida V4.4 preserva fases e result ledger sem divergência',()=>{
 const a=make(),c=jungleSetup(a),u=hero(a);pet(a,u);place(u,c);c.health=100;a.updateObjectives();
 const b=Arena.fromSnapshotV40(a.map,a.mask,a.snapshotV40());
 assert.equal(checksumV40(a.snapshotV40()),checksumV40(b.snapshotV40()));
 assert.equal(b.objectiveLedgerV44.length,1);
 assert.equal(b.teams.blue.dragons.length,1);
});
test('checkpoint pré V4.4 reidrata encontros futuros sem perder os 10 campeões',()=>{
 const a=make(),old=a.snapshotV40();old.state.camps=old.state.camps.filter(c=>!['herald','voidgrubs'].includes(c.timerKey));
 delete old.state.objectiveLedgerV44;delete old.state.teamfightLedgerV44;
 const b=Arena.fromSnapshotV40(a.map,a.mask,old);
 assert.ok(camp(b,'herald'));assert.ok(camp(b,'voidgrubs'));
 assert.equal(b.units.length,10);assert.deepEqual(b.validateInvariants(),[]);
});
test('engine Node e engine browser compartilham regras e funções V4.4',()=>{
 const code=readFileSync(new URL('../engine.browser.js',import.meta.url),'utf8'),context={window:{}};
 vm.runInNewContext(code,context,{timeout:5000});const b=context.window.CoachArena;
 assert.equal(b.OBJECTIVE_PHASES_V44.herald.spawn,900);
 assert.equal(b.CAMP_RULES_2026.voidgrubs.spawn,480);
 assert.equal(typeof b.Arena.prototype.recordTeamfightImpactV44,'function');
});
console.log('11 contratos de objetivos e disputa V4.4 aprovados');
