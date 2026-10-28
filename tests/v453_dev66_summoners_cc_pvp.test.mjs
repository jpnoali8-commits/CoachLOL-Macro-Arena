/** Dev66: Purificar, Flash e non-movement summoners under CC; two authenticated sessions. */
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {PvPRoomRegistryV453Dev47} from '../multiplayer/room_v453_dev47.mjs';
import {createPvPServerV453Dev47} from '../multiplayer/server_v453_dev47.mjs';
import {normalizeSummonerSlotsV452d4Dev11} from '../engine.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url)));
const map=read('coachlol_map_v6.json'),mask=read('masks_128.json'),manifest=read('rift_user_manifest_v452d4.json');
let assertions=0;const check=(name,cb)=>{cb();assertions++;console.log('✓ DEV66 '+name)};
check('champ select admite Cleanse, mas mantém Smite obrigatório na jungle',()=>{
 assert.deepEqual(normalizeSummonerSlotsV452d4Dev11('MID',['cleanse','flash']),['cleanse','flash']);
 assert.deepEqual(normalizeSummonerSlotsV452d4Dev11('JG',['cleanse','flash']),['flash','smite']);
 assert.deepEqual(normalizeSummonerSlotsV452d4Dev11('JG',['smite','cleanse']),['smite','cleanse']);
});
for(const team of ['blue','red']){
 const dir=mkdtempSync(join(tmpdir(),'coachlol-dev66-'));
 const registry=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir});
 let server=createPvPServerV453Dev47({registry,tickMs:0});let addr=await server.listen(0),base=`http://127.0.0.1:${addr.port}`;
 const request=async(path,payload,cookie='')=>{const r=await fetch(base+'/api/'+path,{method:payload===undefined?'GET':'POST',headers:{...(cookie?{cookie}:{}),...(payload===undefined?{}:{'content-type':'application/json',origin:base})},body:payload===undefined?undefined:JSON.stringify(payload)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')};};
 try{
  const create=await request('create',{}),blueCookie=create.cookie.split(';')[0],room=registry.get(create.data.roomId);
  const join=await request('join',{roomId:room.id}),redCookie=join.cookie.split(';')[0];
  const cookie=team==='blue'?blueCookie:redCookie,wrong=team==='blue'?redCookie:blueCookie;
  const own=room.arena.units.find(u=>u.id===team+'_MID'),enemy=room.arena.units.find(u=>u.id===(team==='blue'?'red':'blue')+'_MID');
  check(team+' duas sessões e cinco campeões por jogador',()=>{assert.equal(room.players.length,2);assert.equal(room.gateway.seats.get(team==='blue'?'p1':'p2').unitIds.length,5);assert.notEqual(cookie,wrong);});
  own.summonerSlots=['cleanse','flash'];own.summonerSpell='cleanse';
  own.x=enemy.x=.5;own.y=enemy.y=.5;own.autoFollow=enemy.autoFollow=false;own.autoAttack=enemy.autoAttack=false;
  // Typed disabling CC plus enemy summoner debuffs; Ignite GW is explicitly NOT removed.
  room.arena.applyEffectV41(own,'stun',{source:enemy,duration:9});
  room.arena.applyEffectV41(own,'root',{source:enemy,duration:9});
  room.arena.applyEffectV41(own,'grievous_wounds',{source:enemy,duration:9,key:'ignite'});
  own.exhaustUntil=room.arena.gameTime+8;
  room.arena.delayedEffects.push({id:'dev66_ignite_'+team,kind:'ignite_dot',owner:enemy.id,team:enemy.team,targetId:own.id,power:20,ticksLeft:4,dueRound:room.arena.round,dueAt:room.arena.gameTime+2});
  const hp=own.hp,initialCd=own.cleanseCd;
  const unauthorized=await request('action',{sequence:1,unitId:own.id,kind:'summoner.queue',payload:{type:'cleanse'}},wrong);
  check(team+' inimigo não agenda Cleanse de outro campeão',()=>assert.equal(unauthorized.status,409));
  const accepted=await request('action',{sequence:1,unitId:own.id,kind:'summoner.queue',payload:{type:'cleanse'}},cookie);
  const duplicate=await request('action',{sequence:1,unitId:own.id,kind:'summoner.queue',payload:{type:'cleanse'}},cookie);
  check(team+' Cleanse enfileirado pelo dono, resposta idempotente',()=>{assert.equal(accepted.status,200,JSON.stringify(accepted.data));assert.deepEqual(accepted.data,duplicate.data);assert.equal(own.cleanseCd,initialCd);});
  // Save the actual fog-filtered HTTP session for the Chromium DOM smoke.
  const projection=await request('session',undefined,cookie);
  const evidence=new URL('../docs/QA_EVIDENCE_V453_DEV66/',import.meta.url);
  mkdirSync(evidence,{recursive:true});
  writeFileSync(new URL(team+'_cleanse_session.json',evidence),JSON.stringify(projection.data));
  // Suppression blocks Cleanse with no resource commit; stun does not.
  room.arena.applyEffectV41(own,'suppression',{source:enemy,duration:9});
  const suppressed=room.arena.performActionV40({actorId:own.id,kind:'summoner',type:'cleanse',source:'test'});
  check(team+' supressão impede Cleanse sem gastar recarga',()=>{assert.equal(suppressed.ok,false);assert.equal(own.cleanseCd,initialCd);});
  room.arena.effectResolverV41().remove(own,{types:['suppression']});
  const readyBlue=await request('ready',{},blueCookie),readyRed=await request('ready',{},redCookie);
  check(team+' confirmação simultânea de turno',()=>{assert.equal(readyBlue.status,200);assert.equal(readyRed.status,200);assert.equal(room.arena.phase,'executing');});
  const advance=room.advance(1);
  check(team+' Cleanse executado sob stun e root',()=>{assert.equal(advance.ok,true,JSON.stringify(advance));assert.equal(own.statusEffectsV41.some(e=>['stun','root'].includes(e.type)&&e.until>room.arena.gameTime),false);assert.equal(own.stunUntil,0);assert.equal(own.rootUntil,0);assert.ok(own.cleanseCd>room.arena.gameTime);});
  check(team+' remove Ignite DoT e Exhaust; preserva GW',()=>{assert.equal(room.arena.delayedEffects.some(e=>e.kind==='ignite_dot'&&e.targetId===own.id),false);assert.equal(own.exhaustUntil,0);assert.equal(own.statusEffectsV41.some(e=>e.type==='grievous_wounds'&&e.until>room.arena.gameTime),true);});
  check(team+' tenacidade temporária tem janela de três segundos',()=>{assert.ok(own.cleanseTenacityUntilV453Dev66>room.arena.gameTime);assert.ok(own.cleanseTenacityUntilV453Dev66-room.arena.gameTime<=3);});
  const root=room.arena.applyEffectV41(own,'root',{source:enemy,duration:4,key:'new_root'});
  check(team+' novo CC é abreviado pela janela de tenacidade',()=>{assert.equal(root.ok,true);assert.ok(root.until-room.arena.gameTime<=1.000001);});
  const flashBlocked=room.arena.performActionV40({actorId:own.id,kind:'flash',point:{x:.502,y:.5},source:'test'});
  check(team+' root impede Flash sem consumir cooldown',()=>{assert.equal(flashBlocked.ok,false);assert.equal(own.flashCd,0);});
  room.arena.effectResolverV41().remove(own,{types:['root']});
  const flash=room.arena.performActionV40({actorId:own.id,kind:'flash',point:{x:.502,y:.5},source:'test'});
  check(team+' Flash autorizado sem CC e recarga única',()=>{assert.equal(flash.ok,true,JSON.stringify(flash));assert.ok(own.flashCd>room.arena.gameTime);});
  const again=room.arena.performActionV40({actorId:own.id,kind:'flash',point:{x:.503,y:.5},source:'test'});
  check(team+' Flash não pode repetir na mesma janela',()=>assert.equal(again.ok,false));
  room.persist();await server.close();const restored=new PvPRoomRegistryV453Dev47({map,mask,manifest,checkpointDir:dir});const loaded=restored.get(room.id);
  check(team+' snapshot conserva CD, escudos e sessão',()=>{assert.ok(loaded);const unit=loaded.arena.units.find(u=>u.id===own.id);assert.equal(unit.cleanseCd,own.cleanseCd);assert.equal(unit.flashCd,own.flashCd);assert.equal(unit.cleanseTenacityUntilV453Dev66,own.cleanseTenacityUntilV453Dev66);assert.equal(loaded.gateway.seats.get(team==='blue'?'p1':'p2').lastSequence,1);});
  server=createPvPServerV453Dev47({registry:restored,tickMs:0});addr=await server.listen(0);base=`http://127.0.0.1:${addr.port}`;
  const session=await request('session',undefined,cookie);
  check(team+' reconexão autenticada privada',()=>{assert.equal(session.status,200);assert.equal(session.data.team,team);assert.equal(session.data.projection.controlledUnitIds.length,5);});
 }finally{await server.close();rmSync(dir,{recursive:true,force:true});}
}
console.log(`DEV66 ${assertions}/${assertions} PASS`);
