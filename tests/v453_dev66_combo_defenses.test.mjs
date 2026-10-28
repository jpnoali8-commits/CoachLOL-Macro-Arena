/** Dev66 planned defensive combo and effect invariants. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Arena} from '../engine.mjs';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
const data=f=>JSON.parse(readFileSync(new URL('../data/'+f,import.meta.url)));
const map=data('coachlol_map_v6.json'),mask=data('masks_128.json'),manifest=data('rift_user_manifest_v452d4.json');
let pass=0;const check=(name,f)=>{f();pass++;console.log('✓ DEV66 COMBO '+name)};
for(const team of ['blue','red']){
 const registry=new PvPRoomRegistryV453Dev47({map,mask,manifest});const {room,player}=registry.create();const joined=room.join();
 const own=room.arena.units.find(u=>u.id===team+'_MID'),enemy=room.arena.units.find(u=>u.id===(team==='blue'?'red':'blue')+'_MID');
 const seat=room.players.find(p=>p.team===team),other=room.players.find(p=>p.team!==team);
 own.summonerSlots=['barrier','cleanse'];own.summonerSpell='barrier';
 own.x=enemy.x=.5;own.y=enemy.y=.5;own.autoAttack=enemy.autoAttack=false;own.autoFollow=enemy.autoFollow=false;
 room.arena.applyEffectV41(own,'root',{source:enemy,duration:10});
 const order={sequence:1,unitId:own.id,kind:'order.combo',payload:{targetId:enemy.id,steps:['BARRIER','CLEANSE']}};
 const blocked=room.command(other,order);
 check(team+' posse de combo é exclusiva',()=>assert.equal(blocked.ok,false));
 const accepted=room.command(seat,order);
 check(team+' combo BARRIER→CLEANSE aceito e privado',()=>{assert.equal(accepted.ok,true,JSON.stringify(accepted));assert.deepEqual(own.order.combo,['BARRIER','CLEANSE']);const opponent=room.view(other);const privateOrder=opponent.projection.units.find(u=>u.id===own.id)?.order;assert.notDeepEqual(privateOrder?.combo,['BARRIER','CLEANSE']);});
 room.confirm(room.players[0]);room.confirm(room.players[1]);
 let r=room.advance(1);
 check(team+' Barreira funciona mesmo enraizado',()=>{assert.equal(r.ok,true);assert.equal(own.order.comboIndex,1);assert.ok(own.shield>0);assert.ok(own.barrierCd>room.arena.gameTime);});
 const before=own.shield,life=own.hp;
 room.arena.damage(own,60,enemy,'magic');
 check(team+' Barreira absorve dano real antes do HP',()=>{assert.ok(own.shield<before);assert.equal(own.hp,life);});
 // First resolve the synthetic root before Cleanse would normally be needed.
 for(let k=0;k<3&&own.order.comboIndex<2;k++)if(room.arena.phase==='executing'&&!room.arena.pendingDecision)r=room.advance(1);
 check(team+' etapa Cleanse remove root e inicia cooldown',()=>{assert.equal(own.order.comboIndex,2);assert.equal(own.rootUntil,0);assert.ok(own.cleanseCd>room.arena.gameTime);});
 check(team+' dois casts distintos, sem duplicidade',()=>{const journal=room.arena.actionJournalV40.filter(x=>x.actorId===own.id&&x.source==='combo'&&x.kind==='summoner');assert.deepEqual(journal.map(x=>x.type),['barrier','cleanse']);});
 // Exhaust reduces offensive damage from its target, not damage suffered by that target.
 const a=new Arena(map,mask,{mode:'pvp',seed:21}),b=new Arena(map,mask,{mode:'pvp',seed:21});
 const attackerA=a.units.find(u=>u.id===team+'_MID'),victimA=a.units.find(u=>u.id!=='no'&&u.id===(team==='blue'?'red':'blue')+'_MID');
 const attackerB=b.units.find(u=>u.id===attackerA.id),victimB=b.units.find(u=>u.id===victimA.id);
 attackerA.x=victimA.x=attackerB.x=victimB.x=.5;attackerA.y=victimA.y=attackerB.y=victimB.y=.5;
 attackerA.exhaustUntil=a.gameTime+3;
 a.attack(attackerA,victimA,150,'skill');b.attack(attackerB,victimB,150,'skill');
 check(team+' Exaustão reduz dano do atacante',()=>{assert.ok(victimA.hp>victimB.hp,JSON.stringify([victimA.hp,victimB.hp]));});
}
console.log(`DEV66 COMBO ${pass}/${pass} PASS`);
