import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
import {AuthoritativeActionsV453Dev47} from '../multiplayer/authoritative_actions_v453_dev47.mjs';
const data=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const draft={blue:{TOP:'Volibear',JG:'Fiddlesticks',MID:'Ahri',ADC:'Kalista',SUP:'Nami'},
red:{TOP:'Darius',JG:'LeeSin',MID:'Sylas',ADC:'Jinx',SUP:'Leona'}};
const a=new Arena(data('coachlol_map_v6.json'),data('masks_128.json'),{seed:6997,mode:'pvp',draft});
const roles=['TOP','JG','MID','ADC','SUP'];
const gateway=new AuthoritativeActionsV453Dev47(a,[
 {seatId:'p1',unitId:'blue_MID',unitIds:roles.map(r=>'blue_'+r)},
 {seatId:'p2',unitId:'red_MID',unitIds:roles.map(r=>'red_'+r)}
]);
const cmd=(seat,seq,kind,unitId,payload)=>gateway.submit(seat,{sequence:seq,kind,unitId,payload});
const sup=a.units.find(u=>u.id==='blue_SUP'),kal=a.units.find(u=>u.id==='blue_ADC'),fid=a.units.find(u=>u.id==='blue_JG');
a.progressSupport(sup,800);
assert.ok(sup.items.includes('support_bounty'));
assert.equal(cmd('p2',1,'item.supportFinal','blue_SUP',{itemId:'support_bloodsong'}).reason,'unidade_nao_autorizada');
assert.equal(cmd('p1',1,'item.supportFinal',sup.id,{itemId:'support_dream_maker'}).ok,true);
assert.equal(sup.supportFinalV453Dev69C,'support_dream_maker');
assert.equal(cmd('p1',1,'item.supportFinal',sup.id,{itemId:'support_dream_maker'}).ok,true);
assert.equal(sup.items.filter(i=>i==='support_dream_maker').length,1);
assert.equal(cmd('p1',2,'item.supportFinal',sup.id,{itemId:'support_celestial_opposition'}).reason,'recompensa_suporte_indisponivel');
assert.equal(cmd('p1',3,'item.blackSpear',kal.id,{targetId:'red_SUP'}).reason,'alvo_indisponivel');
assert.equal(cmd('p1',3,'item.blackSpear',kal.id,{targetId:'blue_SUP'}).ok,true);
assert.equal(cmd('p1',3,'item.blackSpear',kal.id,{targetId:'blue_SUP'}).ok,true);
assert.equal(kal.pendingOathswornV453Dev69C.targetId,'blue_SUP');
a.gameTime=7;a.advanceConditionalItemsV453Dev69C();
assert.equal(kal.oathswornIdV453Dev69C,sup.id);
assert.equal(cmd('p1',4,'item.blackSpearRecover',kal.id,{}).ok,true);
assert.equal(cmd('p1',5,'item.blackSpear',kal.id,{targetId:'blue_MID'}).ok,true);
assert.equal(cmd('p1',6,'order.ward',fid.id,{point:{x:fid.x,y:fid.y},wardType:'stealth'}).ok,true);
assert.equal(fid.order.kind,'ward');
assert.equal(fid.trinket,'effigy');
const sylas=a.units.find(u=>u.id==='red_MID');
assert.equal(cmd('p2',1,'item.blackSpearRecover',sylas.id,{}).reason,'lanca_negra_indisponivel');
sylas.hijackedFatesCallV453Dev69C=true;
assert.equal(cmd('p2',1,'item.blackSpearRecover',sylas.id,{}).ok,true);
assert.equal(cmd('p2',2,'item.blackSpear',sylas.id,{targetId:'red_SUP'}).ok,true);
a.gameTime=181;
assert.equal(cmd('p2',3,'item.blackSpearRecover',sylas.id,{}).reason,'lanca_negra_indisponivel');
const projected=gateway.view('p2');
assert.equal(projected.units.filter(x=>x.team==='red').length,5);
assert.ok(projected.units.filter(x=>x.team==='blue').every(x=>x.oathswornIdV453Dev69C===undefined));
console.log('DEV69 CONDITIONAL PvP GATEWAY 1/1 PASS');
