import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
const require=createRequire(import.meta.url);
const pg=require('../postgame.js');
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json');
const arena=()=>new Arena(map,mask,{seed:260721,roundSeconds:10});
let passed=0;
function test(name,fn){fn();console.log('✓ DEV7 '+name);passed++;}
const goldCheck=u=>{
 const t=u.postgameV452d4Dev7;
 assert.equal(u.gold,t.initialGold+t.goldEarned+t.goldRefunded-t.goldSpent,'conciliação exata de ouro '+u.id);
};
test('saldo inicial e compra automática de Atlas: zero duplicações de ouro',()=>{
 const a=arena();assert.equal(a.postgameTimelineV452d4Dev7.samples.length,1);
 for(const u of a.units){const t=u.postgameV452d4Dev7;assert.equal(t.initialGold,500);assert.equal(t.goldEarned,0);assert.equal(t.goldRefunded,0);goldCheck(u);}
 assert.ok(a.units.filter(u=>u.role==='SUP').every(u=>u.postgameV452d4Dev7.goldSpent>0));
 assert.equal(a.postgameTimelineV452d4Dev7.samples[0].time,0);
});
test('ouro ganho, gasto, reembolso e prêmio por ward concilia sem mudar valores',()=>{
 const a=arena(),u=a.units.find(x=>x.id==='blue_ADC'),old=u.gold;
 a.creditGoldV452d4Dev7(u,124,'test');assert.equal(u.gold,old+124);
 // Buy an ordinary inexpensive component in the fountain.
 const bought=a.buy('blue',u.id,'long_sword');assert.equal(bought,true);
 assert.equal(a.sellItemV43('blue',u.id,u.items.indexOf('long_sword')).ok,true);
 const t=u.postgameV452d4Dev7;
 assert.equal(t.goldEarned,124);assert.equal(t.goldSpent,350);assert.equal(t.goldRefunded,245);goldCheck(u);
});
test('dano ao HP de campeões separado por tipo, sem contar escudos/friendly/corrente duas vezes',()=>{
 const a=arena();const attacker=a.units.find(u=>u.id==='blue_ADC'),victim=a.units.find(u=>u.id==='red_ADC');
 attacker.x=victim.x-.001;attacker.y=victim.y;attacker.runePageV43='none';
 victim.shield=25;const before=victim.hp;
 const p=a.damage(victim,40,attacker,'true','spell');
 assert.equal(before-victim.hp,15);assert.equal(p,15);
 assert.equal(attacker.postgameV452d4Dev7.damageDealtChampions.true,15);
 assert.equal(victim.postgameV452d4Dev7.damageTakenChampions.true,15);
 const old=attacker.postgameV452d4Dev7.damageDealtChampions.true;
 const self=a.units.find(u=>u.id==='blue_MID');a.damage(self,15,attacker,'true','other');
 assert.equal(attacker.postgameV452d4Dev7.damageDealtChampions.true,old);
 victim.shield=0;const beforeP=victim.hp;
 a.damage(victim,45,attacker,'physical','other');
 assert.ok(attacker.postgameV452d4Dev7.damageDealtChampions.physical>0);
 assert.ok(victim.hp<beforeP);
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.deepEqual(b.units.find(u=>u.id==='blue_ADC').postgameV452d4Dev7,attacker.postgameV452d4Dev7);
});
test('sentinelas contam apenas colocações válidas e remoção real de uma ward adversária',()=>{
 const a=arena(),u=a.units.find(x=>x.id==='blue_ADC');const t=u.postgameV452d4Dev7;
 assert.equal(a.addWard('blue',u.id,{x:-1,y:-1}).ok,false);assert.equal(t.wardsPlaced,0);
 const good=a.addWard('blue',u.id,{x:u.x,y:u.y});assert.equal(good.ok,true);assert.equal(t.wardsPlaced,1);
 const attacker=a.units.find(x=>x.id==='blue_JG');
 attacker.x=u.x;attacker.y=u.y;attacker.range=.2;
 const enemy={id:'enemy_ward_telemetry',owner:'red_ADC',team:'red',type:'stealth',x:u.x,y:u.y,until:999,createdAt:0,hp:1,maxHp:1,disabledUntil:0};
 a.wards.push(enemy);a.wardKnownTo=()=>true;
 const taken=a.revealWard('blue',attacker.id,enemy.id);assert.equal(taken.ok,true);assert.equal(taken.destroyed,true);
 assert.equal(attacker.postgameV452d4Dev7.wardsDestroyed,1);assert.equal(a.wards.some(w=>w.id===enemy.id),false);
 assert.equal(a.revealWard('blue',attacker.id,enemy.id).ok,false);
 goldCheck(attacker);
});
test('snapshot preserva amostras por minuto e não duplica amostras no mesmo segundo',()=>{
 const a=arena(),u=a.units.find(x=>x.id==='blue_ADC');
 a.gameTime=60;a.creditGoldV452d4Dev7(u,50);a.samplePostgameV452d4Dev7();
 assert.equal(a.samplePostgameV452d4Dev7(),false);
 a.gameTime=120;a.creditGoldV452d4Dev7(u,25);a.samplePostgameV452d4Dev7();
 const b=Arena.fromSnapshotV40(map,mask,a.snapshotV40());
 assert.deepEqual(b.postgameTimelineV452d4Dev7,a.postgameTimelineV452d4Dev7);
 assert.equal(b.postgameTimelineV452d4Dev7.samples.length,3);
 assert.deepEqual(b.postgameTimelineV452d4Dev7.samples.map(s=>s.time),[0,60,120]);
 b.gameTime=180;b.samplePostgameV452d4Dev7();assert.equal(a.postgameTimelineV452d4Dev7.samples.length,3);
 assert.equal(b.postgameTimelineV452d4Dev7.samples.length,4);
});
test('pós-jogo mostra gráficos e séries reais, filtros por equipe e tipos de dano',()=>{
 const a=arena();const u=a.units.find(x=>x.id==='blue_ADC');
 a.creditGoldV452d4Dev7(u,100);a.gameTime=60;a.samplePostgameV452d4Dev7();
 a.creditGoldV452d4Dev7(u,200);a.gameTime=120;a.samplePostgameV452d4Dev7();
 const data=pg.model(a);assert.equal(data.telemetryAvailable,true);assert.equal(data.samples.length,3);
 assert.equal(data.players.find(p=>p.id===u.id).goldEarned,300);
 const state=pg.newState();state.tab='graphs';state.filters.metric='goldEarned';
 assert.match(pg.render(data,state),/Ouro ganho/);
 state.chartMode='timeline';state.timeMetric='goldEarned';state.filters.team='blue';
 const graph=pg.render(data,state);assert.match(graph,/polyline/);assert.match(graph,/00:00/);assert.match(graph,/02:00/);
 assert.doesNotMatch(graph,/VERMELHO <b>/);
 state.tab='stats';state.category='vision';const vision=pg.render(data,state);assert.match(vision,/Sentinelas colocadas/);
 state.category='combat';assert.match(pg.render(data,state),/Dano físico a campeões/);
});
test('snapshot legado sem telemetria não mostra valores inventados',()=>{
 const a=arena(),snap=a.snapshotV40();
 for(const u of snap.state.units)delete u.postgameV452d4Dev7;
 delete snap.state.postgameTimelineV452d4Dev7;
 const restored=Arena.fromSnapshotV40(map,mask,snap),data=pg.model(restored);
 assert.equal(data.telemetryAvailable,false);assert.equal(data.samples.length,0);
 const state=pg.newState();state.tab='graphs';state.filters.metric='damageDealt';
 const html=pg.render(data,state);assert.doesNotMatch(html,/value="damageDealt"/);
 assert.match(html,/Abates/);
});
console.log(`V4.5.2d-4-dev7 ${passed}/7 PASS`);
