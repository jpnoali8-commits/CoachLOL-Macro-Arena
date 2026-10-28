/** HTTP + Server-Sent Events. No third-party transport, trusted ticks only. */
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {catalog,ITEM_RECIPES,officialSaleValueV453Dev60,BOARD_KITS_V453_DEV69} from '../engine.mjs';
import {FORM_KITS_V453_M14} from './form_kits_v453_m14.mjs';
import {PvPRoomRegistryV453Dev47} from './room_v453_dev47.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url),'utf8'));
const SHOP_REFERENCE_V453_DEV62=read('riot_reference/sr_shop_26_21_dev49.json');
const PUBLIC={
 '/multiplayer.html':['multiplayer.html','text/html; charset=utf-8'],
 '/multiplayer/pvp_client_v453_dev47.js':['multiplayer/pvp_client_v453_dev47.js','text/javascript; charset=utf-8'],
 '/multiplayer/shop_v453_dev62.css':['multiplayer/shop_v453_dev62.css','text/css; charset=utf-8'],
 '/assets/mapa_atualizado.jpg':['assets/mapa_atualizado.jpg','image/jpeg']
};
const COOKIE='coachlol_pvp47';
const json=(res,status,obj,headers={})=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...headers});res.end(JSON.stringify(obj));};
const cookie=req=>{const m=(req.headers.cookie||'').match(/(?:^|;\s*)coachlol_pvp47=([0-9a-f]{64})(?:;|$)/);return m?.[1]||null;};
async function body(req){let size=0,buf='';for await(const chunk of req){size+=chunk.length;if(size>8192)throw Error('payload_excessivo');buf+=chunk;}const p=JSON.parse(buf||'{}');if(!p||Array.isArray(p)||typeof p!=='object')throw Error('payload_invalido');return p;}
const fail=(res,error,status=400)=>json(res,status,{ok:false,reason:String(error.message||error)});
export function createPvPServerV453Dev47({checkpointDir=null,tickMs=250,maxRooms=24,registry=null}={}){
 const rooms=registry||new PvPRoomRegistryV453Dev47({map:read('coachlol_map_v6.json'),mask:read('masks_128.json'),manifest:read('rift_user_manifest_v452d4.json'),checkpointDir,maxRooms});
 const server=http.createServer(async(req,res)=>{
  try{
   const path=new URL(req.url,'http://localhost').pathname;
   res.setHeader('x-frame-options','DENY');res.setHeader('referrer-policy','no-referrer');res.setHeader('x-content-type-options','nosniff');
   if(req.method==='GET'&&path==='/api/health')return json(res,200,{ok:true,version:'4.5.3-dev64'});
   if(req.method==='GET'&&(path==='/'||PUBLIC[path])){const [file,mime]=PUBLIC[path==='/'?'/multiplayer.html':path];const bytes=readFileSync(join(ROOT,file));res.writeHead(200,{'content-type':mime,'cache-control':'no-store'});return res.end(bytes);}
   if(!path.startsWith('/api/'))return fail(res,'nao_encontrado',404);
   // Same-origin mutations; cookies are HttpOnly, SameSite=Strict. No CORS.
   if(req.method==='POST'){
    const origin=req.headers.origin;
    if(origin&&origin!==`http://${req.headers.host}`&&origin!==`https://${req.headers.host}`)return fail(res,'origem_nao_permitida',403);
   }
   if(req.method==='POST'&&path==='/api/create'){
    const p=await body(req);if(Object.keys(p).some(k=>k!=='maxSeats'))throw Error('payload_invalido');
    if(p.maxSeats!==undefined&&p.maxSeats!==2)throw Error('pvp_exige_dois_jogadores_um_por_equipe');
    const r=rooms.create(2);return json(res,201,{ok:true,...r.room.view(r.player)},{'set-cookie':`${COOKIE}=${r.token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict`});
   }
   if(req.method==='POST'&&path==='/api/join'){
    const p=await body(req);if(Object.keys(p).join(',')!=='roomId'||!/^[0-9a-f]{8}$/.test(p.roomId))throw Error('codigo_de_sala_invalido');
    const room=rooms.get(p.roomId);if(!room)return fail(res,'sala_inexistente',404);
    const r=room.join();return json(res,200,{ok:true,...room.view(r.player)},{'set-cookie':`${COOKIE}=${r.token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict`});
   }
   const session=rooms.session(cookie(req));if(!session)return fail(res,'sessao_ausente',401);
   const {room,player}=session;
   if(req.method==='GET'&&path==='/api/session')return json(res,200,{ok:true,...room.view(player)});
   if(req.method==='GET'&&path==='/api/kits')return json(res,200,{ok:true,
    patch:'26.21',maturity:'board_prototype',
    formKits:Object.fromEntries(Object.entries(FORM_KITS_V453_M14).map(([champ,forms])=>
     [champ,Object.fromEntries(Object.entries(forms).map(([form,slots])=>
      [form,Object.fromEntries(['Q','W','E','R'].map(slot=>[slot,{
       shape:slots[slot].shape,range:slots[slot].range,
       passiveOnly:!!slots[slot].passiveOnly,
       implemented:slots[slot].implemented,
       transformTo:slots[slot].transformTo||null}]))]))])),
    specials:{
     Mordekaiser:{R:{shape:'target_enemy',range:650,specialUltimate:true,implemented:'realm_prototype'}},
     Kalista:{R:{shape:'self',range:0,specialUltimate:true,implemented:'oath_bound_prototype'}},
     Jinx:{R:{shape:'line_enemy',range:25000,specialUltimate:true,implemented:'legacy_projectile'}},
     Ezreal:{R:{shape:'line_enemy',range:25000,specialUltimate:true,implemented:'legacy_projectile'}},
     Ashe:{R:{shape:'line_enemy',range:25000,specialUltimate:true,implemented:'legacy_projectile'}},
     Karthus:{R:{shape:'self',range:0,specialUltimate:true,implemented:'legacy_channel'}},
     Soraka:{R:{shape:'self',range:0,specialUltimate:true,implemented:'legacy_global_heal'}}
    },
    kits:Object.fromEntries(
     Object.entries(BOARD_KITS_V453_DEV69).map(([champ,row])=>[champ,
      Object.fromEntries(['Q','W','E','R'].map(slot=>[slot,{
       shape:row[slot].shape,range:row[slot].range,passiveOnly:!!row[slot].passiveOnly,
       originSelf:!!row[slot].originSelf,boardTemporal:row[slot].boardTemporal||null,implemented:row[slot].implemented}]))]))});
   if(req.method==='GET'&&path==='/api/shop')return json(res,200,{ok:true,patch:'26.21',items:catalog.filter(i=>!i.notPurchasable&&!i.tags.includes('trinket')).map(i=>({id:i.id,name:i.name,cost:i.cost,refund:officialSaleValueV453Dev60(i.id),recipe:ITEM_RECIPES[i.id]||[],roleLock:i.roleLock||null,tags:i.tags,stats:i.stats})),referenceItems:Object.values(SHOP_REFERENCE_V453_DEV62.rows).filter(x=>x.status==='reference_only').map(x=>({id:x.id,name:x.name,cost:x.price,recipe:x.from||[],tags:x.tags||[],stats:null,playable:false}))});
   if(req.method==='GET'&&path==='/api/shop/quote'){
    const url=new URL(req.url,'http://localhost'),unitId=url.searchParams.get('unitId'),itemId=url.searchParams.get('itemId');
    if(!unitId||!itemId||!room.gateway?.seats.get(player.seatId)?.unitIds.includes(unitId))return fail(res,'unidade_nao_autorizada',403);
    const item=catalog.find(i=>i.id===itemId&&!i.notPurchasable&&!i.tags.includes('trinket'));
    if(!item)return fail(res,'item_nao_jogavel',404);
    const u=room.arena.units.find(x=>x.id===unitId&&x.team===player.team);
    const eligibility=room.arena.canBuy(player.team,unitId,itemId);
    return json(res,200,{ok:true,unitId,itemId,total:item.cost,remaining:room.arena.itemPurchaseCost(u,itemId),gold:u.gold,canBuy:!!eligibility.ok,reason:eligibility.ok?null:eligibility.reason});
   }
   if(req.method==='POST'&&path==='/api/action'){
    const p=await body(req);const r=room.command(player,p);return json(res,r.ok?200:409,r);
   }
   if(req.method==='POST'&&path==='/api/ready'){
    const p=await body(req);if(Object.keys(p).length)throw Error('payload_invalido');const r=room.confirm(player);return json(res,r.ok?200:409,r);
   }
   if(req.method==='GET'&&path==='/api/stream'){
    res.writeHead(200,{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-cache, no-store','connection':'keep-alive','x-accel-buffering':'no'});
    res.write(': connected\n\n');const detach=room.subscribe(player,projection=>res.write('event: state\ndata: '+JSON.stringify(projection)+'\n\n'));
    const heartbeat=setInterval(()=>{if(!res.destroyed)res.write(': heartbeat\n\n');},15000);
    res.on('close',()=>{clearInterval(heartbeat);detach();});return;
   }
   return fail(res,'recurso_nao_encontrado',404);
  }catch(error){return fail(res,error,error instanceof SyntaxError?400:400);}
 });
 let timer=null;
 return {server,rooms,async listen(port=0,host='127.0.0.1'){
  await new Promise((resolve,reject)=>server.once('error',reject).listen(port,host,resolve));
  if(tickMs>0)timer=setInterval(()=>{try{rooms.advanceAll();}catch(e){process.stderr.write('dev47 tick: '+e.message+'\n');}},tickMs);
  return server.address();
 },async close(){if(timer){clearInterval(timer);timer=null;}for(const room of rooms.rooms.values())room.persist();await new Promise(resolve=>server.close(resolve));}};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const s=createPvPServerV453Dev47({checkpointDir:process.env.COACHLOL_PVP_STATE||join(ROOT,'.pvp-local-state'),tickMs:Number(process.env.COACHLOL_TICK_MS||250)});
 const address=await s.listen(Number(process.env.PORT||8787),process.env.HOST||'127.0.0.1');
 console.log(`CoachLOL dev64 PvP 1x1 em http://${address.address}:${address.port}/multiplayer.html`);
}
