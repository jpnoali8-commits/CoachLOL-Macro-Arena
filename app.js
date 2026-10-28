(()=>{'use strict';
const $=id=>document.getElementById(id), {Arena,catalog,REACTIONS,recommendedItems,championStatsV39,STAT_SCHEMA_V39,abilityRule,RUNE_PAGES_V43,ITEM_EFFECTS_V43}=window.CoachArena;
const OBJECTIVE_HERALD_CLAIM_RANGE_V452D4_DEV20=175;
const storage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}};
let draft=JSON.parse(storage.get('coachlol_draft_v07')||'null');
// Offline preloaded bundles: no HTTP requests, static hosting or service worker required.
if(window.COACH_RIFT_USER_V452D4){
 window.MAP_DATA.riftBundlesV452d4=window.COACH_RIFT_USER_V452D4.variants;
 window.MAP_DATA.riftBaseFeaturesV452d4=window.COACH_RIFT_USER_V452D4.baseFeatures;
 window.MAP_DATA.scryerConeMaskV452d4=window.COACH_RIFT_USER_V452D4.scryerConeMask;
}
let match=new Arena(window.MAP_DATA,window.MASK_DATA,{draft,decisionSeconds:60,roundSeconds:10});
match.manualBlueHeraldPickupV452d4Dev20=true;
// Paginas escolhidas no Champ Select, nunca dentro da loja.
if(draft?.runePages)for(const team of ['blue','red'])for(const u of match.units.filter(x=>x.team===team)){
 const page=draft.runePages[team]?.[u.role];
 if(page&&RUNE_PAGES_V43[page])match.chooseRunePageV43(team,u.id,page);
}

let selected=null,selectedUnitIds=new Set(),comboDrafts=new Map(),lastPopupKey=null,action='auto',spell='none',comboSlots=[],pendingFightTargetId=null,tacticTab='path',waypoints=[],routeDrafts={},targetMode=false,drawRoute=false,secondsLeft=60,planningStartedAt=performance.now(),resolving=false,executionTimer=null,combatStyle='aa',commandPreview=null,commandPreviewSource=null,targetedSkillSlot=null;
const stage=$('boardHolder'),canvas=$('board'),ctx=canvas.getContext('2d');
const cinematicDirector=window.CoachCinematics?.create({stage,viewerTeam:'blue'});
// The inspector stays in the right sidebar. The board is never covered by an action dock.
const image=new Image();let riftMapVisualRevision=-1,riftMapImagePath='';
function syncRiftMapVisual(){
 const element=match.riftV452d4?.phase==='active'?match.riftV452d4.element:null;
 const path=element==='mountain'?'assets/user_rift_masks_20261026/mapa_mountain_atualizado.jpg':
  element==='ocean'?'assets/user_rift_masks_20261026/mapa_Ocean_atualizado.jpg':'assets/user_rift_masks_20261026/mapa_atualizado.jpg';
 if(path===riftMapImagePath&&riftMapVisualRevision===match.riftV452d4?.revision)return;
 riftMapImagePath=path;riftMapVisualRevision=match.riftV452d4?.revision??0;
 if(image.src&&!image.src.endsWith(path)) { image.src=path;mapComposite=null;prevMapComposite=null;fogCache=null;textureCache?.clear?.();projectedCache?.clear?.(); }
 else if(!image.src)image.src=path;
 mapComposite=null;fogCache=null;requestDraw();
}
image.onload=()=>{mapComposite=null;requestDraw()};
// Objective portraits from Riot client assets via CommunityDragon (patch 16.21).
// Missing or blocked remote assets fall back to bundled offline SVGs.
// Exact source paths are documented in data/riot_reference/objective_portraits_v453_dev47.json.
const RIOT_SCOREBOARD_ASSETS_V453_DEV47={
 blue:'_bluebuff',red:'_redbuff',baron:'_baronnashor',herald:'_riftherald',
 dragon:'_dragon',elder:'_elderdrake',infernal:'_infernaldrake',ocean:'_oceandrake',
 mountain:'_mountaindrake',cloud:'_clouddrake',hextech:'_hextechdrake',chemtech:'_chemtechdrake'
};
const structureImagesV453Dev48={};
for(const team of ['blue','red'])for(const kind of ['tower','tower_barricade','inhibitor','nexus']){
 const img=new Image();img.src=`assets/ui/structures_dev48/${team}_${kind}.png`;img.onload=()=>requestDraw();
 structureImagesV453Dev48[`${team}_${kind}`]=img;
}
const icons={};
for(const id of ['tower','nexus','inhibitor','baron','dragon','elder','infernal','ocean','mountain','cloud','hextech','chemtech',
 'red','blue','raptors','wolves','gromp','krugs','scuttle','herald','voidgrubs']){
 const img=new Image(),fallback='assets/icons/'+(id==='elder'?'dragon':id)+'.svg';
 img.crossOrigin='anonymous';img.onerror=()=>{if(img.src.endsWith(fallback))return;img.src=fallback};
 img.onload=()=>requestDraw();
 img.src=RIOT_SCOREBOARD_ASSETS_V453_DEV47[id]
  ?'https://raw.communitydragon.org/16.21/game/assets/ux/scoreboard/'+RIOT_SCOREBOARD_ASSETS_V453_DEV47[id]+'.png'
  :fallback;
 icons[id]=img;
}
const visionImages={};for(const type of ['stealth','control','oracle']){const icon=new Image();icon.src='assets/ui/vision/'+type+'.svg';icon.onload=()=>requestDraw();visionImages[type]=icon;}
// Original CC0 miniatures only. No text glyph is used to represent these map objects.
const MAP_CC0_ART_V452D4_DEV16={};
for(const key of ['ward_eye_gold','ward_eye_pink','ward_support_mint','hexgate_portal','scryer_glow_plant','blast_seed','heal_fruit_plant',
 'minion_melee_blue','minion_caster_blue','minion_siege_blue','minion_super_blue',
 'minion_melee_red','minion_caster_red','minion_siege_red','minion_super_red']){
 const img=new Image();img.src='assets/ui/map_cc0_v452d4_dev16/'+key+'.svg';img.onload=()=>requestDraw();
 MAP_CC0_ART_V452D4_DEV16[key]=img;
}

const pictures={};
const dragon=window.CoachDragon;
const skillCatalog=new Map(),requestedCatalog=new Set();
const officialPortrait=name=>dragon?.championPortrait(name)||`assets/portraits/${name}.webp`;
function whenPortraitFails(img,name){if(dragon)dragon.localFallback(img,name);else img.onerror=()=>{img.onerror=null;img.src=`assets/portraits/${name}.svg`;};}
function iconForChamp(name){let img=pictures[name];if(!img){img=new Image();whenPortraitFails(img,name);img.src=officialPortrait(name);img.onload=()=>requestDraw();pictures[name]=img;}return img}
function loadChampionSkills(name){if(!dragon||requestedCatalog.has(name))return;requestedCatalog.add(name);
 dragon.champion(name).then(data=>{skillCatalog.set(name,data||null);if(selected?.champ===name)updateInspector();}).catch(()=>{skillCatalog.set(name,null);if(selected?.champ===name)updateInspector();});}
const sumImages={};
function summonImage(key){if(!sumImages[key]){const img=new Image();img.src=dragon?.summonerIcon(key)||'';img.onload=()=>requestDraw();img.onerror=()=>{img.onerror=null;img.src='assets/ui/summoners/'+key+'.svg';};sumImages[key]=img;}return sumImages[key];}
const champSpells=u=>Array.isArray(u.summonerSlots)&&u.summonerSlots.length===2?u.summonerSlots:(u.role==='JG'&&u.smiteKey==='d'?['smite','flash']:['flash',u.summonerSpell||(u.role==='JG'?'smite':u.role==='SUP'?'exhaust':u.role==='TOP'?'tp':u.role==='ADC'?'heal':'ignite')]);
const endgameImages={victory:new Image(),defeat:new Image()};endgameImages.victory.src='assets/ui/endgame/victory_overlay.png';endgameImages.defeat.src='assets/ui/endgame/defeat_overlay.png';
let endgameIntroOpen=false,resultOverlayOpen=false,endgamePresentedKey=null;
function spellRemaining(u,k){return k==='flash'?Math.max(0,Math.ceil((u.flashCd||0)-match.gameTime)):k==='exhaust'?Math.max(0,Math.ceil((u.exhaustCd||0)-match.gameTime)):k==='smite'?(u.smiteCharges>0?0:Math.max(0,Math.ceil((u.smiteRecoveries?.[0]??match.gameTime)-match.gameTime))):Math.max(0,Math.ceil(((u[{tp:'tpCd',heal:'healCd',ignite:'igniteCd',barrier:'barrierCd',ghost:'ghostCd'}[k]]||0)-match.gameTime)));}

const human=team=>team==='blue'?'Azul':'Vermelho';const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
let selectedWardType='stealth',heraldDeployLaneV452d4Dev20='mid';
let camera={zoom:1.0,px:0,py:0,angle:0,tilt:.55};let dpr=1,dirt=true,fogCache=null,mapComposite=null,mapCompositeFog=null,hoverPos=null;
let lastShownRecallKey=null,prevMapComposite=null,fogTransitionAt=-100000;
let speedFactor=1;
const SIMULATION_FRAME_MS=650;
let livePose=new Map(),liveTransitionAt=0,lastFrameAt=0,liveTickCounter=0;
function currentDrawPos(unit){const old=livePose.get(unit.id);if(!old)return unit;const fraction=clamp((performance.now()-liveTransitionAt)/SIMULATION_FRAME_MS,0,1);return {x:old.x+(unit.x-old.x)*fraction,y:old.y+(unit.y-old.y)*fraction};}
function beforeLiveStep(){livePose=new Map([...match.units,...match.minions].map(u=>[u.id,{x:u.x,y:u.y}]));}
let lastAnnouncementKey='';
function announceLiveEvents(){
 if(cinematicDirector){cinematicDirector.ingest(match.events,{gameTime:match.gameTime,round:match.round});return;}
 const recent=match.events.find(e=>e.time===match.gameTime&&(['death','objective','jungle'].includes(e.kind))&&/morreu|eliminad|drag[aã]o|bar[aã]o|nashor/i.test(e.text));
 if(recent){const key=recent.time+':'+recent.text;if(key!==lastAnnouncementKey){lastAnnouncementKey=key;
  const box=document.createElement('div');box.className='eventOverlay';box.textContent=(recent.team==='blue'?'◈ ALIADO · ':'⚔ INIMIGO · ')+recent.text;
  stage.append(box);setTimeout(()=>box.remove(),3400);
 }}
}
function afterLiveStep(){liveTransitionAt=performance.now();fogCache=null;requestDraw();announceLiveEvents();
 const event=match.events.find(e=>['recall_complete','respawn'].includes(e.kind)&&e.team==='blue');
 if(event){const key=event.unitId+':'+event.time;if(key!==lastShownRecallKey){lastShownRecallKey=key;const u=match.units.find(v=>v.id===event.unitId);if(u?.awaitingShop){choose(u);openShop('all');notify(u.champ+(event.kind==='respawn'?' renasceu':' retornou')+'. Loja disponível e saída manual.');}}}
}
function resize(){let r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);dirt=true;requestDraw();}
window.addEventListener('resize',resize);setTimeout(resize,40);
// Camera orbital 2.5D: angular rotation happens in the GROUND PLANE (yaw),
// before perspective projection. This is NOT rolling a flat canvas clockwise.
// Game rules/collision remain in 0..1 atlas coordinates. Blue and red bases
// have the same projected scale in the initial 45-degree neutral azimuth.
// Both presentation and pointer picking use the same analytical mapping.
let matrixCache=null,matrixKey='',textureCache=new WeakMap(),projectedCache=new WeakMap();
const SQRT2=Math.SQRT2;
function cameraAngles(){return {yaw:((camera.angle*180/Math.PI)%360+360)%360,pitch:Math.round(camera.tilt*60)};}
function matrix(){
 const cw=canvas.clientWidth,ch=canvas.clientHeight;
 const key=[cw,ch,camera.zoom,camera.px,camera.py,camera.angle,camera.tilt].join('|');
 if(key===matrixKey&&matrixCache)return matrixCache;
 const co=Math.cos(camera.angle),si=Math.sin(camera.angle),vertical=1-camera.tilt*.30;
 // Calculate the true projected bounds of the four corners before fitting.
 // A fixed square fit biases one base; this fits both bases symmetrically.
 const projectedCorners=[];
 for(const x of [0,1])for(const y of [0,1]){
  const dx=x-.5,dy=y-.5,rx=dx*co-dy*si,ry=dx*si+dy*co;
  const depth=1-camera.tilt*ry;
  projectedCorners.push({x:rx/depth,y:vertical*ry/depth});
 }
 const xs=projectedCorners.map(p=>p.x),ys=projectedCorners.map(p=>p.y);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 // Camera scale and center must not depend on yaw. Otherwise dragging RMB
 // produces unintended zoom/reframing as the bounding box changes.
 const fitWidth=1/(1-camera.tilt*.5),fitHeight=vertical/(1-camera.tilt*.5);
 const size=Math.max(1,Math.min((cw-64)/(fitWidth*1.15),(ch-64)/(fitHeight*1.15)))*camera.zoom;
 const cx=cw/2+camera.px,cy=ch/2+camera.py;
 matrixKey=key;
 return matrixCache={cx,cy,size,cos:co,sin:si,tilt:camera.tilt,vertical};
}
function projected(m,x,y){
 const dx=x-.5,dy=y-.5;
 const rx=dx*m.cos-dy*m.sin,ry=dx*m.sin+dy*m.cos;
 const depth=1-m.tilt*ry;
 return {x:m.cx+m.size*rx/depth,y:m.cy+m.size*m.vertical*ry/depth};
}
function worldScreen(x,y){return projected(matrix(),x,y);}
function screenWorld(px,py){
 const m=matrix(),q=(py-m.cy)/m.vertical;
 const ry=q/(m.size+m.tilt*q);
 const depth=1-m.tilt*ry;
 const rx=(px-m.cx)*depth/m.size;
 // Inverse yaw => inverse world position; same mask geometry as the engine.
 return {x:clamp(.5+rx*m.cos+ry*m.sin,0,1),y:clamp(.5-rx*m.sin+ry*m.cos,0,1)};
}
function orbitTexture(img){
 const a=((camera.angle+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
 // Keep identical padded-rectangle geometry at yaw=0 and on all rotated frames.
 const round=Math.round(a*10000)/10000;
 const cached=textureCache.get(img);if(cached?.yaw===round)return {img:cached.canvas,factor:SQRT2};
 const width=img.naturalWidth||img.width;
 // Cache yaw re-projection; no costly image rotation on normal frame updates.
 const pixelSize=Math.min(width,1100),side=Math.ceil(pixelSize*SQRT2);
 const off=document.createElement('canvas');off.width=side;off.height=side;
 const c=off.getContext('2d',{alpha:true});
 c.translate(side/2,side/2);c.rotate(a);
 c.drawImage(img,-pixelSize/2,-pixelSize/2,pixelSize,pixelSize);
 textureCache.set(img,{yaw:round,canvas:off});
 return {img:off,factor:SQRT2};
}
function mapLayer(original,m,outCtx=ctx){
 if(!original||original.complete===false||!(original.naturalWidth||original.width))return;
 const {img,factor}=orbitTexture(original);
 const bands=m.tilt?128:1,sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height;
 if(!m.tilt){outCtx.drawImage(img,m.cx-m.size*factor/2,m.cy-m.size*factor/2,m.size*factor,m.size*factor);return;}
 // Slices follow the *rotated* horizontal camera axis; the map and entities
 // share identical projective depth instead of rotating a flat bitmap.
 for(let i=0;i<bands;i++){
  const y0=(i/bands-.5)*factor,y1=((i+1)/bands-.5)*factor;
  const y=(y0+y1)/2,depth=1-m.tilt*y,w=m.size*factor/depth;
  const top=m.size*m.vertical*y0/(1-m.tilt*y0)+m.cy;
  const bottom=m.size*m.vertical*y1/(1-m.tilt*y1)+m.cy;
  outCtx.drawImage(img,0,sh*i/bands,sw,sh/bands,m.cx-w/2,top-.15,w,bottom-top+.30);
 }
}
// Warp static map+fog only when the camera or vision state changes.
// Normal animation frames only blit a cached bitmap rather than 128 strips.
function projectedLayer(original,m){
 const key=matrixKey;
 const cached=projectedCache.get(original);
 if(cached?.key===key)return cached.canvas;
 const bmp=document.createElement('canvas');
 bmp.width=Math.max(1,canvas.clientWidth);bmp.height=Math.max(1,canvas.clientHeight);
 const out=bmp.getContext('2d',{alpha:true});
 mapLayer(original,m,out);
 projectedCache.set(original,{key,canvas:bmp});
 return bmp;
}
function syncTilt(){
 const pct=Math.round(camera.tilt*100);
 $('viewTiltRange').value=String(pct);$('tiltValue').textContent=pct+'%';
 const {yaw}=cameraAngles();
 if($('yawValue'))$('yawValue').textContent=Math.round(yaw)+'°';
 if($('perspectiveLabel'))$('perspectiveLabel').textContent=camera.tilt?'· PERSPECTIVA ORBITAL':'· VISÃO SUPERIOR';
 $('viewTilt').textContent=camera.tilt?'Perspectiva 2.5D':'Visão superior';
 $('viewTilt').classList.toggle('active',!!camera.tilt);
 requestDraw();
}

function requestDraw(){dirt=true;}
function drawCircle(x,y,r,color,stroke=null){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}}
const MAP_SPRITES_V452D4_DEV16=Object.freeze({
 stealth:Object.freeze({asset:'ward_eye_gold',ring:'#f0c967'}),
 control:Object.freeze({asset:'ward_eye_pink',ring:'#e875ad'}),
 support:Object.freeze({asset:'ward_support_mint',ring:'#74e4c8'}),
 hexgate:Object.freeze({asset:'hexgate_portal',ring:'#68c6f1'}),
 scryer_bloom:Object.freeze({asset:'scryer_glow_plant',ring:'#80e2ef'}),
 firelight_bloom:Object.freeze({asset:'scryer_glow_plant',ring:'#80e2ef'}),
 blast_cone:Object.freeze({asset:'blast_seed',ring:'#eba464'}),
 honeyfruit:Object.freeze({asset:'heal_fruit_plant',ring:'#84d78b'}),
 stim_fruit:Object.freeze({asset:'heal_fruit_plant',ring:'#84d78b'})
});
function drawCC0IconV452d4Dev16(asset,x,y,size){
 const img=MAP_CC0_ART_V452D4_DEV16[asset];
 if(img?.complete&&img.naturalWidth){ctx.drawImage(img,x-size/2,y-size/2,size,size);return true;}
 // Temporary graphical placeholder while the original SVG loads; never text.
 ctx.save();ctx.fillStyle='#10242d';ctx.strokeStyle='#98aeb9';ctx.lineWidth=1.3;
 ctx.beginPath();ctx.arc(x,y,Math.max(3,size*.26),0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();return false;
}
function drawProjectedBlastRadiusV452d4Dev16(plant){
 // Blast Cone gameplay launches every champion inside plant.radius (normalized
 // world space). Reproject the circle point-by-point through the 2.5D camera.
 const range=Math.max(.005,Math.min(.09,plant.radius||.03));
 const center=worldScreen(plant.x,plant.y);
 ctx.save();ctx.beginPath();
 for(let i=0;i<=56;i++){
  const a=2*Math.PI*i/56,q=worldScreen(plant.x+range*Math.cos(a),plant.y+range*Math.sin(a));
  if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);
 }
 ctx.closePath();ctx.fillStyle='rgba(221,133,68,.055)';ctx.strokeStyle='rgba(251,174,96,.74)';ctx.lineWidth=1.5;
 ctx.setLineDash([3,3]);ctx.fill();ctx.stroke();ctx.setLineDash([]);
 ctx.beginPath();ctx.arc(center.x,center.y,2.2,0,Math.PI*2);ctx.fillStyle='#fff0c4';ctx.fill();ctx.restore();
}
function drawBaronAuraV452d4Dev16(minion,r){
 // Visual-only: no influence over Baron modifiers or snapshots. Purple aura,
 // not a letter, includes a projected ground circle and faint luminous wisps.
 const pos=worldScreen(minion.x,minion.y),phase=(performance.now()/650+(minion.x||0)*7)%6.283;
 const groundRadius=Math.max(.012,(r+3)/Math.max(1,matrix().size));
 ctx.save();ctx.beginPath();
 for(let i=0;i<=48;i++){
  const theta=2*Math.PI*i/48,pt=worldScreen(minion.x+Math.cos(theta)*groundRadius,minion.y+Math.sin(theta)*groundRadius);
  if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);
 }
 ctx.closePath();ctx.fillStyle='rgba(146,76,251,.11)';ctx.strokeStyle='rgba(176,109,255,.68)';ctx.lineWidth=1.6;ctx.fill();ctx.stroke();
 const pulse=.83+.17*Math.sin(phase),radius=(r+5.5)*pulse;
 const grad=ctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,radius*1.85);
 grad.addColorStop(0,'rgba(201,146,255,.24)');grad.addColorStop(.47,'rgba(138,68,233,.19)');grad.addColorStop(1,'rgba(123,62,230,0)');
 ctx.fillStyle=grad;ctx.beginPath();ctx.arc(pos.x,pos.y,radius*1.85,0,Math.PI*2);ctx.fill();
 for(const turn of [0,2.1,4.2]){
  const a=phase+turn,px=pos.x+Math.cos(a)*(r+3.4),py=pos.y+Math.sin(a)*(r+2.7);
  ctx.beginPath();ctx.arc(px,py,1.25,0,Math.PI*2);ctx.fillStyle='rgba(204,150,255,.72)';ctx.fill();
 }
 ctx.restore();
}
function minionHasBaronAuraV452d4Dev15(minion){
 try{return !!match.baronMinionModifiersV452d(minion)?.empowered;}catch{return false;}
}
// Stable paint order: dead first, living later. The canvas draws later entries
// above earlier ones; never sort by team or hit points within the live layer.
function championAvatarOrderV453Dev47(units){
 return [...units].sort((a,b)=>Number(a.hp>0)-Number(b.hp>0));
}
function drawImageFit(img,x,y,w,h){if(img?.complete&&img.naturalWidth>0)ctx.drawImage(img,x,y,w,h)}
function buildFog(){const N=58,cn=document.createElement('canvas');cn.width=N;cn.height=N;let c=cn.getContext('2d');const viewSources=match.visionSources('blue');c.fillStyle='rgba(1,7,13,.60)';c.fillRect(0,0,N,N);
 for(let iy=0;iy<N;iy++)for(let ix=0;ix<N;ix++){let p={x:(ix+.5)/N,y:(iy+.5)/N};if(match.canSeePoint('blue',p,viewSources)){c.clearRect(ix,iy,1,1);}}
 fogCache=cn;
}
let baronVFXVisibleV452d4Dev16=false;
function render(){baronVFXVisibleV452d4Dev16=false;syncRiftMapVisual();dirt=false;let W=canvas.clientWidth,H=canvas.clientHeight;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle='#080809';ctx.fillRect(0,0,W,H);
 const m=matrix();
 if(!fogCache)buildFog();
 if(image.complete&&image.naturalWidth){
  if(!mapComposite||mapCompositeFog!==fogCache){
   const atlas=document.createElement('canvas');const res=Math.min(1600,image.naturalWidth);atlas.width=res;atlas.height=res;
   const c=atlas.getContext('2d');c.drawImage(image,0,0,res,res);
   if(match.riftV452d4?.element==='infernal'){c.fillStyle='rgba(155,42,25,.07)';c.fillRect(0,0,res,res);}
   c.drawImage(fogCache,0,0,res,res);
   if(mapComposite&&mapCompositeFog!==fogCache){prevMapComposite=mapComposite;fogTransitionAt=performance.now();}
   mapComposite=atlas;mapCompositeFog=fogCache;
  }
  // Fog changes blend between observed states; units move with interpolated poses.
  const blend=clamp((performance.now()-fogTransitionAt)/SIMULATION_FRAME_MS,0,1);
  if(prevMapComposite&&blend<1){ctx.drawImage(projectedLayer(prevMapComposite,m),0,0);ctx.save();ctx.globalAlpha=blend;ctx.drawImage(projectedLayer(mapComposite,m),0,0);ctx.restore();}
  else{prevMapComposite=null;ctx.drawImage(projectedLayer(mapComposite,m),0,0);}
 }

 // Static elemental annotations: public terrain POIs, never secret enemy positions.
 if(match.riftV452d4?.element==='cloud')for(const z of match.riftFeaturesV452d4('windZones')){
  const p=worldScreen(z.x,z.y),r=Math.max(12,z.radius*matrix().size);
  ctx.save();ctx.strokeStyle='rgba(138,212,240,.48)';ctx.fillStyle='rgba(90,177,213,.07)';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
 }
 // Only the blue team sees a bonus region attached to its own live ward.
 for(const w of match.wards){
  if(w.team!=='blue'||!w.faelightSiteId||!(w.faelightUntil>match.gameTime)||match.wardVisionSuppressedV452d4Dev26(w))continue;
  const site=match.riftAllFeaturesV452d4('faelights').find(p=>p.id===w.faelightSiteId);
  if(!site?.visionPolygon)continue;
  ctx.save();ctx.beginPath();site.visionPolygon.forEach(([x,y],i)=>{
   const q=worldScreen(x,y);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);
  });ctx.closePath();ctx.fillStyle='rgba(149,219,176,.105)';ctx.fill();ctx.restore();
 }
 for(const p of match.riftAllFeaturesV452d4('faelights')){
  if(p.activationVerified===false)continue;
  const xy=worldScreen(p.x,p.y);
  drawCircle(xy.x,xy.y,4,'rgba(176,225,180,.20)','rgba(168,231,174,.55)');
 }

 // Author-painted directional Scryer mask. The player chooses the angle.
 for(const pulse of match.riftVisionPulsesV452d4||[]){
  if(pulse.team!=='blue'||pulse.kind!=='scryer_bloom'||pulse.until<=match.gameTime)continue;
  const poly=match.scryerConeWorldPolygonV452d4(pulse);if(poly.length<3)continue;
  ctx.save();ctx.beginPath();poly.forEach((pt,i)=>{const v=worldScreen(pt.x,pt.y);if(i)ctx.lineTo(v.x,v.y);else ctx.moveTo(v.x,v.y);});ctx.closePath();ctx.fillStyle='rgba(88,199,222,.09)';ctx.fill();ctx.restore();
 }
 if(previewScryerAngleV452d4){
  const poly=match.scryerConeWorldPolygonV452d4(previewScryerAngleV452d4);if(poly.length>=3){
   ctx.save();ctx.beginPath();poly.forEach((pt,i)=>{const v=worldScreen(pt.x,pt.y);if(i)ctx.lineTo(v.x,v.y);else ctx.moveTo(v.x,v.y);});ctx.closePath();ctx.fillStyle='rgba(110,224,239,.16)';ctx.fill();ctx.restore();
  }
 }
 for(const plant of [...match.riftAllFeaturesV452d4('plants'),...match.riftAllFeaturesV452d4('scryers')]){
  if((match.riftPlantTimersV452d4?.[plant.id]||0)>match.gameTime)continue;
  if(!match.canSeePoint('blue',plant))continue;
  const p=worldScreen(plant.x,plant.y);
  if(plant.kind==='blast_cone')drawProjectedBlastRadiusV452d4Dev16(plant);
  const style=MAP_SPRITES_V452D4_DEV16[plant.kind]||MAP_SPRITES_V452D4_DEV16.scryer_bloom;
  drawCC0IconV452d4Dev16(style.asset,p.x,p.y,plant.kind==='blast_cone'?12:18);
 }
 if(match.riftV452d4?.element==='hextech')for(const gate of match.riftFeaturesV452d4('hexgates')){
  const xy=worldScreen(gate.x,gate.y);drawCC0IconV452d4Dev16(MAP_SPRITES_V452D4_DEV16.hexgate.asset,xy.x,xy.y,19);
 }
 // Public buildings: blue/red ownership, destroyed state, inhibitor respawn.
 const shot=match.perspective('blue');
 for(const s of shot.structures){
  const p=worldScreen(s.x,s.y),size=s.type==='nexus'?19:s.type==='inhibitor'?13:11;
  const alive=s.alive!==false,accent=s.team==='blue'?'#57b9ff':'#fd6b84';
  drawCircle(p.x,p.y,size+5,alive?(s.team==='blue'?'rgba(69,168,255,.14)':'rgba(251,106,132,.14)'):'rgba(79,85,95,.16)',alive?accent:'#65727b');
  const ico=structureImagesV453Dev48[`${s.team}_${s.type==='tower'&&s.tier==='guard'?'tower_barricade':s.type}`]||icons[s.type];
  if(ico?.naturalWidth){ctx.save();ctx.globalAlpha=alive?1:.5;ctx.filter=alive?'none':'grayscale(1)';drawImageFit(ico,p.x-size,p.y-size,size*2,size*2);ctx.restore();}
  else drawCircle(p.x,p.y,size,alive?accent:'#68737d');
  if(alive){const fraction=clamp(s.hp/s.maxHp,0,1);ctx.fillStyle='#030b10';ctx.fillRect(p.x-12,p.y-size-11,24,3);ctx.fillStyle=accent;ctx.fillRect(p.x-12,p.y-size-11,24*fraction,3);}
  else if(s.type==='inhibitor'&&s.respawnAt>match.gameTime){
   const rem=Math.ceil(s.respawnAt-match.gameTime);ctx.fillStyle='#e7d8b8';ctx.textAlign='center';ctx.font='bold 9px Inter,Arial';
   ctx.fillText(String(Math.floor(rem/60)).padStart(2,'0')+':'+String(rem%60).padStart(2,'0'),p.x,p.y+size+12);
  }
 }
 for(const camp of shot.camps){
  const phase=window.CoachArena.OBJECTIVE_PHASES_V44?.[camp.timerKey];
  if(phase&&(match.gameTime<phase.spawn||(phase.leave&&match.gameTime>=phase.leave)))continue;
  const p=worldScreen(camp.x,camp.y),kind=camp.timerKey;
  const dragonIcon=kind==='dragon'?(camp.dragonKind==='elder'?'elder':(['infernal','ocean','mountain','cloud','hextech','chemtech'].includes(camp.dragonElement)?camp.dragonElement:'dragon')):kind;
  const ico=icons[dragonIcon]||icons[kind]||icons.gromp;
  const respawn=camp.knownRespawnAt&&camp.knownRespawnAt>match.gameTime?Math.ceil(camp.knownRespawnAt-match.gameTime):null;
  const hidden=camp.unknown===true&&!respawn;
  const dead=camp.alive===false||!!respawn;
  drawCircle(p.x,p.y,13,dead||hidden?'rgba(87,95,104,.13)':'rgba(226,174,66,.13)',dead||hidden?'rgba(140,154,164,.5)':'rgba(209,170,99,.45)');
  if(ico?.naturalWidth){ctx.save();ctx.filter=dead||hidden?'grayscale(1)':'none';ctx.globalAlpha=dead?.55:hidden?.6:1;drawImageFit(ico,p.x-11,p.y-11,22,22);ctx.restore();}
  if(respawn){const mm=String(Math.floor(respawn/60)).padStart(2,'0'),ss=String(respawn%60).padStart(2,'0');
   drawCircle(p.x,p.y,12,'rgba(4,12,19,.80)','#b8a579');ctx.font='bold 9px Inter,Arial';ctx.textAlign='center';ctx.fillStyle='#f1e0ae';ctx.fillText(mm+':'+ss,p.x,p.y+3);
  }else if(hidden){ctx.font='bold 15px Inter,Arial';ctx.textAlign='center';ctx.lineWidth=2.5;ctx.strokeStyle='#050b12';ctx.fillStyle='#f1e0ae';ctx.strokeText('?',p.x,p.y+5);ctx.fillText('?',p.x,p.y+5);}

  const rule=selected?.role==='JG'&&selected.smitePolicy?.mode==='targets'?selected.smitePolicy.rules?.find(r=>r.targetId===camp.id):null;
  if(!hidden&&camp.timerKey==='voidgrubs'&&Array.isArray(camp.grubsV45)&&camp.alive){
   camp.grubsV45.forEach((g,i)=>{const gx=p.x-15+i*15,gy=p.y+21;ctx.fillStyle=g.alive?'#272319':'#3b3435';ctx.fillRect(gx-5,gy,12,4);
    if(g.alive){ctx.fillStyle='#d7b36e';ctx.fillRect(gx-5,gy,12*clamp(g.hp/g.maxHp,0,1),4);}});
  }
  if(rule&&camp.alive&&Number.isFinite(camp.health)){
   ctx.save();ctx.strokeStyle='#f1d27d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,17,0,2*Math.PI);ctx.stroke();
   ctx.textAlign='center';ctx.font='bold 10px Inter,Arial';ctx.fillStyle='#f8e3a1';
   ctx.fillText(Math.ceil(camp.health)+' HP · ⚡'+(rule.hpThreshold??(selected.smiteDamage||600)),p.x,p.y-22);
   if(camp.leashState==='soft'||camp.leashState==='hard'){ctx.fillStyle='#ffa26e';ctx.fillText('RESET '+camp.leashState.toUpperCase(),p.x,p.y-35)}
   else if(camp.leashState==='engaged'&&camp.patience<100){ctx.fillStyle='#d7a95c';ctx.fillText('PACIÊNCIA '+Math.round(camp.patience)+'%',p.x,p.y-35)}
   ctx.restore();
  }
 }
 // Mercenaries are visible by true team fog; show a projected weak eye at
 // the rear only when its 3s cooldown is ready. No map-wide hidden reveal.
 for(const h of shot.team.heraldMercenaries||[]){
  const p=worldScreen(h.x,h.y);drawCircle(p.x,p.y,13,'#221b10',h.team==='blue'?'#b795ed':'#ed9baf');
  const next=h.eyeReadyAtV452d4Dev21??h.spawnAt??0;
  if(match.gameTime>=next){
   const dx=(h.facingX??(h.team==='blue'?1:-1)),dy=h.facingY??0;
   const behind=worldScreen(h.x-dx*19/Math.max(1,match.worldWidth),h.y-dy*19/Math.max(1,match.worldHeight));
   drawCircle(behind.x,behind.y,5,'#30173f','#ddb3ff');
   ctx.save();ctx.fillStyle='#f8e8ff';ctx.beginPath();ctx.arc(behind.x,behind.y,2.3,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  if(Number.isFinite(h.hp)&&Number.isFinite(h.maxHp)){ctx.fillStyle='#0d1020';ctx.fillRect(p.x-15,p.y+14,30,4);ctx.fillStyle='#bb80ff';ctx.fillRect(p.x-15,p.y+14,30*clamp(h.hp/Math.max(1,h.maxHp),0,1),4);}
  const art=icons.herald;if(art?.naturalWidth)drawImageFit(art,p.x-11,p.y-11,22,22);
  ctx.save();ctx.textAlign='center';ctx.font='bold 8px Arial';ctx.fillStyle='#e8caef';ctx.fillText('ARAUTO',p.x,p.y-18);ctx.restore();
 }
 // The winning team can see the Eye of the Herald until a carrier picks it up.
 if(match.heraldEyeV45&&!match.heraldEyeV45.holderId&&match.heraldEyeV45.expiresAt>=match.gameTime&&
    (match.heraldEyeV45.owner==='blue'||match.canSeePoint('blue',match.heraldEyeV45))){
  const eye=match.heraldEyeV45,p=worldScreen(eye.x,eye.y);
  drawCircle(p.x,p.y,14,'rgba(57,29,83,.85)','#b793f5');
  if(icons.herald?.naturalWidth)drawImageFit(icons.herald,p.x-11,p.y-11,22,22);
 }
 // minion families compact and faction colored, no individual permanent editor POIs.
 for(const u of shot.minions){
  const display=currentDrawPos(u),line=match.lanes[u.lane];
  const formed=Number.isFinite(u.bodyX)&&Number.isFinite(u.bodyY)?{x:u.bodyX,y:u.bodyY}:(line?match.minionFormationPointV453Dev48(line,u.progress,u.kind,u.formationSlotV453Dev48??1,u.team):display);
  const p=worldScreen(formed.x,formed.y);
  const kind=['melee','caster','siege','super'].includes(u.kind)?u.kind:'melee';
  const size={melee:12,caster:12,siege:16,super:17}[kind],r=size*.48;
  const baron=minionHasBaronAuraV452d4Dev15(u);
  if(baron){baronVFXVisibleV452d4Dev16=true;drawBaronAuraV452d4Dev16(u,r);}
  drawCC0IconV452d4Dev16('minion_'+kind+'_'+(u.team==='red'?'red':'blue'),p.x,p.y,size);
  ctx.save();ctx.fillStyle='rgba(6,17,25,.94)';ctx.fillRect(p.x-r,p.y-r-5,2*r,2.2);
  ctx.fillStyle='#78d999';ctx.fillRect(p.x-r,p.y-r-5,2*r*clamp(u.hp/u.maxHp,0,1),2.2);ctx.restore();
 }
 // Tactical indicators for spells already cast: never reveal a hidden
 // enemy champion's coordinates from a projectile in the fog.
 for(const fx of match.delayedEffects||[]){
  if(fx.kind==='global_projectile'&&fx.team==='blue'&&fx.point&&fx.origin){
   const origin=worldScreen(fx.origin.x,fx.origin.y),end=worldScreen(fx.point.x,fx.point.y);
   ctx.save();ctx.strokeStyle='#e5bf70';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  }
 }
 // Dev42: compact client projection of the *authoritative* traveling Q.
 // Allied launch rays are safe to display; enemy casts in fog are not leaked.
 for(const proj of match.championProjectilesV453Dev42||[]){
  if(proj.team!=='blue'||proj.kind!=='ezreal_q')continue;
  const start=worldScreen(proj.origin.x,proj.origin.y);
  const finish=worldScreen(proj.origin.x+proj.unit.x*proj.range/match.worldWidth,
   proj.origin.y+proj.unit.y*proj.range/match.worldHeight);
  const ratio=clamp((proj.traveledV453Dev43??Math.max(0,(match.gameTime-proj.createdAt)*proj.speed))/Math.max(1,proj.range),0,1);
  const dot={x:start.x+(finish.x-start.x)*ratio,y:start.y+(finish.y-start.y)*ratio};
  ctx.save();ctx.strokeStyle='rgba(226,188,106,.68)';ctx.lineWidth=2;ctx.setLineDash([5,6]);
  ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(finish.x,finish.y);ctx.stroke();ctx.setLineDash([]);
  drawCircle(dot.x,dot.y,5,'#f4dba3','#c89542');ctx.restore();
 }
 // Dev43: selected allied Irelia blades; use only our own authored points.
 // Never expose private enemy placements through the fog of war.
 for(const blades of Object.values(match.ireliaBladesV453Dev43||{})){
  if(blades.team!=='blue')continue;
  const first=worldScreen(blades.first.x,blades.first.y);
  const second=blades.second?worldScreen(blades.second.x,blades.second.y):null;
  ctx.save();ctx.strokeStyle='#ddbb72';ctx.fillStyle='#fff1bf';ctx.lineWidth=2;
  if(second){ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(first.x,first.y);
   ctx.lineTo(second.x,second.y);ctx.stroke();ctx.setLineDash([]);}
  for(const pt of [first,second].filter(Boolean)){
   ctx.beginPath();ctx.moveTo(pt.x,pt.y-10);ctx.lineTo(pt.x+5,pt.y);
   ctx.lineTo(pt.x,pt.y+10);ctx.lineTo(pt.x-5,pt.y);ctx.closePath();ctx.fill();ctx.stroke();
  }
  ctx.restore();
 }
 // Unsteady indicator is only drawn on a visible enemy; mark state cannot
 // reveal a hidden champion through the team's fog-of-war projection.
 for(const t of shot.units||[]){
  const mark=t.ireliaMarkV453Dev42;
  if(t.team==='blue'||!mark||mark.until<=match.gameTime||!match.units.some(u=>u.team==='blue'&&u.id===mark.ownerId))continue;
  const xy=worldScreen(t.x,t.y);ctx.save();ctx.strokeStyle='#dfad64';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(xy.x,xy.y,19,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
  for(const w of shot.wards){
   const p=worldScreen(w.x,w.y),control=w.type==='control',support=w.type==='support';
   const style=MAP_SPRITES_V452D4_DEV16[control?'control':support?'support':'stealth'];
   const full=w.until===null?null:(w.until-(w.createdAt||0));
   const progress=full===null?1:Math.max(0,Math.min(1,(w.until-match.gameTime)/Math.max(1,full)));
   drawCC0IconV452d4Dev16(style.asset,p.x,p.y,20);
   // Lifetime ring stays a tiny status indicator, not the icon itself.
   ctx.save();ctx.strokeStyle=style.ring;ctx.lineWidth=1.8;ctx.beginPath();
   ctx.arc(p.x,p.y,12,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.stroke();ctx.restore();
  }
 for(const u of shot.units.filter(u=>u.team==='blue'&&u.order?.kind==='ward'&&u.order.destination)){
  const p=worldScreen(u.order.destination.x,u.order.destination.y);
  ctx.strokeStyle='#f7d27b';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(p.x,p.y,10,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
 }
 if(action==='ward'&&targetMode&&hoverPos&&selected?.hp>0){
  const p=worldScreen(hoverPos.x,hoverPos.y),ok=match.walkable(hoverPos.x,hoverPos.y);
  ctx.strokeStyle=ok?'#f1d087':'#fb6574';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,11,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(p.x-15,p.y);ctx.lineTo(p.x+15,p.y);ctx.moveTo(p.x,p.y-15);ctx.lineTo(p.x,p.y+15);ctx.stroke();
 }

 // Dev47: layer by alive status, not by roster order or team. Dead avatars
 // occupy the back layer, with subdued portraits and authoritative respawn.
 // No enemy corpses are fabricated outside the team's fog projection.
 for(const u of championAvatarOrderV453Dev47(shot.units)){
  if(u.hp<=0){
   const display=currentDrawPos(u),p=worldScreen(display.x,display.y);
   const img=iconForChamp(u.champ);
   ctx.save();
   drawCircle(p.x,p.y,16,'rgba(27,33,40,.45)','#66717b');
   if(img?.complete&&img.naturalWidth){
    ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.clip();
    ctx.filter='grayscale(1) brightness(.46)';ctx.globalAlpha=.76;
    drawImageFit(img,p.x-12,p.y-12,24,24);ctx.restore();
   }else{ctx.fillStyle='#9aa2aa';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText(u.champ?.[0]||'?',p.x,p.y+4);}
   // Dead allies have an authoritative timer. Do not infer unseen enemy data.
   if(u.team==='blue'&&Number.isFinite(u.deadUntil)){
    const remaining=Math.max(0,Math.ceil(u.deadUntil-match.gameTime));
    const label=remaining>=60?`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`:`${remaining}s`;
    ctx.fillStyle='rgba(3,7,12,.83)';ctx.fillRect(p.x-15,p.y+14,30,12);
    ctx.textAlign='center';ctx.font='bold 10px Inter,Arial';ctx.fillStyle='#e3e4e5';ctx.fillText(label,p.x,p.y+23);
   }
   ctx.restore();continue;
  }
  const display=currentDrawPos(u);let p=worldScreen(display.x,display.y),isSelected=u.team==='blue'&&selectedUnitIds.has(u.id);drawCircle(p.x,p.y,isSelected?(selected?.id===u.id?24:22):18,u.team==='blue'?'rgba(61,155,219,.31)':'rgba(235,80,101,.31)',isSelected?'#eccc7c':null);
  drawCircle(p.x,p.y,16,'#081923',u.team==='blue'?'#58b9ff':'#fb667b');const img=iconForChamp(u.champ);if(img.complete&&img.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,13,0,Math.PI*2);ctx.clip();drawImageFit(img,p.x-13,p.y-13,26,26);ctx.restore()}else{ctx.font='bold 13px Arial';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(u.champ[0],p.x,p.y+5)}
  ctx.fillStyle='#050b11';ctx.fillRect(p.x-19,p.y+20,38,5);ctx.fillStyle='#66d29c';ctx.fillRect(p.x-19,p.y+20,38*clamp(u.hp/u.maxHp,0,1),5);ctx.fillStyle='#fff';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText(u.champ,p.x,p.y-24);
  // Status belongs under the champion avatar/health, not a permanent panel.
  const mark=(match.delayedEffects||[]).find(f=>f.kind==='zed_mark'&&f.targetId===u.id);
  if(u.stasisUntil>match.gameTime||mark){ctx.font='bold 8px Inter,Arial';ctx.textAlign='center';ctx.fillStyle=u.stasisUntil>match.gameTime?'#94e8f6':'#ff6b7a';ctx.fillText(u.stasisUntil>match.gameTime?'ESTASE':`MARCA · T${mark.dueRound}`,p.x,p.y+40);}
  if(u.allOutUntil>match.gameTime){ctx.fillStyle='#f5cc72';ctx.fillText('ALL OUT',p.x,p.y+50);}
  if(u.rootUntil>match.gameTime){ctx.fillStyle='#bd8bff';ctx.fillText('ENRAIZADO',p.x,p.y+50);}
  if(u.ccStatus?.until>match.gameTime){ctx.font='bold 8px Inter,Arial';ctx.fillStyle='#dda0ff';ctx.textAlign='center';const ccNames={stun:'ATORDOADO',knockup:'LANÇADO AO AR',slow:'LENTIDÃO',root:'ENRAIZADO'};ctx.fillText(`${ccNames[u.ccStatus.kind]||u.ccStatus.kind} · ${Math.ceil(u.ccStatus.until-match.gameTime)}s`,p.x,p.y+59);}
  if(u.team==='blue'){const slots=champSpells(u);
   for(let i=0;i<2;i++){const type=slots[i],time=spellRemaining(u,type),x=p.x+25+i*19,y=p.y+16,img=summonImage(type);
    ctx.fillStyle='#090a0cee';ctx.fillRect(x,y,17,17);ctx.strokeStyle=time?'#5b5853':'#a18a5e';ctx.lineWidth=.9;ctx.strokeRect(x,y,17,17);
    if(img.complete&&img.naturalWidth){ctx.save();if(time)ctx.filter='grayscale(1) brightness(.55)';ctx.drawImage(img,x+1,y+1,15,15);ctx.restore();}
    else{ctx.fillStyle='#d0b677';ctx.font='bold 10px Arial';ctx.fillText(type==='smite'?'S':type==='flash'?'F':type[0].toUpperCase(),x+8.5,y+12);}
    if(time){ctx.fillStyle='#030305bb';ctx.fillRect(x,y,17,17);ctx.fillStyle='#f5f0e5';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText(time>=60?Math.ceil(time/60)+'m':String(time),x+8.5,y+12);}
   }}

 }
 // Resolved, fog-filtered VFX. Never compute damage or target discovery in renderer.
 for(const ev of shot.events||[]){
  if(ev.kind!=='skill_vfx'||!ev.vfx||ev.vfx.expiresAt<match.gameTime)continue;
  const fx=ev.vfx;ctx.save();ctx.lineCap='round';ctx.globalAlpha=.82;
  ctx.strokeStyle=fx.type==='final_spark'?'#f0e59b':fx.type?.includes('lucent')?'#f1bc67':'#60d3f4';
  if(fx.at&&Number.isFinite(fx.radius)){
   // World-space AoE projects correctly with orbital camera and respects fog via shot.events.
   const r=Math.max(20,fx.radius);ctx.fillStyle=fx.type?.includes('lucent')?'rgba(236,186,86,.17)':'rgba(88,208,237,.16)';
   ctx.lineWidth=2.4;ctx.beginPath();for(let i=0;i<=60;i++){
    const t=i*2*Math.PI/60,pt=worldScreen(fx.at.x+Math.cos(t)*r/match.worldWidth,fx.at.y+Math.sin(t)*r/match.worldHeight);
    if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);
   }ctx.fill();ctx.stroke();
  }else if(fx.from&&fx.to){
   const from=worldScreen(fx.from.x,fx.from.y),to=worldScreen(fx.to.x,fx.to.y);
   ctx.lineWidth=fx.type==='final_spark'?11:Math.max(5,(fx.width||140)/14);ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=10;
   ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();
   ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.lineWidth=2.2;ctx.strokeStyle='#f6fbff';ctx.stroke();
  }ctx.restore();
 }
 // Cluster markers show a count without inventing positions in fog.
 // The actual list is opened on click and is keyboard accessible.
 const visiblePlayers=shot.units.filter(u=>u.hp>0);
 const grouped=new Set();
 for(const u of visiblePlayers){if(grouped.has(u.id))continue;
  const p=worldScreen(currentDrawPos(u).x,currentDrawPos(u).y);
  const nearby=visiblePlayers.filter(v=>Math.hypot(worldScreen(currentDrawPos(v).x,currentDrawPos(v).y).x-p.x,worldScreen(currentDrawPos(v).x,currentDrawPos(v).y).y-p.y)<31);
  if(nearby.length<2)continue;
  nearby.forEach(v=>grouped.add(v.id));
  drawCircle(p.x+21,p.y-23,10,'#15110a','#c8aa6e');ctx.textAlign='center';ctx.fillStyle='#f2db9a';ctx.font='bold 10px Inter,Arial';ctx.fillText(String(nearby.length),p.x+21,p.y-20);
 }
 if(selected?.hp>0){const route=selected.plan&&!selected.plan.completed?selected.plan.steps.slice(selected.plan.index).flatMap(s=>s.path?.length?s.path:[s.point]):[...selected.order?.path||[]];if(drawRoute)route.push(...waypoints.map(w=>w.point||w));if(route.length){ctx.strokeStyle='#f4c971';ctx.lineWidth=2.6;ctx.setLineDash([8,5]);ctx.beginPath();let o=worldScreen(selected.x,selected.y);ctx.moveTo(o.x,o.y);for(let point of route){let s=worldScreen(point.x,point.y);ctx.lineTo(s.x,s.y)}ctx.stroke();ctx.setLineDash([]);let upto=0,prev=selected;ctx.lineWidth=5;ctx.strokeStyle='rgba(93,213,247,.95)';ctx.beginPath();ctx.moveTo(o.x,o.y);for(const point of route){const len=match.mapDistance(prev,point),take=Math.min(len,Math.max(0,match.effectiveMS(selected)*2-upto));if(take<=0)break;const at={x:prev.x+(point.x-prev.x)/Math.max(len,.0001)*take,y:prev.y+(point.y-prev.y)/Math.max(len,.0001)*take};let r=worldScreen(at.x,at.y);ctx.lineTo(r.x,r.y);upto+=take;prev=point}ctx.stroke();}}
 if(selected?.hp>0){
  // AA range only. Project its real world-space footprint through orbital camera.
  // Use the interpolated avatar position to prevent the ring from lagging behind.
  const center=currentDrawPos(selected),radius=selected.range;
  ctx.strokeStyle='rgba(230,203,129,.46)';ctx.lineWidth=1.2;ctx.beginPath();
  for(let i=0;i<=64;i++){const angle=i*Math.PI*2/64,p=worldScreen(center.x+radius*Math.cos(angle),center.y+radius*Math.sin(angle));if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)}
  ctx.stroke();
  if(targetMode&&selected&&['ult_direction','target_skill','kit_location','irelia_e_target'].includes(action)){
   const slot=action==='ult_direction'?'R':action==='irelia_e_target'?'E':targetedSkillSlot;
   if(slot){const rule=abilityRule(selected,slot),rank=selected.skillRanks?.[slot]||1;
    const meters=rule.rangeByRank?.[Math.min(rank-1,rule.rangeByRank.length-1)]||rule.range;
    const radius=meters/match.worldWidth;
    ctx.save();ctx.strokeStyle='#e2ba65';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();
    for(let i=0;i<=72;i++){const angle=i*Math.PI*2/72,p=worldScreen(center.x+radius*Math.cos(angle),center.y+radius*Math.sin(angle));if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);}
    ctx.stroke();ctx.setLineDash([]);
    if(hoverPos&&['line','line_recast','line_projectile'].includes(rule.kind)){
     const dx=hoverPos.x-center.x,dy=hoverPos.y-center.y,sz=Math.hypot(dx,dy)||1;
     const target=worldScreen(center.x+dx/sz*radius,center.y+dy/sz*radius),src=worldScreen(center.x,center.y);
     ctx.strokeStyle='rgba(244,206,113,.9)';ctx.lineWidth=Math.max(3,rule.width/100);ctx.beginPath();ctx.moveTo(src.x,src.y);ctx.lineTo(target.x,target.y);ctx.stroke();
    }else if(hoverPos&&['ground_circle','ground_zone'].includes(rule.kind)){
     const pos=worldScreen(hoverPos.x,hoverPos.y);ctx.strokeStyle='rgba(244,206,113,.95)';ctx.fillStyle='rgba(244,206,113,.13)';
     ctx.beginPath();for(let i=0;i<=64;i++){
      const a=i*Math.PI*2/64,q=worldScreen(hoverPos.x+Math.cos(a)*rule.radius/match.worldWidth,hoverPos.y+Math.sin(a)*rule.radius/match.worldHeight);
      if(!i)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);
     }ctx.fill();ctx.stroke();
    }
    ctx.restore();
   }
  }
  if(targetMode&&['flash','escape_skill'].includes(action)){
   const allowed=action==='flash'?400:selected.champ==='Tristana'?900:475;
   const worldR=allowed/match.worldWidth;
   ctx.strokeStyle='rgba(88,220,190,.9)';ctx.setLineDash([5,5]);ctx.beginPath();
   for(let i=0;i<=72;i++){const a=i*Math.PI*2/72,p=worldScreen(center.x+worldR*Math.cos(a),center.y+worldR*Math.sin(a));if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);}
   ctx.stroke();ctx.setLineDash([]);
  }
 }
}
function startRAF(){const next=(now)=>{if((dirt||baronVFXVisibleV452d4Dev16||performance.now()-liveTransitionAt<SIMULATION_FRAME_MS+80||performance.now()-fogTransitionAt<SIMULATION_FRAME_MS+80)&&now-lastFrameAt>(baronVFXVisibleV452d4Dev16?62:33)){render();lastFrameAt=now;}requestAnimationFrame(next)};requestAnimationFrame(next)}
const ACTIONS=[['stop','Parar rota','■','S'],['move','Mover','➤','M'],['route','Rota desenhada','〰','R'],['farm','Farm automático','◇',''],['fight','Lutar / combo','⚔','A'],['push','Pressionar torre','♜',''],['defend','Defender','⬡','D'],['ward','Wardar','◉','4'],['jungle','Jungle','♣',''],['objective','Objetivo','★',''],['recall','Recall','↶','B'],['flash','Flash','✦','F']];
function notify(t){$('notice').textContent=t;$('notice').hidden=false;clearTimeout(window.noticeTimeout);window.noticeTimeout=setTimeout(()=>$('notice').hidden=true,3000)}
const SMITE_NAMES={red:'Red',blue:'Blue',krugs:'Krugs',gromp:'Gromp',raptors:'Raptors',wolves:'Lobos',scuttle:'Aronguejo',dragon:'Dragão',baron:'Barão',herald:'Arauto',voidgrubs:'Vastilarvas'};
let smiteDraft=[];
function smiteDraftView(){
 const list=$('smiteSelected');if(!list)return;
 list.innerHTML='';for(const r of smiteDraft){
  const camp=match.camps.find(c=>c.id===r.targetId),b=document.createElement('button');b.type='button';
  b.className='smiteChip';b.textContent=(SMITE_NAMES[camp?.timerKey]||camp?.timerKey||r.targetId)+' · '+(r.hpThreshold??'dano')+' HP ×';
  b.title='Remover alvo';b.onclick=()=>{smiteDraft=smiteDraft.filter(x=>x.targetId!==r.targetId);smiteDraftView()};list.append(b);
 }
 $('smiteAddTarget').disabled=$('smiteMode').value!=='targets';
 $('smiteTarget').disabled=$('smiteMode').value!=='targets';$('smiteThreshold').disabled=$('smiteMode').value!=='targets';
}
function syncSmiteEditor(u){
 const panel=$('smitePanel');if(!panel)return;panel.hidden=u.role!=='JG';if(u.role!=='JG')return;
 if(!$('smiteTarget').options.length){
  const base=match.map.objects.find(o=>o.id==='blue_spawn_shop');
  for(const c of [...match.camps].sort((a,b)=>match.mapDistance(a,base)-match.mapDistance(b,base))){
   const option=document.createElement('option');option.value=c.id;
   const side=c.y>.5?'de baixo':'de cima';option.textContent=(SMITE_NAMES[c.timerKey]||c.timerKey)+' · '+side;$('smiteTarget').append(option);
  }
 }
 const policy=u.smitePolicy||{mode:'auto',rules:[]};$('smiteMode').value=policy.mode;
 smiteDraft=(policy.rules||[]).map(v=>({...v}));
 if(smiteDraft.length){$('smiteTarget').value=smiteDraft[0].targetId;$('smiteThreshold').value=smiteDraft[0].hpThreshold||match.smitePower(u)||600;}
 else $('smiteThreshold').value=match.smitePower(u)||600;
 smiteDraftView();
}
$('smiteMode').onchange=smiteDraftView;
$('smiteAddTarget').onclick=()=>{
 const targetId=$('smiteTarget').value,hp=Number($('smiteThreshold').value);
 if(!targetId||!Number.isInteger(hp)||hp<1||hp>10000)return notify('Indique um monstro e HP entre 1 e 10.000.');
 smiteDraft=smiteDraft.filter(r=>r.targetId!==targetId);smiteDraft.push({targetId,hpThreshold:hp});smiteDraftView();
};
$('smiteClear').onclick=()=>{smiteDraft=[];smiteDraftView()};
$('smiteSave').onclick=()=>{
 if(selected?.role!=='JG')return;
 const mode=$('smiteMode').value;
 // Single selected monster can be saved without pressing + Outro alvo.
 if(mode==='targets'&&!smiteDraft.length){const hp=Number($('smiteThreshold').value);if(!Number.isInteger(hp)||hp<1||hp>10000)return notify('HP inválido.');smiteDraft=[{targetId:$('smiteTarget').value,hpThreshold:hp}];}
 const response=match.setSmitePolicy('blue',selected.id,{mode,rules:mode==='targets'?smiteDraft:[]});
 if(!response.ok)return notify(response.reason);
 notify('Política de Golpear aplicada a '+selected.champ+'.');updateInspector();
};
function focusChampion(u){
 if(!u)return;
 if(selected&&drawRoute&&waypoints.length)routeDrafts[selected.id]=waypoints.map(w=>({...w}));
 selected=u;syncSmiteEditor(u);action='auto';hoverPos=null;spell=u.order?.spell||'none';comboSlots=[];pendingFightTargetId=null;$('tacticPanel').open=true;
 $('boardHint').textContent=selectedUnitIds.size>1?`${selectedUnitIds.size} aliados selecionados · Shift + clique ou Shift + arrastar adiciona aliados.`:u.champ+' selecionado · Shift + arrastar seleciona por área.';
 waypoints=(routeDrafts[u.id]||[]).map(w=>({...w}));drawRoute=waypoints.length>0;targetMode=drawRoute;
 stage.classList.toggle('modeTarget',targetMode);updateInspector();renderStatus();requestDraw();
}
function choose(u,extend=false){
 if(!u||u.team!=='blue')return;
 if(!extend)selectedUnitIds=new Set([u.id]);
 else if(selectedUnitIds.has(u.id)){
  // Shift+click on an already selected unit toggles it off; keep a valid focus.
  if(selectedUnitIds.size>1)selectedUnitIds.delete(u.id);
 }else selectedUnitIds.add(u.id);
 const focus=selectedUnitIds.has(u.id)?u:match.units.find(v=>selectedUnitIds.has(v.id)&&v.team==='blue'&&v.hp>0);
 focusChampion(focus);
}
function chooseArea(units){
 const allies=units.filter(u=>u.team==='blue'&&u.hp>0);
 if(!allies.length){notify('Nenhum campeão aliado dentro da área.');return;}
 selectedUnitIds=new Set(allies.map(u=>u.id)); // A seleção em área substitui o grupo anterior; Shift+clique adiciona/remove.
 focusChampion(allies.at(-1));
 notify(`${selectedUnitIds.size} aliados selecionados por área · comandos em grupo habilitados.`);
}
function applyOrder(o){if(!selected)return;const resp=match.setOrder('blue',selected.id,o);if(!resp.ok){notify(resp.reason==='Unidade indisponível'?(selected.hp<=0?selected.champ+' está morto, aguarde o renascimento.':match.teams.blue.ready?'As ordens foram confirmadas; aguarde o próximo planejamento.':'Essa unidade não pode agir agora.'):resp.reason);return false}selected=match.units.find(u=>u.id===selected.id);updateInspector();requestDraw();return true}
function applyGroupMove(destination){
 const group=[...selectedUnitIds].map(id=>match.units.find(u=>u.id===id)).filter(Boolean);
 if(group.length<2)return false;
 const anchor=selected||group[0],orders=[];
 for(const u of group){const spread={x:destination.x+(u.x-anchor.x)*.25,y:destination.y+(u.y-anchor.y)*.25};const point=nearestWalkable(spread,u);if(!point)return notify('Não há destino caminhável para '+u.champ);
  orders.push({kind:'move',destination:point});}
 const r=match.setGroupOrders('blue',group.map(u=>u.id),orders);
 if(!r.ok)return notify(r.reason);
 notify(group.map(u=>u.champ).join(' + ')+': movimento em formação confirmado.');updateInspector();requestDraw();return true;
}
function mode(kind){if(!selected||selected.hp<=0)return;
 if(kind==='ward'&&selectedWardType==='stealth'&&selected.trinket==='farsight')selectedWardType='farsight';
 if(kind==='ward'&&(selectedWardType==='control'?(selected.controlWardStock||0):((selected.trinket||'stealth')==='oracle'?0:selected.wardCharges))<=0){notify(selectedWardType==='control'?'Compre uma pink na loja.':'Sem sentinelas disponíveis.');return;}
 action=kind;targetMode=['move','route','flash','fight','ward','jungle','objective'].includes(kind);drawRoute=kind==='route';hoverPos=null;
 waypoints=kind==='route'?(routeDrafts[selected?.id]||[]).map(w=>({...w})):[];
 if(!targetMode){
  if(selectedUnitIds.size>1){const units=[...selectedUnitIds];const r=match.setGroupOrders('blue',units,units.map(()=>({kind,spell})));if(!r.ok)return notify(r.reason);notify(`${units.length} campeões: ${kind} sincronizado.`);}
  else if(!applyOrder({kind,spell}))return;$('boardHint').textContent=kind==='recall'?'Recall em canalização (8s sem sofrer interrupção). A loja abrirá na fonte.':'Ordem: '+kind;}
 else $('boardHint').textContent=kind==='ward'?'Clique em um ponto válido do mapa para colocar a ward; o campeão se aproxima se estiver distante.':kind==='route'?'Clique para adicionar pontos na rota; depois Finalizar.':kind==='fight'?'Clique no campeão inimigo e monte o combo Q W E R antes de lutar.':kind==='jungle'?'Clique em um acampamento — o campeão se deslocará e tentará limpar.':'Clique no destino no mapa.';
 stage.classList.toggle('modeTarget',targetMode);updateInspector();requestDraw();}

// Tactical presets: paths are generated from the actual atlas camps / lane lines.
const LANE_TACTICS={
 path:[['safe_lane','Farm/last hit','◇'],['freeze_lane','Congelar','❄'],['slow_push_lane','Puxar lento','⇢'],['push_lane','Puxar rápido','»'],['hold_lane','Segurar','⛨']],
 gank:[['top','Top','↖'],['mid','Mid','◆'],['bot','Bot','↘'],['countergank','Counter-gank','⛨'],['roam','Roaming','⇢']],
 objective:[['dragon','Dragão','♢'],['baron','Barão','♛'],['warddragon','Visão dragão','◉']]
};
const TACTICS={
 path:[['full_red','Full Red → Scuttle','♣'],['full_blue','Full Blue → Scuttle','☷'],['full_near','Full por posição','⌁'],['three','3 camps','✦'],['invade','Invade','⚑'],['counter','Counter JG','⤴']],
 gank:[['top','Top','↖'],['mid','Mid','◆'],['bot','Bot','↘'],['countergank','Counter-gank','⛨'],['roam','Roaming','⇢']],
 objective:[['dragon','Dragão','♢'],['voidgrubs','Vastilarvas','✹'],['herald','Arauto','★'],['baron','Barão','♛'],['warddragon','Visão dragão','◉']]
};
function planTactic(key){
 if(!selected||selected.hp<=0)return notify('Selecione um campeão vivo.');
 // Jungle clears are exclusive to JG; other roles get durable lane directives.
 const laneActions={safe_lane:['farm','safe','normal'],freeze_lane:['farm','safe','freeze'],slow_push_lane:['farm','balanced','slow_push'],push_lane:['push','aggressive','fast_push'],hold_lane:['stop','safe','normal']};
 if(selected.role!=='JG'&&laneActions[key]){
  const [kind,policy,wave]=laneActions[key];
  const r=match.setOrder('blue',selected.id,{kind,spell:'none'});
  if(!r.ok)return notify(r.reason);
  selected.tactics.wave=wave;match.setPolicy('blue',selected.id,policy);
  $('tacticNote').textContent=selected.champ+': '+key.replace('_lane','')+' ativo até nova ordem.';
  updateInspector();requestDraw();return notify(selected.champ+': ordem de lane persistente aplicada.');
 }
 if(selected.role!=='JG'&&['three','full','full_red','full_blue','full_near','redblue','invade','counter'].includes(key))return notify('Rotas de monstros são do jungler.');
 const u=selected,base=match.map.objects.find(o=>o.id==='blue_spawn_shop'),enemyBase=match.map.objects.find(o=>o.id==='red_spawn_shop');
 let steps=[];
 const legalCamp=match.camps.filter(c=>c.x&&c.y&&!['baron','dragon','herald','voidgrub'].some(v=>String(c.timerKey).includes(v)));
 const campPoint=c=>nearestWalkable({x:c.x,y:c.y});
 const nearest=(pool,anchor)=>pool.sort((a,b)=>dist(a,anchor)-dist(b,anchor))[0];
 if(['three','full','full_red','full_blue','full_near','redblue','invade','counter'].includes(key)){
  let pool=legalCamp.filter(c=>key==='invade'||key==='counter'?dist(c,enemyBase)<dist(c,base):dist(c,base)<=dist(c,enemyBase));
  if(key==='redblue')pool=pool.filter(c=>['red','blue'].includes(c.timerKey));
  if(!pool.length)return notify('Não há acampamentos deste padrão no atlas.');
  const n=key==='three'?3:['full','full_red','full_blue','full_near'].includes(key)?7:key==='redblue'?2:key==='counter'?3:2;
  let anchor=u;
  if(['full','full_red','full_blue','full_near'].includes(key)){
   const closestRed=pool.filter(c=>c.timerKey==='red').sort((a,b)=>dist(a,u)-dist(b,u))[0];
   const closestBlue=pool.filter(c=>c.timerKey==='blue').sort((a,b)=>dist(a,u)-dist(b,u))[0];
   const beginRed=key==='full_red'||(key==='full_near'&&(!closestBlue||(closestRed&&dist(closestRed,u)<=dist(closestBlue,u))));
   const keys=beginRed?['red','krugs','raptors','wolves','blue','gromp']:['blue','gromp','wolves','raptors','red','krugs'];
   for(const type of keys){const camp=pool.filter(c=>c.timerKey===type).sort((a,b)=>dist(a,anchor)-dist(b,anchor))[0];if(!camp)continue;const p=campPoint(camp);if(p){steps.push({point:p,action:'jungle',duration:110,targetId:camp.id});anchor=p;}pool=pool.filter(c=>c.id!==camp.id);}
   const crab=legalCamp.filter(c=>c.timerKey==='scuttle').sort((a,b)=>dist(a,anchor)-dist(b,anchor))[0];
   if(crab){const p=campPoint(crab);if(p)steps.push({point:p,action:'jungle',duration:110,targetId:crab.id});}
  }else for(let i=0;i<n&&pool.length;i++){const c=nearest(pool,anchor);pool=pool.filter(v=>v!==c);const p=campPoint(c);if(p){steps.push({point:p,action:'jungle',duration:110,targetId:c.id});anchor=p;}}
 }else if(['top','mid','bot','countergank','roam'].includes(key)){
  let lane=key==='countergank'?(match.units.filter(a=>a.team==='blue'&&a.hp>0&&a.id!==u.id).sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0]?.role||'MID'):key==='roam'?'mid':key;
  lane=lane==='TOP'?'top':lane==='ADC'||lane==='SUP'?'bot':lane==='JG'?'mid':lane.toLowerCase();
  const points=match.map.waveSystem.lanes[lane]?.blueToRed;
  if(!points?.length)return notify('Lane indisponível.');
  const curve={path:points.map(q=>({x:q.x,y:q.y}))};
  // Original lane path contains normalized coordinate pairs, not a painted guess.
  const wp=points[Math.floor(points.length*(key==='roam'?.48:.53))];
  const pos=Array.isArray(wp)?{x:wp[0],y:wp[1]}:wp;
  const point=nearestWalkable(pos);if(!point)return notify('Ponto de aproximação indisponível.');
  steps=[{point,action:key==='roam'?'roam':'gank',duration:25}];
 }else{
  let camp=match.camps.find(c=>String(c.timerKey||'').toLowerCase().includes(key==='warddragon'?'dragon':key));
  if(!camp)return notify('Objetivo não está mapeado.');
  const point=campPoint(camp);if(!point)return notify('Objetivo inacessível.');
  steps=[{point,action:key==='warddragon'?'ward':'objective',duration:key==='warddragon'?5:85}];
 }
 if(!steps.length)return notify('Nenhuma rota válida para este padrão.');
 let r=match.setPlan('blue',u.id,steps,$('policySelect')?.value==='engage'?'aggressive':u.policy);
 if(!r.ok)return notify(r.reason);
 action='auto';targetMode=false;drawRoute=false;waypoints=[];stage.classList.remove('modeTarget');
 $('tacticNote').textContent=steps.length+' etapa(s) ativas no atlas · altere com Rota se necessário.';
 updateInspector();requestDraw();notify(u.champ+': plano de '+steps.length+' etapas ativado.');
}
function renderTactics(){
 if(!$('tacticChoices'))return;
 const jungle=selected?.role==='JG';
 $('tacticTitle').textContent=jungle?'JUNGLE · PATH · GANK':'PATH · GANK';
 $('tacticSubtitle').textContent=jungle?'CLEAR · GANK':'LANE · ROAM';
 $('tacticNote').textContent=selected?.plan&&!selected.plan.completed?selected.champ+': '+selected.plan.steps.length+' etapas · passo '+(selected.plan.index+1)+'/'+selected.plan.steps.length+' · ordem persistente.':jungle?'Defina uma rota ou objetivo.':'Ações específicas da lane · persistem entre rodadas.';
 $('tacticTabs').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tacticTab));
 $('tacticChoices').innerHTML='';for(const [key,label,icon] of (jungle?TACTICS:LANE_TACTICS)[tacticTab]){
  const b=document.createElement('button');b.type='button';b.title=label;b.className='tacticChoice tactic-'+key;b.dataset.tactic=key;b.innerHTML='<img class="tacticVector" src="assets/ui/tactics/'+key+'.svg" alt="" onerror="this.remove()"><span>'+label+'</span>' ;b.onclick=()=>planTactic(key);$('tacticChoices').append(b);
 }
}
$('tacticTabs').addEventListener('click',e=>{const tab=e.target.closest('button[data-tab]');if(tab){tacticTab=tab.dataset.tab;renderTactics();}});
function updateRoster(){const target=$('roster');target.innerHTML='';for(const role of ['TOP','JG','MID','ADC','SUP']){const u=match.units.find(u=>u.team==='blue'&&u.role===role),b=document.createElement('button');b.className='rosterItem'+(selectedUnitIds.has(u.id)?' active groupSelected':'')+(u.hp<=0?' isDead':'');let img=iconForChamp(u.champ);b.innerHTML=`<img src="${officialPortrait(u.champ)}" onerror="this.onerror=null;this.src='assets/portraits/${u.champ}.webp';this.onerror=()=>{this.onerror=null;this.src='assets/portraits/${u.champ}.svg'}"/><span class="role">${role}</span><span class="name">${u.champ}</span><span class="hp">${u.hp<=0?'☠ '+Math.max(0,Math.ceil(u.deadUntil-match.gameTime))+'s':Math.round(100*u.hp/u.maxHp)+'%'}<small class="rosterPlan ${u.plan&&!u.plan.completed?'active':''}">${u.plan&&!u.plan.completed?'ROTA '+(u.plan.index+1)+'/'+u.plan.steps.length:(u.order?.kind||'auto').toUpperCase()}</small></span>`;b.onclick=e=>choose(u,e.shiftKey);target.append(b)}}
function renderRouteEditor(){
 const panel=$('routeSteps');if(!panel)return;panel.innerHTML='';
 for(let i=0;i<waypoints.length;i++){
  const w=waypoints[i],row=document.createElement('div');row.className='routeStepRow';
  const label=document.createElement('span');label.textContent=`${i+1}. (${Math.round(w.point.x*100)}%, ${Math.round(w.point.y*100)}%)`;
  const sel=document.createElement('select');for(const [id,title] of [['move','Seguir'],['farm','Farm'],['gank','Gankar'],['fight','Lutar'],['ward','Wardar'],['jungle','Limpar jungle'],['objective','Objetivo'],['defend','Defender'],['wait','Esperar'],['recall','Recall']]){const o=document.createElement('option');o.value=id;o.textContent=title;sel.append(o)}sel.value=w.action||'move';sel.onchange=()=>{w.action=sel.value;routeDrafts[selected.id]=waypoints;};
  const dur=document.createElement('input');dur.type='number';dur.min='0';dur.max='180';dur.step='15';dur.value=String(w.duration||0);dur.title='Segundos simulados nesta etapa';dur.onchange=()=>{w.duration=Math.max(0,Math.min(180,Number(dur.value)||0));routeDrafts[selected.id]=waypoints;};
  const del=document.createElement('button');del.textContent='×';del.title='Apagar etapa';del.onclick=()=>{waypoints.splice(i,1);routeDrafts[selected.id]=waypoints;renderRouteEditor();requestDraw()};
  row.append(label,sel,dur,del);panel.append(row);
 }
}
function skillCapUI(u,k){if(u.champ==='Udyr')return u.level>=16?6:Math.min(5,Math.ceil(u.level/2));if(k==='R')return ['Jayce','Nidalee','Elise','Karma'].includes(u.champ)?1:[6,11,16].filter(v=>u.level>=v).length;return Math.min(5,Math.ceil(u.level/2));}
function updateInspector(){updateRoster();$('emptyInspector').hidden=!!selected;$('selectedInspector').hidden=!selected;if(!selected)return;
 const u=match.units.find(u=>u.id===selected.id);selected=u;if(!u)return;
 whenPortraitFails($('champAvatar'),u.champ);$('champAvatar').src=officialPortrait(u.champ);$('champLevelTag').textContent=u.level;loadChampionSkills(u.champ);$('champRole').textContent=`${u.role} · TIME AZUL`;$('champName').textContent=u.champ;$('champClass').textContent=u.klass.toUpperCase()+' · XP '+Math.round(u.xp||0)+(u.role==='JG'?(u.junglePet?' · SMITE '+match.smitePower(u)+' ('+(u.smiteCharges||0)+'/2) · PET '+(u.jungleTreats||0)+'/35':' · ESCOLHA PET NA LOJA'):u.role==='SUP'?' · MISSÃO '+(u.supportQuest||0)+'/800':'');$('hpStat').textContent=Math.ceil(u.hp)+' / '+u.maxHp;$('manaStat').textContent=Math.ceil(u.mana)+' / '+u.maxMana;$('hpMeter').style.width=clamp(u.hp/u.maxHp*100,0,100)+'%';$('manaMeter').style.width=clamp(u.mana/u.maxMana*100,0,100)+'%';

 const summonerSelect=$('secondarySummoner');if(summonerSelect){summonerSelect.value=champSpells(u).find(x=>x!=='flash'&&x!=='smite')||u.summonerSpell||'barrier';summonerSelect.disabled=true;summonerSelect.title='Feitiço definido no Champ Select. Não é possível trocar durante a partida.';}
 const sumContainer=$('summonerQuick');sumContainer.replaceChildren();
 // Dev39: deterministic, compact proc badges from the authoritative engine.
 // Recreated on inspector refresh, so cooling down and charge progress track ticks.
 const existingProcs=$('itemProcsV453Dev39');if(existingProcs)existingProcs.remove();
 const procStates=match.itemProcStatusV453Dev39(u);
 if(procStates.length){
  const wrap=document.createElement('div');wrap.id='itemProcsV453Dev39';wrap.className='itemProcsV453Dev39';wrap.setAttribute('aria-label','Passivas e recargas dos itens');
  for(const state of procStates){
   const chip=document.createElement('div');chip.className='itemProcV453Dev39'+(state.ready?' isReady':'');chip.dataset.item=state.id;
   chip.setAttribute('role','meter');chip.setAttribute('aria-label',state.label);chip.setAttribute('aria-valuemin','0');chip.setAttribute('aria-valuemax',String(state.max));chip.setAttribute('aria-valuenow',String(state.value));
   const name=document.createElement('span');name.textContent=state.label;
   const value=document.createElement('b');value.textContent=state.description;
   const rail=document.createElement('i');rail.className='itemProcTrackV453Dev39';const fill=document.createElement('em');fill.style.width=(100*state.value/state.max)+'%';rail.append(fill);
   chip.append(name,value,rail);wrap.append(chip);
  }
  sumContainer.parentNode.insertBefore(wrap,sumContainer.nextSibling);
 }

 const spellNames={flash:['✦','Flash'],smite:['⚡','Golpear'],tp:['⇢','Teleporte'],exhaust:['◈','Exaustão'],heal:['✚','Curar'],ignite:['✹','Incendiar'],barrier:['⬡','Barreira'],ghost:['➤','Fantasma']};
 const sumList=champSpells(u).map(type=>[type,...(spellNames[type]||['✦',type])]);
 for(const [slotIndex,[type,ico,name]] of sumList.entries()){const remain=type==='flash'?Math.max(0,Math.ceil((u.flashCd||0)-match.gameTime)):type==='exhaust'?Math.max(0,Math.ceil((u.exhaustCd||0)-match.gameTime)):type==='smite'?(u.smiteCharges>0?0:Math.max(0,Math.ceil((u.smiteRecoveries?.[0]||match.gameTime)-match.gameTime))):Math.max(0,Math.ceil((u[{tp:'tpCd',heal:'healCd',ignite:'igniteCd',barrier:'barrierCd',ghost:'ghostCd'}[type]]||0)-match.gameTime));
  const enabled=!(type==='smite'&&!u.junglePet);
  const b=document.createElement('button');b.type='button';b.className='summonerButton';b.disabled=!enabled||remain>0;b.title=enabled?name+(remain?' · '+remain+'s':' · pronto'):name+' · aguardando mecânica individual';
  b.innerHTML=`<span class="spellArt ${remain?'cooling':''}"><img src="${dragon?.summonerIcon(type)||''}" alt="" onerror="this.onerror=null;this.src='assets/ui/summoners/${type}.svg'"><i>${ico}</i>${remain?`<em>${remain}</em>`:''}</span><span><kbd class="summonerKeyV452d4Dev11">${slotIndex===0?'D':'F'}</kbd> ${name}${!enabled?' · indisponível':''}</span>`;
  b.onclick=()=>{if(type==='flash')mode('flash');else if(['exhaust','ignite','heal','tp','barrier','ghost'].includes(type)){const enemies=match.units.filter(v=>v.team==='red'&&v.hp>0&&match.visible('blue',v));const victim=pendingFightTargetId&&enemies.find(v=>v.id===pendingFightTargetId)||enemies.sort((a,b)=>match.mapDistance(a,selected)-match.mapDistance(b,selected))[0];const result=match.queueSummoner('blue',selected.id,type,['ignite','exhaust'].includes(type)?victim?.id:null);notify(result.ok?'Feitiço '+name+' programado para esta rodada.':result.reason);updateInspector();}else if(type==='smite'){if(selected.role==='JG'){$('smitePanel').open=true;$('smitePanel').scrollIntoView({block:'nearest'});}}};sumContainer.append(b);
 }
 // V4.5: the Eye is a trinket replacement, not a permanent inventory item.
 if(u.trinket==='herald_eye'){
  const eyeButton=document.createElement('button');eyeButton.type='button';eyeButton.className='summonerButton heraldEyeActionV45';
  const remaining=Math.max(0,Math.ceil((u.heraldEyeExpiresAtV45||0)-match.gameTime));
  eyeButton.textContent='◈ Invocar Arauto · '+remaining+'s';
  eyeButton.title='Consome o Olho e invoca o Arauto para avançar sobre torres inimigas.';
  const laneSelect=document.createElement('select');laneSelect.className='heraldLaneSelectV452d4Dev20';laneSelect.setAttribute('aria-label','Rota para o Arauto');
  for(const [id,label] of [['top','TOP'],['mid','MID'],['bot','BOT']]){const opt=document.createElement('option');opt.value=id;opt.textContent=label;laneSelect.append(opt);}
  laneSelect.value=heraldDeployLaneV452d4Dev20;laneSelect.onchange=()=>{heraldDeployLaneV452d4Dev20=laneSelect.value;};
  sumContainer.append(laneSelect);
  eyeButton.textContent='Escolher posição do Arauto';
  eyeButton.title='Selecione a rota e clique no mapa. O portador caminhará até o ponto antes de invocar o Arauto.';
  eyeButton.onclick=()=>{choose(match.units.find(v=>v.id===u.id));action='herald_deploy';targetMode=true;stage.classList.add('modeTarget');notify('Clique na rota '+heraldDeployLaneV452d4Dev20+' para invocar o Arauto.');};
  sumContainer.append(eyeButton);
 }
 if(match.heraldEyeV45?.owner==='blue'&&!match.heraldEyeV45.holderId&&
    match.mapDistance(u,match.heraldEyeV45)<=OBJECTIVE_HERALD_CLAIM_RANGE_V452D4_DEV20){
  const claim=document.createElement('button');claim.type='button';claim.className='summonerButton heraldEyeClaimV452d4Dev20';claim.textContent='Coletar Olho do Arauto';
  claim.onclick=()=>{const r=match.pickupHeraldEyeV45(u.id);notify(r.ok?'Olho entregue a '+u.champ+'.':r.reason);updateInspector();requestDraw();};sumContainer.append(claim);
 }
 // A reaction escape can be used while a confrontation is paused, not
 // committed as an ordinary order (which would be locked during execution).
 if((u.champ==='Ezreal'&&u.skillRanks.E>0)||(u.champ==='Tristana'&&u.skillRanks.W>0)){
  const slot=u.champ==='Ezreal'?'E':'W',button=document.createElement('button');
  button.type='button';button.className='summonerButton escapeReaction';
  const seconds=Math.max(0,Math.ceil((u.skillCds[slot]||0)-match.gameTime));
  button.disabled=seconds>0;button.textContent=u.champ+' '+slot+' · Escape'+(seconds?' '+seconds+'s':'');
  button.title='Clique e escolha no tabuleiro onde aterrissar. Disponível em uma janela de reação.';
  button.onclick=()=>{action='escape_skill';targetedSkillSlot=slot;targetMode=true;stage.classList.add('modeTarget');notify('Clique no ponto caminhável: '+u.champ+' '+slot+'.');requestDraw();};
  sumContainer.append(button);
 }
 if(u.items?.includes('zhonyas_hourglass')||(u.items?.includes('seekers_armguard')&&!u.armguardSpentV453Dev37)){
  const hasZhonya=u.items.includes('zhonyas_hourglass');
  const active=document.createElement('button');active.className='summonerButton stasisReaction';active.type='button';
  const seconds=hasZhonya?Math.max(0,Math.ceil((u.stasisCd||0)-match.gameTime)):0;active.disabled=seconds>0;
  active.textContent='⌛ '+(hasZhonya?'Ampulheta':'Armaguarda · 1 uso')+(seconds?' · '+seconds+'s':'');
  active.title='Estase por 2,5s. Armaguarda: um único uso, o equipamento e seus atributos permanecem.';
  active.onclick=()=>{const out=match.activateStasis('blue',u.id);notify(out.ok?'Estase ativada!':out.reason);updateInspector();requestDraw();};
  sumContainer.append(active);
 }
 for(const potionId of ['health_potion','refillable_potion'])if(u.items?.includes(potionId)){
  const b=document.createElement('button');b.className='summonerButton potionActiveV453Dev32';b.type='button';
  const charges=potionId==='refillable_potion'?(u.refillableChargesV453Dev32??2):u.items.filter(id=>id===potionId).length;
  b.textContent=(potionId==='refillable_potion'?'Poção Refil':'Poção de Vida')+' · '+charges;
  b.disabled=charges<=0||u.hp<=0||u.hp>=u.maxHp;
  b.onclick=()=>{const r=match.usePotionV453Dev32('blue',u.id,potionId);notify(r.ok?'Poção usada.':r.reason);updateInspector();requestDraw();};sumContainer.append(b);
 }
 if(u.items?.includes('randuins_omen')){
  const active=document.createElement('button');active.className='summonerButton randuinsActiveV453Dev31';active.type='button';
  const remaining=Math.max(0,Math.ceil((u.randuinsCdV453Dev31||0)-match.gameTime));active.disabled=remaining>0;
  active.textContent='⬡ Randuin'+(remaining?' · '+remaining+'s':'');
  active.title='Lentidão 70% por 2s em inimigos a até 500 unidades (90s de recarga).';
  active.onclick=()=>{const r=match.activateRanduinsV453Dev31('blue',u.id);notify(r.ok?'Randuin: '+r.targetIds.length+' inimigos lentos':r.reason);updateInspector();requestDraw();};sumContainer.append(active);
 }
 if(u.items?.includes('youmuus_ghostblade')){
  const active=document.createElement('button');active.className='summonerButton youmuusActiveV453Dev29';active.type='button';
  const remaining=Math.max(0,Math.ceil((u.youmuusCdV453Dev29||0)-match.gameTime));active.disabled=remaining>0;
  active.textContent='➤ Youmuu'+(remaining?' · '+remaining+'s':'');
  active.title='Ativa velocidade de movimento (45s de recarga). Efeito de atravessar unidades ainda não simulado.';
  active.onclick=()=>{const r=match.activateYoumuusV453Dev29('blue',u.id);notify(r.ok?'Youmuu ativada':r.reason);updateInspector();requestDraw();};sumContainer.append(active);
 }
 const effectiveStatsV452d4Dev14=match.elementalStatsV452d3(u);
 const statEntries=[['VAST.','◈',match.teams[u.team].voidgrubs||0,'voidgrubs'],['AD','⚔',Math.round(effectiveStatsV452d4Dev14.ad),'ad'],['AP','✧',Math.round(effectiveStatsV452d4Dev14.ap),'ap'],['ARMOR','⬡',Math.round(effectiveStatsV452d4Dev14.armor),'armor'],['MR','✦',Math.round(effectiveStatsV452d4Dev14.mr),'mr'],['OURO','◈',Math.floor(u.gold),'gold'],['FARM','◇',u.cs,'farm'],['WARDS','◉',u.wardCharges,'wards'],['K / D / A','⚑',`${u.kills||0} / ${u.deaths||0} / ${u.assists||0}`,'kda']];
 $('statGrid').innerHTML=statEntries.map(([name,icon,value,type])=>`<div class="miniStat stat-${type}"><span class="statIcon">${icon}</span><small>${name}</small><b>${value}</b></div>`).join('');
 const activeStatusV41=(u.statusEffectsV41||[]).filter(e=>e.until>match.gameTime);
 const objectiveBuffsV452d4Dev14=[];
 const baronBonusV452d4Dev14=match.baronChampionBonusV452d4Dev14(u);
 if(baronBonusV452d4Dev14)objectiveBuffsV452d4Dev14.push({label:'Barão',details:`+${Math.round(baronBonusV452d4Dev14.ad)} AD / +${Math.round(baronBonusV452d4Dev14.ap)} AP`,until:u.baronBuffUntilV452});
 if(match.hasElderV452(u))objectiveBuffsV452d4Dev14.push({label:'Ancião',details:'Queimadura e execução',until:u.elderBuffUntilV452});
 const stripV41=$('effectStripV41');if(stripV41){
  stripV41.hidden=!activeStatusV41.length&&!objectiveBuffsV452d4Dev14.length;
  stripV41.innerHTML=activeStatusV41.map(e=>`<span class="effectBadgeV41" title="${escapeHTML(e.type)} · ${Math.ceil(e.until-match.gameTime)}s">${escapeHTML(e.type.replaceAll('_',' '))} <b>${Math.ceil(e.until-match.gameTime)}s</b></span>`).join('')+
   objectiveBuffsV452d4Dev14.map(e=>`<span class="effectBadgeV41" title="${escapeHTML(e.details)}">${e.label} <b>${Math.ceil(e.until-match.gameTime)}s</b></span>`).join('');
 }

 if($('allStatsOverlay')&&!$('allStatsOverlay').hidden)renderAllStats(u);
 if($('policySelect')){
  const sel=$('policySelect');if(!sel.dataset.ready){sel.innerHTML='';
   for(const group of [...new Set(REACTIONS.map(r=>r.group))]){
    const optgroup=document.createElement('optgroup');optgroup.label=group;
    for(const reaction of REACTIONS.filter(r=>r.group===group)){
     const opt=document.createElement('option');opt.value=reaction.id;opt.textContent=reaction.icon+' '+reaction.name;optgroup.append(opt);
    }sel.append(optgroup);
   }sel.dataset.ready='1';
  }
  sel.value=u.reaction||'balanced';
  const r=REACTIONS.find(r=>r.id===(u.reaction||'balanced'));
  $('policyDetail').textContent=(r?.icon||'')+' '+(r?.hint||'Resposta tática');
  const favorites=$('policyFavorites');favorites.innerHTML='';
  for(const key of ['heal','shield','peel_adc','countergank','kite']){
   const profile=REACTIONS.find(x=>x.id===key),b=document.createElement('button');b.type='button';
   b.title=profile.hint;b.textContent=profile.icon+' '+profile.name;
   b.className='tacticChip'+(u.reaction===key?' active':'');
   b.onclick=()=>{match.setReaction('blue',u.id,key);updateInspector();};favorites.append(b);
  }
 }
 let row=$('actions');row.innerHTML='';ACTIONS.forEach(([id,name,ico,key])=>{let b=document.createElement('button');b.className='action-'+id+(action===id?' active':'');b.innerHTML=`<b><img class="actionVector" src="assets/ui/actions/${id}.svg" alt=""></b><span>${name}</span>${key?`<kbd>${key}</kbd>`:''}`;b.title=name+(key?' ['+key+']':'');b.disabled=id==='ward'&&(u.trinket==='oracle'||u.wardCharges<=0)&&(u.controlWardStock||0)<=0;b.onclick=()=>mode(id);row.append(b)});
 // A single compact vision tray, no nested menus. Wards and pinks are
 // different inventory resources; sweeper reveals but never auto-destroys.
 let visionTray=$('visionActions');if(!visionTray){visionTray=document.createElement('div');visionTray.id='visionActions';visionTray.className='visionActions';row.after(visionTray);}
 visionTray.innerHTML='';
 for(const [type,label,icon,tone] of [[ 'stealth',u.trinket==='effigy'?'Espantalho':'Ward',u.trinket==='effigy'?'♙':'◈','gold'],['control','Pink','◆','rose'],...(u.champ==='Fiddlesticks'&&u.role==='SUP'&&u.supportQuest>=400?[['support','Suporte','◈','gold']]:[]),['farsight','Azul','◉','cyan'],['oracle','Lente','◎','cyan']]){
  const b=document.createElement('button');b.type='button';b.className='visionChoice '+tone+(type===selectedWardType&&action==='ward'?' active':'');
  const rest=type==='control'?(u.controlWardStock||0):type==='support'?(u.supportVisionChargesV453Dev69C||0):type==='oracle'?Math.max(0,(u.oracleCd||0)-match.gameTime):u.wardCharges;
  b.innerHTML=`<strong>${icon}</strong><span>${label}</span><small>${type==='oracle'?(rest>0?Math.ceil(rest)+'s':'PRONTA'):rest}</small>`;
  b.title=type==='stealth'&&u.trinket==='effigy'?'Fiddlesticks: efígie exclusiva do slot 4 · duas cargas · imita campeão ao ser encontrada':type==='control'?'Sentinela de controle · permanece até destruir ou substituir':type==='oracle'?'Trinket Lente Reveladora · um turno de varredura':type==='farsight'?'Sentinela Azul · pode ativar pontos de visão':'Trinket Ward Amarela';
  b.disabled=type==='stealth'&&['oracle','farsight'].includes(u.trinket)||type==='farsight'&&u.trinket!=='farsight'||type==='oracle'&&(u.trinket||'stealth')!=='oracle';
  b.onclick=()=>{if(type==='oracle'){const r=match.activateOracle('blue',u.id);notify(r.ok?'Lente reveladora ativada nesta resolução tática.':r.reason);updateInspector();requestDraw();}
  else{selectedWardType=type;mode('ward');}};
  visionTray.append(b);
 }
 // Quest-only item choices are an in-game action, never a shop purchase.
 // Keep the tray compact and scoped to the currently selected owned champion.
 let conditionalTray=$('conditionalItemsTrayV453Dev69C');
 if(!conditionalTray){conditionalTray=document.createElement('div');conditionalTray.id='conditionalItemsTrayV453Dev69C';conditionalTray.className='visionActions';visionTray.after(conditionalTray);}
 conditionalTray.replaceChildren();
 if(u.role==='SUP'&&u.supportQuest>=800&&u.items?.includes('support_bounty')){
  for(const [id,label] of [['support_celestial_opposition','Oposição'],['support_dream_maker','Sonhos'],['support_zaz_zak','Zaz’Zak'],['support_solstice_sleigh','Trenó'],['support_bloodsong','Canção']]){
   const btn=document.createElement('button');btn.type='button';btn.className='visionChoice gold';
   btn.textContent=label;btn.title='Missão SUP concluída: escolher '+label+' grátis, somente uma vez';
   btn.onclick=()=>{const out=match.chooseSupportFinalV453Dev69C('blue',u.id,id);notify(out.ok?label+' equipado sem gastar ouro.':out.reason);updateInspector();requestDraw();};
   conditionalTray.append(btn);
  }
 }
 if(u.champ==='Kalista'&&match.gameTime<180&&u.hp>0){
  if(u.blackSpearAvailableV453Dev69C&&!u.pendingOathswornV453Dev69C){
   for(const ally of match.units.filter(v=>v.team===u.team&&v.id!==u.id&&v.hp>0)){
    const btn=document.createElement('button');btn.type='button';btn.className='visionChoice gold';
    btn.textContent='Pacto: '+ally.champ;btn.title='Lança Negra: vincular aliado, canal 6,5 segundos';
    btn.onclick=()=>{const out=match.bindBlackSpearV453Dev69C('blue',u.id,ally.id);notify(out.ok?'Pacto solicitado para '+ally.champ:out.reason);updateInspector();requestDraw();};
    conditionalTray.append(btn);
   }
  }else if(!u.blackSpearAvailableV453Dev69C&&!u.pendingOathswornV453Dev69C){
   const btn=document.createElement('button');btn.type='button';btn.className='visionChoice gold';
   btn.textContent='Recuperar Lança';btn.title='Recomprar a Lança Negra grátis na fonte antes de 03:00';
   btn.onclick=()=>{const out=match.recoverBlackSpearV453Dev69C('blue',u.id);notify(out.ok?'Lança recuperada.':out.reason);updateInspector();};
   conditionalTray.append(btn);
  }
 }
 conditionalTray.hidden=!conditionalTray.childElementCount;
 renderTactics();$('routeTools').hidden=!drawRoute;renderRouteEditor();
 if($('quickToggles')){
  $('quickToggles').innerHTML='';
  for(const [key,label] of [['autoAttack','Atacar'],['autoFarm','Farm'],['autoFollow','Lane'],['autoRespond','Auto-reagir']]){
   const btn=document.createElement('button');btn.className=u[key]?'active':'';
   btn.textContent=(u[key]?'✓ ':'○ ')+label;btn.onclick=()=>{match.setAutomation('blue',u.id,{[key]:!u[key]});updateInspector()};
   $('quickToggles').append(btn);
  }
 }

 if($('smitePanel')&&u.role==='JG'){const policy=u.smitePolicy||{mode:'auto',rules:[]};$('smitePanelStatus').textContent=policy.mode==='targets'?'ALVOS '+(policy.rules?.length||0):policy.mode==='hold'?'RESERVADO':'AUTO';$('smiteState').textContent=u.junglePet?`${u.smiteCharges}/2 cargas · Golpear ${match.smitePower(u)} · ${(u.smiteCd||0)>match.gameTime?'recarga de uso '+Math.ceil(u.smiteCd-match.gameTime)+'s':'pronto'}`:'Escolha um companheiro de jungle na loja para habilitar Golpear.';}
 const blueSpawn=match.map.objects.find(o=>o.id==='blue_spawn_shop');
 const isInBase=!!blueSpawn&&u.hp>0&&match.mapDistance(u,blueSpawn)<=1125;
 $('baseHUD').hidden=!isInBase;
 $('baseFollowLane').hidden=!u.awaitingShop;
 $('actionHelp').textContent=u.awaitingShop?'✓ Na fonte · escolha comprar ou sair para lane.':u.order?.kind==='recall'?'↶ Canalizando recall. Ao concluir, a loja abre automaticamente.':action==='ward'&&targetMode?'◉ Selecione no tabuleiro o ponto exato para a sentinela.':'B = recall  ·  4 = ward  ·  M = mover  ·  R = rota  ·  F = flash';
 $('orderSummary').textContent=`${u.awaitingShop?'AGUARDANDO NA FONTE · LOJA DISPONÍVEL':u.order?.kind==='recall'?'CANALIZANDO RECALL · '+(u.recallProgress||0)+'/8s':u.order?.kind==='ward'?'WARD A CAMINHO · '+u.wardCharges+' restantes':u.plan&&!u.plan.completed?'ROTA ATIVA: '+(u.plan.index+1)+'/'+u.plan.steps.length+' etapas':'ORDEM: '+(u.order?.kind||'auto').toUpperCase()} · ordem persistente`;
 $('comboPanel').hidden=!pendingFightTargetId;
 $('comboTarget').textContent=pendingFightTargetId?(match.units.find(v=>v.id===pendingFightTargetId)?.champ||'Alvo'):'—';
 $('comboSequence').textContent=comboSlots.length?'COMBO: '+comboSlots.join(' › ')+' · AA independente · sem reiniciar':'Selecione habilidades aprendidas (Q/W/E/R). AA continua independente.';
 if(u.order?.kind==='attack'&&u.order.combo?.length){$('comboSequence').textContent=`${u.order.comboStatus||'Em execução'} · ${u.order.comboIndex||0}/${u.order.combo.length} · `+u.order.combo.join(' › ');}
 $('combatModes').querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.style===combatStyle));
 $('comboKeys').innerHTML='';for(const k of ['Q','W','E','R']){
  const b=document.createElement('button');b.type='button';b.disabled=!(u.skillRanks?.[k]>0);b.title=u.skillRanks?.[k]?'Adicionar '+k+' ao combo':'Primeiro distribua um ponto em '+k;const d=skillCatalog.get(u.champ)?.spells?.[['Q','W','E','R'].indexOf(k)];b.innerHTML=`${d?.image?.full?`<img src="${dragon.spellIcon(d.image.full)}" alt=""/>`:''}<span>${k}</span>`;
  b.onclick=()=>{if(comboSlots.length>=8)return notify('Combo com máximo de oito habilidades.');comboSlots.push(k);combatStyle='combo';updateInspector();};
  $('comboKeys').append(b);
 }
 // Keep legacy IDs present for savegame/test compatibility; no second skill box.
 $('quickSkillUp').hidden=true;
 $('skillPointsLabel').textContent=`${u.skillPoints||0} ponto(s) disponível(is)`;
 $('skillUpgradeButtons').replaceChildren();
 $('autoSkillToggle').checked=!!u.autoLevelSkills;
 const skillText=$('skillPriorityInput');
 if(skillText&&document.activeElement!==skillText)skillText.value=(u.skillBuild?.priority||u.skillPriority||['Q','E','W']).join('');
 $('skillPlanSummary').textContent=u.skillBuild?(u.skillBuild.phases||[]).map(p=>p.slot+String(p.target)).join(' › ')+(u.champ==='Udyr'?' · 4 posturas':' · R 6/11/16'):(u.skillPriority||['Q','E','W']).join(' › ')+(u.champ==='Udyr'?' · 4 posturas':' · R 6/11/16');
 $('spells').innerHTML='';
 for(const id of ['Q','W','E','R']){
  const cd=u.skillCds?.[id]||0,learned=!!u.skillRanks?.[id],ready=learned&&cd<=match.gameTime,manaCost={Q:45,W:50,E:55,R:100}[id];
  const btn=document.createElement('button');btn.type='button';btn.className='spellKey'+(comboSlots.includes(id)?' selected':'');
  const detail=skillCatalog.get(u.champ)?.spells?.[['Q','W','E','R'].indexOf(id)];
  btn.classList.toggle('spellLocked',!learned);btn.classList.toggle('spellCooling',learned&&!ready);
  btn.innerHTML=`<span class="abilityIcon"><img class="localAbilityIcon" src="assets/ui/skills/${id}.svg" alt=""/>${detail?.image?.full?`<img class="officialAbilityIcon" loading="lazy" src="${dragon.spellIcon(detail.image.full)}" alt="" onerror="this.onerror=null;this.remove()"/>`:''}<b>${id}</b>${learned&&!ready?`<i>${Math.ceil(cd-match.gameTime)}s</i>`:''}</span><em>${learned?(detail?.name||'Nível '+u.skillRanks[id]):'Não aprendida'} · ${u.skillRanks[id]||0}/${id==='R'?3:5}</em>`;btn.disabled=!learned;
  const kitSpec=window.CoachArena.kitSpellV42?.(u.champ,id);
  btn.title=`${detail?.name||'Habilidade '+id} · ${kitSpec?.mana?.[Math.min((u.skillRanks?.[id]||1)-1,(kitSpec.mana?.length||1)-1)]||manaCost} mana · ${kitSpec?.implemented==='prototype'?'protótipo individual V4.2':'dados ainda em treino'}.`;
  btn.onclick=()=>{if(!pendingFightTargetId){
   if(id==='R'&&['Karthus','Soraka'].includes(u.champ)){
    const out=match.queueSpecialUltimate('blue',u.id);
    notify(out.ok?u.champ+': ultimate global programada.':out.reason);updateInspector();return;
   }
   if(id==='R'&&u.champ==='Vex'&&u.vexMark?.until>=match.gameTime){
    const r=match.queueVexRecast('blue',u.id);notify(r.ok?'Vex R2: aproximação marcada para a próxima resolução.':r.reason);return;
   }
   if(id==='R'&&['Jinx','Ashe','Ezreal','Lux','Nami','Vex'].includes(u.champ)){
    action='ult_direction';targetMode=true;stage.classList.add('modeTarget');
    notify('R direcional: indique o vetor no mapa. O indicador mostra alcance e área da habilidade.');requestDraw();return;
   }
   if(id==='E'&&u.champ==='Irelia'){
    action='irelia_e_target';targetedSkillSlot='E';targetMode=true;stage.classList.add('modeTarget');
    notify(u.champ+' E: posicione a lâmina no mapa (segunda lâmina durante a execução).');requestDraw();return;
   }
   const kit=window.CoachArena.kitSpellV42?.(u.champ,id);
   if(kit&&['ground_circle','ground_zone','line_projectile'].includes(kit.kind)){
    if(u.champ==='Lux'&&id==='E'&&u.luxZoneV42?.expiresAt>match.gameTime){
     const result=match.queueKitSkillV42('blue',u.id,id,u.luxZoneV42.point);
     notify(result.ok?'Lux E: detonação solicitada.':result.reason);return;
    }
    action='kit_location';targetedSkillSlot=id;targetMode=true;stage.classList.add('modeTarget');
    notify(u.champ+' '+id+': clique no mapa para escolher área/direção. Conjuração caminha até o alcance.');requestDraw();return;
   }
   targetedSkillSlot=id;targetMode=true;action='target_skill';stage.classList.add('modeTarget');notify(id+' selecionada: clique no aliado ou inimigo alvo. Esc cancela.');return;}
   if(comboSlots.length>=8){notify('Máximo de oito passos no combo.');return;}
   comboSlots.push(id);combatStyle='combo';updateInspector();};
  const holder=document.createElement('div');holder.className='spellSlot';
  const canLearn=(u.skillPoints||0)>0&&(u.skillRanks?.[id]||0)<skillCapUI(u,id)&&!match.teams.blue.ready;
  if(u.skillPoints>0){
   const up=document.createElement('button');up.type='button';up.className='skillFloatUpgrade'+(canLearn?' ready':' locked');
   up.disabled=!canLearn;up.dataset.upgrade=id;up.innerHTML='<span aria-hidden="true">⌃</span>';up.title=canLearn?`Evoluir ${id}: ${u.skillPoints} ponto(s) disponível(is)`:`${id} indisponível neste nível`;
   up.setAttribute('aria-label',`Evoluir habilidade ${id}`);
   up.onclick=e=>{e.stopPropagation();const result=match.upgradeSkill('blue',u.id,id);if(!result.ok)notify(result.reason);updateInspector();renderStatus();requestDraw();};
   holder.append(up);
  }
  holder.append(btn);$('spells').append(holder);
 }

}

// Compact, always-up-to-date scoreboard; TAB toggles the same view as the header button.
let scoreboardOpen=false,scoreboardLastFocus=null,scoreboardSignature=null;
const scoreboardItemMap=new Map(catalog.map(item=>[item.id,item]));
function scoreboardItems(unit){const items=Array.isArray(unit.items)?unit.items:[];
 return Array.from({length:6},(_,i)=>{const item=scoreboardItemMap.get(items[i]);return item?
  `<span class="sbItem" title="${escapeHTML(item.name)} · ${item.cost} ouro" aria-label="${escapeHTML(item.name)}"><img src="${shopAsset(item)||'assets/ui/items/'+item.id+'.svg'}" loading="lazy" alt="" onerror="this.onerror=null;this.src='assets/ui/items/${item.id}.svg'"/><i>${escapeHTML(item.icon)}</i></span>`:
  `<span class="sbItem empty" aria-label="Espaço vazio">+</span>`;}).join('');}
function scoreboardUnit(unit){const dead=unit.hp<=0,respawn=dead?Math.max(0,Math.ceil((unit.deadUntil||0)-match.gameTime)):0;
 const life=dead?`☠ ${respawn}s`:`${Math.round(100*unit.hp/(unit.maxHp||1))}% HP`;
 const champion=escapeHTML(unit.champ),role=escapeHTML(unit.role);
 const portrait=officialPortrait(unit.champ);
 const fallback=`assets/portraits/${encodeURIComponent(unit.champ)}.webp`,finalFallback=`assets/portraits/${encodeURIComponent(unit.champ)}.svg`;
 return `<div class="sbPlayer ${dead?'dead':''} ${unit.id===selected?.id?'self':''}" data-id="${escapeHTML(unit.id)}">
 <span class="sbIdentity"><img class="sbPortrait" src="${portrait}" onerror="this.onerror=()=>{this.onerror=null;this.src='${finalFallback}'};this.src='${fallback}'" alt="Retrato de ${champion}"><span class="sbIdentityText"><b>${champion}</b><small class="${dead?'sbDead':''}">${role} · ${life}</small></span><span class="sbSummoners">${champSpells(unit).map(type=>`<img src="${dragon?.summonerIcon(type)||''}" title="${type}" alt="${type}" loading="lazy" onerror="this.onerror=null;this.src='assets/ui/summoners/${type}.svg'"/>`).join('')}</span></span>
 <span class="sbNumber">${unit.level||1}</span><span class="sbKda" aria-label="${unit.kills||0} abates, ${unit.deaths||0} mortes, ${unit.assists||0} assistências"><span>${unit.kills||0}</span><span class="sep">/</span><span class="death">${unit.deaths||0}</span><span class="sep">/</span><span class="assist">${unit.assists||0}</span></span>
 <span class="sbNumber">${unit.cs||0}</span><span class="sbNumber">${unit.team==='blue'?(unit.gold||0):'—'}</span><span class="sbNumber">${unit.team==='blue'?(unit.wardCharges||0):'—'}</span>
 <span class="sbItems">${scoreboardItems(unit)}</span></div>`;
}
function renderScoreboard(){if(!scoreboardOpen)return;
 // No DOM/image rebuild during the four UI polls per second unless match data changed.
 const signature=JSON.stringify([match.gameTime,selected?.id,match.units.map(u=>[u.id,u.hp,u.deadUntil,u.level,u.kills,u.deaths,u.assists,u.cs,u.gold,u.wardCharges,u.items])]);
 if(scoreboardSignature===signature)return;
 scoreboardSignature=signature;
 const time=match.gameTime||0;$('scoreboardTime').textContent=String(Math.floor(time/60)).padStart(2,'0')+':'+String(time%60).padStart(2,'0');
 $('scoreboardContents').innerHTML=['blue','red'].map(team=>{
  const all=match.units.filter(u=>u.team===team).sort((a,b)=>['TOP','JG','MID','ADC','SUP'].indexOf(a.role)-['TOP','JG','MID','ADC','SUP'].indexOf(b.role));
  const kills=all.reduce((acc,u)=>acc+(u.kills||0),0),deaths=all.reduce((acc,u)=>acc+(u.deaths||0),0);
  const label=team==='blue'?'AZUL':'VERMELHO';
  return `<div class="sbTeam ${team}"><div class="sbTeamHead"><span class="sbTeamBadge">${team==='blue'?'◆':'✦'}</span>${label}<strong>${kills} <small>abates</small> / ${deaths} <small>mortes</small></strong></div>
   <div class="sbLegend"><span>Campeão</span><span>LVL</span><span>K / D / A</span><span>CS</span><span>Ouro</span><span>Ward</span><span>Build / itens</span></div>${all.map(scoreboardUnit).join('')}</div>`;
 }).join('');
}
function setScoreboardOpen(open){if(scoreboardOpen===open)return;
 scoreboardOpen=!!open;scoreboardSignature=null;$('scoreboardOverlay').hidden=!scoreboardOpen;
 $('scoreboardOpen').setAttribute('aria-expanded',String(scoreboardOpen));
 if(scoreboardOpen){scoreboardLastFocus=document.activeElement;renderScoreboard();$('scoreboardClose').focus({preventScroll:true});}
 else {if(scoreboardLastFocus&&typeof scoreboardLastFocus.focus==='function')scoreboardLastFocus.focus({preventScroll:true});scoreboardLastFocus=null;}
}
$('scoreboardOpen').onclick=()=>setScoreboardOpen(!scoreboardOpen);
$('scoreboardClose').onclick=()=>setScoreboardOpen(false);
$('scoreboardBackdrop').onclick=()=>setScoreboardOpen(false);
function resetEndgameState(){endgameIntroOpen=false;resultOverlayOpen=false;endgamePresentedKey=null;$('endgameOverlay').hidden=true;$('resultOverlay').hidden=true;}
function teamResultData(team){
 const order=['TOP','JG','MID','ADC','SUP'];
 const units=match.units.filter(u=>u.team===team).sort((a,b)=>order.indexOf(a.role)-order.indexOf(b.role));
 return {
  team,label:team==='blue'?'Azul':'Vermelho',units,
  kills:match.teams?.[team]?.kills??units.reduce((n,u)=>n+(u.kills||0),0),
  deaths:units.reduce((n,u)=>n+(u.deaths||0),0),
  assists:units.reduce((n,u)=>n+(u.assists||0),0),
  gold:units.reduce((n,u)=>n+(u.gold||0),0),
  cs:units.reduce((n,u)=>n+(u.cs||0),0),
  wards:units.reduce((n,u)=>n+(u.wardCharges||0),0),
  towersAlive:match.structures.filter(s=>s.team===team&&s.type==='tower'&&s.alive).length,
  inhibitorsAlive:match.structures.filter(s=>s.team===team&&s.type==='inhibitor'&&s.alive).length,
  nexusHp:Math.max(0,Math.round(100*((match.structures.find(s=>s.id===team+'_nexus')?.hp||0)/Math.max(1,match.structures.find(s=>s.id===team+'_nexus')?.maxHp||1))))
 };
}
function resultMetricRow(label,blue,red,suffix=''){
 const max=Math.max(1,blue,red),bp=Math.max(6,Math.round(blue/max*100)),rp=Math.max(6,Math.round(red/max*100));
 return `<div class="resultChartRow"><strong>${label}</strong><div class="resultBar blue"><i style="width:${bp}%"></i></div><span>${blue}${suffix}</span><div class="resultBar red"><i style="width:${rp}%"></i></div><span>${red}${suffix}</span></div>`;
}
function resultTable(team){
 return `<div class="resultTableWrap"><h3>${team.label} · jogadores</h3><table class="resultTable"><thead><tr><th>Campeão</th><th>Função</th><th>K / D / A</th><th>CS</th><th>Ouro</th><th>Ward</th></tr></thead><tbody>${team.units.map(u=>`<tr><td>${escapeHTML(u.champ)}</td><td>${escapeHTML(u.role)}</td><td class="resultKdaCell">${u.kills||0} / ${u.deaths||0} / ${u.assists||0}</td><td>${u.cs||0}</td><td>${u.gold||0}</td><td>${u.wardCharges||0}</td></tr>`).join('')}</tbody></table></div>`;
}
let postgameMount=null;
function renderResultSummary(){
 const data=window.CoachPostgame.model(match),victory=match.winner==='blue';
 const blue=data.teams.find(t=>t.team==='blue'),red=data.teams.find(t=>t.team==='red');
 $('resultEyebrow').textContent=victory?'VITÓRIA · PÓS-JOGO':'DERROTA · PÓS-JOGO';
 $('resultTitle').textContent=victory?'Vitória do time azul':'Derrota do time azul';
 $('resultSubtitle').textContent='Placar, estatísticas detalhadas, gráficos filtráveis, visão geral e runas.';
 $('resultHero').className='resultHero '+(victory?'victory':'defeat');
 $('resultHero').innerHTML=`<div><span class="resultBadge ${victory?'victory':'defeat'}">${victory?'Victory':'Defeat'}</span><div class="resultScoreline"><span>${blue.kills}</span><small>AZUL</small><span>×</span><span>${red.kills}</span><small>VERMELHO</small></div><p>Vencedor: <b>${victory?'Azul':'Vermelho'}</b> · Duração <b>${window.CoachPostgame.fmtTime(match.gameTime)}</b></p></div><div class="pgHeadlineNote">5v5 · ${data.players.length} campeões · Offline</div>`;
 $('resultTeamCards').replaceChildren();$('resultCharts').replaceChildren();
 if(postgameMount)postgameMount.destroy();
 postgameMount=window.CoachPostgame.mount(match,$('resultTables'));
}
function setEndgameIntroOpen(open){
 endgameIntroOpen=!!open;$('endgameOverlay').hidden=!endgameIntroOpen;
 if(endgameIntroOpen){$('endgameIntroImage').src=(match.winner==='blue'?endgameImages.victory:endgameImages.defeat).src;setScoreboardOpen(false);$('endgameIntroContinue').focus({preventScroll:true});}
}
function setResultOverlayOpen(open){
 resultOverlayOpen=!!open;$('resultOverlay').hidden=!resultOverlayOpen;
 if(resultOverlayOpen){renderResultSummary();$('resultContinue').focus({preventScroll:true});}
}
function syncEndgameFlow(){
 if(!match.ended)return;
 const key=(match.winner||'none')+':'+match.gameTime;
 if(endgamePresentedKey===key||endgameIntroOpen||resultOverlayOpen)return;
 endgamePresentedKey=key;setEndgameIntroOpen(true);
}
$('endgameIntroContinue').onclick=()=>{setEndgameIntroOpen(false);setResultOverlayOpen(true);};
$('resultContinue').onclick=()=>{setResultOverlayOpen(false);notify('Resumo pós-jogo concluído.');};
$('resultClose').onclick=()=>setResultOverlayOpen(false);
$('resultOverlay').addEventListener('click',e=>{if(e.target===$('resultOverlay')||e.target.classList.contains('resultBackdrop'))setResultOverlayOpen(false);});
function renderEnemyRoster(){
 const box=$('enemyRoster');if(!box)return;box.innerHTML='';
 for(const role of ['TOP','JG','MID','ADC','SUP']){
  const u=match.units.find(u=>u.team==='red'&&u.role===role);if(!u)continue;
  const vis=u.hp>0&&match.visible('blue',u);
  const b=document.createElement('div');b.className='enemySlot'+(vis?' visible':'');
  b.textContent=`${role} · ${u.champ} ${u.hp<=0?'☠':vis?'●':'◌'}`;
  b.title=vis?'Posição revelada pela visão azul':'Campeão conhecido no draft; posição oculta pela fog';box.append(b);
 }
}
function hideTarget(){if(match.pendingDecision)return;if($('targetPanel')){$('targetPanel').hidden=true;resetComboFooterV453Dev45();}}
function resetComboFooterV453Dev45(){
 const panel=$('targetPanel'),footer=$('comboActionsV453Dev45'),close=$('targetClose');
 if(footer){footer.hidden=true;if(close&&footer.contains(close))panel.append(close);}
 panel?.classList.remove('composerOpenV453Dev45','reactionOpenV453Dev45');
 if(close){close.textContent='Fechar ×';close.onclick=()=>{if(match.pendingDecision)return notify('Escolha uma das respostas para continuar.');hideTarget();};}
}
function openTarget(title,description,buttons=[]){const panel=$('targetPanel');if(!panel)return;
 resetComboFooterV453Dev45();
 $('targetTitle').textContent=title;$('targetDescription').textContent=description;$('duelOverlay').hidden=true;$('comboModalSteps').hidden=true;
 const wrap=$('targetButtons');wrap.innerHTML='';
 for(const [label,callback] of buttons){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{
  if(callback()===false)return;
  if(match.pendingDecision)match.answerDecision();$('targetPanel').hidden=true;
  if(match.phase==='decision')resumeRound();
 };wrap.append(b)}panel.hidden=false;
}
function nearestWalkable(point,origin=selected){
 if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return null;
 const target={x:clamp(point.x,.02,.977),y:clamp(point.y,.02,.977)};
 const reachable=p=>match.walkable(p.x,p.y)&&(!origin||!!match.findPath(origin,p));
 if(reachable(target))return target;
 // Probe mask cells radially, then sort by true proximity to the user's click.
 // Avoid choosing the nearest CELL on the wrong side of an impassable wall.
 const size=match.mask?.size||128,cell=1/size,candidates=[];
 const cx=Math.floor(target.x*size),cy=Math.floor(target.y*size);
 for(let r=1;r<=Math.ceil(size*.27);r++){
  for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){
   if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
   const p={x:(cx+dx+.5)*cell,y:(cy+dy+.5)*cell};
   if(match.walkable(p.x,p.y))candidates.push({p,d:dist(p,target)});
  }
  if(candidates.length){candidates.sort((a,b)=>a.d-b.d);
   for(const v of candidates)if(reachable(v.p))return v.p;
   candidates.length=0;
  }
 }
 return null;
}
// V38 composer: one modal, independent per-champion steps, opponent sees no draft.
function showComboComposer(targetId,{reaction=false,unitId=null}={}){
 const perspective=match.perspective('blue');
 const enemy=perspective.units.find(v=>v.id===targetId&&v.team==='red'&&v.hp>0);
 if(!enemy)return notify('O inimigo não está visível; só é possível reagir a um ataque identificado.');
 const group=reaction?[match.units.find(u=>u.id===unitId&&u.team==='blue'&&u.hp>0)].filter(Boolean)
  :[...selectedUnitIds].map(id=>match.units.find(u=>u.id===id&&u.team==='blue'&&u.hp>0)).filter(Boolean);
 if(!group.length&&!reaction&&selected?.hp>0)group.push(selected);
 if(!group.length)return notify('Nenhum aliado pode executar o combo.');
 const responseDecision=reaction?match.pendingDecision:null;
 let activeTargetId=targetId;
 if(reaction)for(const unit of group)comboDrafts.set(unit.id,[]); // Never inherit an old offensive draft.
 pendingFightTargetId=targetId;action='fight';targetMode=false;stage.classList.remove('modeTarget');
 const panel=$('targetPanel'),steps=$('comboModalSteps');panel.hidden=false;steps.hidden=false;panel.classList.add('composerOpenV453Dev45');panel.classList.toggle('reactionOpenV453Dev45',reaction);
 $('targetTitle').textContent=(reaction?'Resposta ao ataque':'Combate coordenado')+' · '+group.map(u=>u.champ).join(' + ')+' × '+enemy.champ;
 $('targetDescription').textContent=reaction?'O ataque já aconteceu. Defina sua defesa, feitiços e contra-combo em etapas; não há aprovação do agressor.':'Escolha ataque, perseguição ou ambos e configure o combo de cada campeão. O alvo não precisa aceitar.';
 $('targetButtons').replaceChildren();
 const duel=$('duelOverlay');duel.hidden=false;duel.replaceChildren();
 for(const unit of [group[0],enemy]){const card=document.createElement('div');card.className='duelChamp '+unit.team;
  const icon=document.createElement('img');icon.src=officialPortrait(unit.champ);whenPortraitFails(icon,unit.champ);icon.alt='';
  const info=document.createElement('div');info.className='duelInfo';info.innerHTML=`<b>${escapeHTML(unit.champ)} · Nv ${unit.level}</b><small>HP ${Math.ceil(unit.hp)}/${unit.maxHp} · Mana ${Math.ceil(unit.mana)}/${unit.maxMana}</small><div class="duelHP"><span style="width:${Math.round(100*unit.hp/unit.maxHp)}%"></span></div>`;card.append(icon,info);duel.append(card);
  if(unit===group[0]){const vs=document.createElement('strong');vs.className='duelVS';vs.textContent=group.length>1?`${group.length} × 1`:'VS';duel.append(vs);}
 }
 const attackChoice=document.createElement('div');attackChoice.className='comboEngageChoice';
 const modes=reaction?[['fight','Contra-atacar'],['defend','Defender + combo'],['retreat','Recuar + feitiços']]:[['attack_chase','Perseguir + lutar'],['attack','Lutar sem perseguir'],['chase','Só perseguir']];
 attackChoice.innerHTML=`<span>${reaction?'REAGIR AO GOLPE':'ORDEM DE COMBATE'}</span>`;
 const select=document.createElement('select');select.id=reaction?'reactionCombatChoice':'comboEngageMode';select.setAttribute('aria-label',reaction?'Estratégia de reação':'Tipo de combate e perseguição');
 for(const [value,label] of modes){const opt=document.createElement('option');opt.value=value;opt.textContent=label;select.append(opt);}attackChoice.append(select);
 // V4.5.2b: a decisão foi provocada pelo agressor, mas o jogador escolhe QUEM focar.
 // Jamais mostrar inimigos ocultos como opções ou seguir sua posição real pela fog.
 if(reaction){
  const available=perspective.units.filter(v=>v.team==='red'&&v.hp>0&&
    (v.id===targetId||match.mapDistance(group[0],v)<=1800));
  const aimLabel=document.createElement('label');aimLabel.className='reactionTargetPicker';
  aimLabel.textContent='FOCAR INIMIGO';
  const aim=document.createElement('select');aim.id='reactionTargetChoice';
  aim.setAttribute('aria-label','Inimigo a focar com o contra-combo');
  for(const other of available){const opt=document.createElement('option');opt.value=other.id;
   opt.textContent=other.champ+(other.id===targetId?' · agressor':' · próximo');aim.append(opt);}
  aim.value=targetId;
  aim.onchange=()=>{
   activeTargetId=aim.value;const other=available.find(v=>v.id===activeTargetId);if(!other)return;
   $('targetTitle').textContent='Resposta ao ataque · '+group.map(u=>u.champ).join(' + ')+' × '+other.champ;
   const enemyCard=duel.querySelector('.duelChamp.red');if(enemyCard){
    const portrait=enemyCard.querySelector('img');if(portrait){portrait.src=officialPortrait(other.champ);whenPortraitFails(portrait,other.champ);}
    const title=enemyCard.querySelector('b');if(title)title.textContent=other.champ+' · Nv '+other.level;
    const details=enemyCard.querySelector('small');if(details)details.textContent='HP '+Math.ceil(other.hp)+'/'+other.maxHp+' · Mana '+Math.ceil(other.mana)+'/'+other.maxMana;
    const bar=enemyCard.querySelector('.duelHP span');if(bar)bar.style.width=Math.round(100*other.hp/other.maxHp)+'%';
   }
  };
  aimLabel.append(aim);attackChoice.append(aimLabel);
 }
 const extra=document.createElement('small');extra.textContent=reaction?'Escudos e feitiços são gastos durante a resolução, respeitando recursos, alcance e recarga.':'Ataques funcionam mesmo que o alvo selecione defender ou fugir.';attackChoice.append(extra);
 const render=()=>{
  steps.replaceChildren();steps.append(attackChoice);
  for(const u of group){let draft=comboDrafts.get(u.id);if(!draft){draft=[];comboDrafts.set(u.id,draft);}
   const card=document.createElement('section');card.className='comboUnitSteps';const heading=document.createElement('div');heading.className='comboUnitHeading';const avatar=document.createElement('img');avatar.src=officialPortrait(u.champ);whenPortraitFails(avatar,u.champ);
   const label=document.createElement('div');label.innerHTML=`<b>${escapeHTML(u.champ)} <span>Nv ${u.level}</span></b><small>HP ${Math.ceil(u.hp)}/${u.maxHp} · Mana ${Math.ceil(u.mana)}/${u.maxMana} · ${u.role}</small>`;heading.append(avatar,label);card.append(heading);
   const seq=document.createElement('div');seq.className='comboStepPreview';seq.textContent=draft.length?draft.map((k,i)=>`${i+1}. ${k}`).join('  ›  '):'Ataques básicos independentes · adicione habilidades e feitiços';card.append(seq);
   const keys=document.createElement('div');keys.className='comboStepKeys';
   const equipped=champSpells(u).map(spell=>spell.toUpperCase()).filter(spell=>['FLASH','IGNITE','EXHAUST','HEAL','BARRIER'].includes(spell));
   for(const k of ['Q','W','E','R',...equipped]){const btn=document.createElement('button');btn.type='button';btn.className='comboStepKey';const isSkill=k.length===1;const valid=isSkill?!!u.skillRanks?.[k]:equipped.includes(k);
    btn.disabled=!valid||draft.length>=12;
    if(isSkill){const idx=['Q','W','E','R'].indexOf(k),d=skillCatalog.get(u.champ)?.spells?.[idx];btn.innerHTML=`<img src="assets/ui/skills/${k}.svg" alt=""><b>${k}</b>`;if(d?.image?.full)btn.querySelector('img').src=dragon.spellIcon(d.image.full);
    }else{const icon=k.toLowerCase();btn.innerHTML=`<img src="${dragon?.summonerIcon(icon)||'assets/ui/summoners/'+icon+'.svg'}" alt=""><b>${{FLASH:'Flash',IGNITE:'Incendiar',EXHAUST:'Exaustão',HEAL:'Curar',BARRIER:'Barreira'}[k]}</b>`;}
    btn.onclick=()=>{draft.push(k);render()};keys.append(btn);
   }card.append(keys);
   const controls=document.createElement('div');controls.className='comboUnitControls';for(const [name,callback] of [['↶ Desfazer',()=>draft.pop()],['Limpar',()=>draft.length=0]]){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{callback();render();};controls.append(b);}card.append(controls);steps.append(card);
  }
  const foot=$('comboActionsV453Dev45')||document.createElement('div');foot.id='comboActionsV453Dev45';foot.className='comboModalFooter comboStickyFooterV453Dev45';foot.hidden=false;foot.replaceChildren();const cancel=document.createElement('button');cancel.textContent=reaction?'Voltar à reação':'Cancelar';cancel.onclick=()=>{if(reaction){lastPopupKey=null;tacticalReview();return;}panel.hidden=true;steps.hidden=true;pendingFightTargetId=null;resetComboFooterV453Dev45();};
  const submit=document.createElement('button');submit.className='goldButton';submit.textContent=reaction?'✓ Executar resposta':'✓ Confirmar plano · '+group.length+' campeão(s)';submit.onclick=()=>{
   if(reaction){
    if(!responseDecision||match.pendingDecision!==responseDecision)return notify('Janela de reação encerrada.');
    const choice=select.value;const result=match.queueReactionCombo('blue',group[0].id,activeTargetId,[...(comboDrafts.get(group[0].id)||[])],{response:choice,chase:choice==='fight'});
    if(!result.ok)return notify(result.reason);
    panel.hidden=true;steps.hidden=true;resetComboFooterV453Dev45();pendingFightTargetId=null;lastPopupKey=null;action='auto';notify('Resposta tática: '+group[0].champ+' focando '+(perspective.units.find(v=>v.id===activeTargetId)?.champ||'inimigo')+' · '+(comboDrafts.get(group[0].id)||[]).length+' etapas.');updateInspector();renderStatus();requestDraw();resumeRound();return;
   }
   const visible=match.perspective('blue').units.some(v=>v.id===targetId&&v.team==='red'&&v.hp>0);if(!visible)return notify('O alvo saiu da visão.');
   const selection=select.value;const orders=group.map(u=>selection==='chase'?({kind:'chase',targetId}):({kind:'attack',targetId,chase:selection==='attack_chase',combatStyle:'combo',combo:[...(comboDrafts.get(u.id)||[])],comboIndex:0}));
   const result=match.setGroupOrders('blue',group.map(u=>u.id),orders);if(!result.ok)return notify(result.reason);
   panel.hidden=true;steps.hidden=true;resetComboFooterV453Dev45();pendingFightTargetId=null;action='auto';notify(selection==='chase'?'Perseguição programada.':'Ataque + combos privados confirmados, sem necessidade de aceitação do adversário.');updateInspector();renderStatus();requestDraw();
  };const close=$('targetClose');close.textContent='Fechar ×';close.onclick=()=>{if(reaction){lastPopupKey=null;tacticalReview();return;}panel.hidden=true;steps.hidden=true;pendingFightTargetId=null;resetComboFooterV453Dev45();};foot.append(cancel,submit,close);panel.append(foot);
 };
 render();
}
function contextTarget(pos,explicitTargetId=null){
 if(!selected||selected.hp<=0)return false;
 const structs=match.perspective('blue').structures.filter(t=>t.team==='red'&&t.alive);
 const nearestStructure=structs.sort((a,b)=>dist(a,pos)-dist(b,pos))[0];
 if(!explicitTargetId&&nearestStructure&&dist(nearestStructure,pos)<.022){
  openTarget(`${selected.champ} × ${nearestStructure.id}`,'Objetivo estrutural: avançar com a wave para que minions recebam o aggro da torre.',[
   ['Puxar wave e pressionar',()=>{const goal=nearestWalkable({x:nearestStructure.x-.05,y:nearestStructure.y+.04});if(!goal)return notify('Área bloqueada');const r=match.setPlan('blue',selected.id,[{point:goal,action:'push',duration:180}]);notify(r.ok?'Plano de pressão de torre definido.':r.reason)}],
   ['Manter fora do alcance',()=>{match.setPolicy('blue',selected.id,'safe');notify('Postura cautelosa ativada.')}]
  ]);return true;
 }
 // Map camp positions are public strategic knowledge even in fog; live HP/respawn are not.
 const camp=match.camps.filter(c=>c.x!=null&&c.y!=null).sort((a,b)=>dist(a,pos)-dist(b,pos))[0];
 if(!explicitTargetId&&camp&&dist(camp,pos)<.025){openTarget(`${selected.champ} × ${camp.name||'Acampamento'}`,'Acampamento mapeado. A ordem seguirá mesmo em fog; vida e reaparecimento permanecem desconhecidos sem visão.',[
  ['Limpar campo',()=>{const target=nearestWalkable({x:camp.x,y:camp.y});if(!target)return notify('Camp inacessível');const r=match.setPlan('blue',selected.id,[{point:target,action:'jungle',duration:110,targetId:camp.id}]);notify(r.ok?'Limpeza da jungle planejada.':r.reason)}],
  ['Configurar Golpear',()=>{if(selected.role!=='JG')return notify('Golpear apenas para jungler.');$('smitePanel').open=true;$('smiteMode').value='targets';$('smiteTarget').value=camp.id;$('smiteThreshold').value=String(match.smitePower(selected)||600);smiteDraftView();document.getElementById('smitePanel').scrollIntoView({block:'nearest'});notify('Escolha o HP e aplique a política no painel direito.');}],
  ['Apenas aproximar',()=>applyOrder({kind:'move',destination:nearestWalkable(camp)})]
 ]);return true;}
 const enemy=explicitTargetId?match.perspective('blue').units.find(u=>u.id===explicitTargetId&&u.team==='red'&&u.hp>0):match.perspective('blue').units.filter(u=>u.team==='red'&&u.hp>0).sort((a,b)=>dist(a,pos)-dist(b,pos))[0];
 if(enemy&&dist(enemy,pos)<.035){if(action==='fight'){showComboComposer(enemy.id);return true;}openTarget(`${selected.champ} × ${enemy.champ}`,'Inimigo visível: escolha a resposta para a próxima resolução simultânea.',[
  ['Lutar · montar combo',()=>{showComboComposer(enemy.id);return false;}],
  ['Defender',()=>applyOrder({kind:'defend'})],
  ['Evitar luta',()=>match.setPolicy('blue',selected.id,'safe')]
 ]);return true;}
 return false;
}
// The equipped slot comes from Champion Select, never from a mutable
// overlay setting/localStorage. A legacy save without smiteKey defaults to F.
function smiteKeyV452d4Dev9(){const jg=match.units.find(u=>u.id==='blue_JG');const legacy=match.units.find(u=>u.id==='blue_JG')?.smiteKey;return Array.isArray(jg?.summonerSlots)?(jg.summonerSlots[0]==='smite'?'d':'f'):(legacy==='d'?'d':'f');}
function setSmiteKeyV452d4Dev9(){const v=smiteKeyV452d4Dev9();$('smiteContestKey').value=v;$('smiteContestKey').disabled=true;$('smiteContestKeyLabel').textContent=v.toUpperCase();}
setSmiteKeyV452d4Dev9();
function hideSmiteContestV452d4Dev9(){$('smiteContestOverlay').hidden=true;const video=$('smiteContestVideo');if(video){video.pause();video.hidden=true;}}
function objectiveMediaV452d4Dev11(key){
 const stage=$('smiteContestMediaStage'),video=$('smiteContestVideo');if(!stage||!video)return;
 const item=window.COACH_SMITE_MEDIA_DEV11?.[key];video.pause();video.removeAttribute('src');video.load();video.hidden=true;stage.dataset.mediaKind='fallback';
 if(item?.kind==='video'&&typeof item.src==='string'&&/^assets\/objective-media\/[\w.\/-]+\.(mp4|webm)$/i.test(item.src)){
  video.src=item.src;video.hidden=false;stage.dataset.mediaKind='video';video.play().catch(()=>{});
 }else if(item?.kind==='glb'&&window.CoachObjective3DRenderer?.mount){
  stage.dataset.mediaKind='glb';window.CoachObjective3DRenderer.mount(stage,item);
 }
}

function showSmiteContestV452d4Dev9(){
 const st=match.smiteContestV452d4Dev9,c=match.camps.find(x=>x.id===st?.campId);
 if(!st||!c)return;
 const blue=match.units.find(x=>x.id===st.blueId),red=match.units.find(x=>x.id===st.redId);
 const label={dragon:'DRAGÃO',herald:'ARAUTO',baron:'BARÃO',voidgrubs:'VASTILARVA'}[c.timerKey]||'OBJETIVO';
 const grub=st.grubId?c.grubsV45?.find(g=>g.id===st.grubId):null;
 const health=grub?.hp??c.health,maxHealth=grub?.maxHp??c.maxHealth;
 $('smiteContestTitle').textContent='DISPUTA DO '+label;
 const asset={dragon:'dragon',herald:'herald',baron:'baron',voidgrubs:'voidgrubs'}[c.timerKey]||'dragon';
 $('smiteContestMonsterIcon').src='assets/icons/'+asset+'.svg';
 $('smiteContestMonsterIcon').alt=label;objectiveMediaV452d4Dev11(c.timerKey);
 $('smiteContestMonsterTitle').textContent='HP REAL DO '+label;
 $('smiteContestHpLabel').textContent=Math.ceil(health).toLocaleString('pt-BR')+' / '+Math.ceil(maxHealth).toLocaleString('pt-BR');
 $('smiteContestHpFill').style.width=Math.max(0,Math.min(100,100*health/Math.max(1,maxHealth)))+'%';
 $('smiteContestBluePower').textContent=match.smitePower(blue).toLocaleString('pt-BR');
 $('smiteContestRedPower').textContent=match.smitePower(red).toLocaleString('pt-BR');
 $('smiteContestBlueStatus').textContent=(blue?.champ||'Jungler')+' · '+(blue?.smiteCharges||0)+' carga(s)';
 $('smiteContestRedStatus').textContent=(red?.champ||'Jungler')+' · BOT';
 setSmiteKeyV452d4Dev9();$('smiteContestOverlay').hidden=false;
 $('smiteContestCast').focus({preventScroll:true});
}
function answerSmiteContestV452d4Dev9(choice){
 const st=match.smiteContestV452d4Dev9;if(!st)return;
 const r=match.submitSmiteContestV452d4Dev9('blue',st.blueId,choice);
 if(!r.ok){notify('Golpear indisponível: '+r.reason);return;}
 hideSmiteContestV452d4Dev9();lastPopupKey=null;
 notify(choice==='cast'?'Golpear confirmado! Disputa resolvida no mesmo tick simulado.':'Golpear reservado. Oponente pode executar o dragão.');
 renderStatus();requestDraw();resumeRound();
}
$('smiteContestCast').onclick=()=>answerSmiteContestV452d4Dev9('cast');
$('smiteContestHold').onclick=()=>answerSmiteContestV452d4Dev9('hold');
function tacticalReview(){
 const decision=match.pendingDecision;
 if(!decision)return;
 if(decision.kind==='smite_contest'){showSmiteContestV452d4Dev9();return;}

 if(!['encounter','duel_request','pickoff_reaction','combat_reaction'].includes(decision.kind)){openTarget('Decisão da rodada','Confirme para retomar a simulação.',[['Continuar',()=>{match.answerDecision();lastPopupKey=null;resumeRound();}]]);return;}
 const key=decision.kind+':'+decision.unitId+':'+decision.at;
 if(key===lastPopupKey)return;
 lastPopupKey=key;
 const unit=match.units.find(u=>u.id===decision.unitId),enemy=match.units.find(u=>u.id===decision.enemyId);
 if(unit?.team==='blue'&&!selectedUnitIds.has(unit.id))choose(unit);
 const respond=choice=>{
  if(choice==='retreat')match.requestRetreatV453Dev45('blue',unit.id);
  if(['duel_request','pickoff_reaction'].includes(decision.kind))match.respondToDuel('blue',unit.id,choice);
  else{
   const reactions={defend:'safe',fight:'aggressive',retreat:'safe'};
   match.setPolicy('blue',unit.id,reactions[choice]||'balanced');
  }
  match.answerDecision();lastPopupKey=null;
  $('targetPanel').hidden=true;pendingFightTargetId=null;action='auto';updateInspector();renderStatus();requestDraw();resumeRound();
 };
 openTarget(decision.kind==='pickoff_reaction'?'PICKOFF · Reagir à emboscada':decision.kind==='combat_reaction'?'DEFESA · Responder ao golpe':'Encontro tático',
  `${unit?.champ||'Aliado'} × ${enemy?.champ||'inimigo'} · ${decision.kind==='pickoff_reaction'?'O primeiro ataque surpresa já aconteceu. Reaja agora; não é uma aprovação prévia.':'O ataque foi efetuado sem consentimento. Defina como responder.'} Recuar não bloqueia ataques enquanto estiver no alcance.`,[
   ['⚔ Lutar · montar contra-combo + feitiços',()=>{showComboComposer(enemy.id,{reaction:true,unitId:unit.id});return false;}],['Defender rápido',()=>{respond('defend');return false;}],['AA imediato (sem combo)',()=>{respond('fight');return false;}],['Recuar',()=>{respond('retreat');return false;}],
   ...(['duel_request','pickoff_reaction'].includes(decision.kind)?[['Peel',()=>{respond('peel');return false;}]]:[]),
  ]);
 // Escapes are true reaction options: the decision stays paused until the
 // player clicks a landing point; the overlay no longer blocks map input.
 if(unit?.team==='blue'&&unit.hp>0){
  const possible=champSpells(unit).includes('flash')?[['flash','Flash · apontar no mapa']]:[];
  if(unit.champ==='Ezreal'&&unit.skillRanks.E)possible.push(['E','E · Translocação Arcana']);
  if(unit.champ==='Tristana'&&unit.skillRanks.W)possible.push(['W','W · Salto Foguete']);
  const wrap=$('targetButtons');
  for(const [ability,label] of possible){const btn=document.createElement('button');btn.type='button';btn.className='reactionEscapeBtn';btn.textContent=label;
   btn.onclick=()=>{action=ability==='flash'?'flash':'escape_skill';targetedSkillSlot=ability==='flash'?null:ability;
    targetMode=true;stage.classList.add('modeTarget');$('targetPanel').hidden=true;
    notify('Reação '+label+': clique no chão para deslocar. Escape respeita alcance e cooldown.');requestDraw();};wrap.append(btn);
  }
  if(unit.items?.includes('zhonyas_hourglass')||(unit.items?.includes('seekers_armguard')&&!unit.armguardSpentV453Dev37)){
   const stasis=document.createElement('button');stasis.className='reactionStasisBtn';
   stasis.textContent=unit.items.includes('zhonyas_hourglass')?'⌛ Ampulheta':'⌛ Armaguarda · 1 uso';stasis.onclick=()=>{
    const out=match.activateStasis('blue',unit.id);notify(out.ok?'Estase ativa: dano suspenso.':out.reason);
    if(out.ok){respond('defend');$('targetPanel').hidden=true;resumeRound();}
   };wrap.append(stasis);}
 }
 const bar=$('duelOverlay');bar.replaceChildren();bar.hidden=false;
 for(const [champ,team] of [[unit,'blue'],[enemy,'red']]){
  const card=document.createElement('div');card.className='duelChamp '+team;
  const image=document.createElement('img');image.alt=champ?.champ||'?';image.src=officialPortrait(champ?.champ||'Unknown');image.onerror=()=>{image.onerror=null;image.src='assets/portraits/'+(champ?.champ||'Unknown')+'.svg';};
  const details=document.createElement('div');details.className='duelInfo';
  const title=document.createElement('b');title.textContent=champ?.champ||'Desconhecido';
  const hp=document.createElement('div');hp.className='duelHP';
  const fill=document.createElement('span');fill.style.width=(champ?Math.max(0,Math.round(100*champ.hp/champ.maxHp)):0)+'%';hp.append(fill);
  const numbers=document.createElement('small');numbers.textContent=champ?Math.ceil(champ.hp)+' / '+champ.maxHp:'HP desconhecido';
  details.append(title,hp,numbers);card.append(image,details);bar.append(card);
  if(team==='blue'){const vs=document.createElement('strong');vs.textContent='VS';vs.className='duelVS';bar.append(vs);}
 }
}

function renderOrderHistory(){
 const root=$('ordersHistory');if(!root)return;
 root.replaceChildren();const active=match.units.filter(u=>u.team==='blue');
 for(const unit of active){
  const latest=(match.orderHistory||[]).filter(h=>h.unitId===unit.id).slice(0,3);
  const line=document.createElement('div');line.className='orderHistoryRow';
  const name=document.createElement('b');name.textContent=unit.role+' · '+unit.champ;
  const detail=document.createElement('small');
  const stage=unit.plan&&!unit.plan.completed?unit.plan.steps.slice(unit.plan.index).map(st=>st.action+(st.targetId?' '+(match.camps.find(c=>c.id===st.targetId)?.timerKey||'campo'):'')) .join(' → '):unit.order?.kind||'auto';
  detail.textContent=stage+(latest.length?' · rodada '+latest[0].round:'');detail.title=latest.map(h=>'R'+h.round+' '+h.label).join(' | ');
  const change=document.createElement('button');change.type='button';change.title='Editar no prompt sem apagar ordens dos demais campeões';change.textContent='Editar';change.onclick=()=>{$('textOrders').value=unit.role+' '+stage;$('textOrders').focus();clearCommandPreview();};
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='×';cancel.title='Cancelar ordem persistente deste campeão';cancel.onclick=()=>{const out=match.cancelChampionOrder('blue',unit.id);notify(out.ok?unit.champ+': ordem cancelada':out.reason);updateInspector();renderStatus();requestDraw();};
  line.append(name,detail,change,cancel);root.append(line);
 }
}
function syncBoardCenteredScoreV453Dev48(){
 const header=document.querySelector('.header');if(!header||!stage)return;
 const box=stage.getBoundingClientRect(),h=header.getBoundingClientRect();
 header.style.setProperty('--board-center',`${box.left+box.width/2-h.left}px`);
}
window.addEventListener('resize',syncBoardCenteredScoreV453Dev48);
requestAnimationFrame(syncBoardCenteredScoreV453Dev48);
function renderGlobalObjectiveTimes(){
 const root=$('objectiveTimes');if(!root)return;
 root.replaceChildren();
 const observed=match.perspective('blue');
 const labels={voidgrubs:'Vastilarvas',herald:'Arauto',dragon:'Dragão',baron:'Barão'};
 for(const type of ['voidgrubs','herald','dragon','baron']){
  const c=observed.camps.find(x=>x.timerKey===type);if(!c)continue;
  const phase=window.CoachArena.OBJECTIVE_PHASES_V44?.[type],rule=window.CoachArena.CAMP_RULES_2026?.[type];
  if(phase?.leave&&match.gameTime>=phase.leave)continue;
  const spawn=rule?.spawn||phase?.spawn||0;
  const first=match.gameTime<spawn,known=c.knownRespawnAt>match.gameTime;
  const remaining=first?spawn-match.gameTime:known?c.knownRespawnAt-match.gameTime:0;
  const timer=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(Math.ceil(remaining%60)).padStart(2,'0');
  const detail=first?timer:c.alive===true?'VIVO':known?timer:c.unknown?'?':'INATIVO';
  const item=document.createElement('span');item.className='objectiveTime '+type;
  const icon=document.createElement('img');icon.alt='';icon.className='objectiveTimerIconV453Dev48';
  const chosen=type==='dragon'?(c.dragonKind==='elder'?'elder':c.dragonElement||'dragon'):type;
  icon.src=RIOT_SCOREBOARD_ASSETS_V453_DEV47[chosen]
   ?'https://raw.communitydragon.org/16.21/game/assets/ux/scoreboard/'+RIOT_SCOREBOARD_ASSETS_V453_DEV47[chosen]+'.png'
   :'assets/icons/'+chosen+'.svg';
  icon.onerror=()=>{icon.onerror=null;icon.src='assets/icons/'+(chosen==='elder'?'dragon':chosen)+'.svg'};
  const counter=document.createElement('span');counter.textContent=detail;
  item.append(icon,counter);
  item.title=c.unknown?'Status não observado na fog':labels[type]+' — estado observado';
  root.append(item);
 }
}
function renderStatus(){
 const opening=$('openingShopBanner');if(opening)opening.hidden=match.phase!=='preparation';
 const n=v=>String(Math.max(0,v)).padStart(2,'0'),m=Math.floor(match.gameTime/60),s=match.gameTime%60;
 const phase=match.phase;
 $('simulatedNow').textContent=phase==='preparation'?'PREPARAÇÃO INICIAL · campeões na fonte':phase==='planning'?'PLANEJAMENTO · mapa congelado':phase==='decision'?'PAUSADO · escolha sua reação':'EXECUTANDO · mapa em movimento';
 if($('roundLabel'))$('roundLabel').textContent=n(match.round);$('topRound').textContent=match.round;
 $('gameTime').textContent=n(m)+':'+n(s);
 const left=phase==='executing'?match.executionRemaining:secondsLeft;
 $('timer').textContent=n(Math.floor(left/60))+':'+n(left%60);$('topTimer').textContent=$('timer').textContent;
 $('timeProgress').style.width=(phase==='executing'?left/(match.roundSeconds||1):secondsLeft/(match.phase==='preparation'?60:match.decisionSeconds))*100+'%';
 $('blueReady').textContent=match.teams.blue.ready?'CONFIRMADO':'PLANEJANDO';$('redReady').textContent=match.teams.red.ready?'CONFIRMADO':'IA LOCAL';
 $('confirm').disabled=['executing','decision','finished'].includes(phase);
 $('confirm').innerHTML=phase==='preparation'?'Finalizar Turno <span>✓</span>':phase==='executing'?'Executando…':phase==='decision'?'Escolha uma reação':'Finalizar Turno <span>✓</span>';
 for(const team of ['blue','red']){let nex=match.structures.find(s=>s.id===team+'_nexus'),percent=Math.round(100*(nex?.hp||0)/(nex?.maxHp||1));$(team==='blue'?'scoreBlue':'scoreRed').textContent='◆ '+percent+'%';}
 renderEnemyRoster();$('scoreKillsBlue').textContent='⚔ '+match.teams.blue.kills+' abates';$('scoreKillsRed').textContent='⚔ '+match.teams.red.kills+' abates';
 for(const team of ['blue','red'])$('scoreTowers'+(team==='blue'?'Blue':'Red')).textContent='♜ '+match.structures.filter(st=>st.team===team&&st.type==='tower'&&st.alive).length+' torres';renderScoreboard();
 renderOrderHistory();renderGlobalObjectiveTimes();
 $('eventLog').innerHTML=match.perspective('blue').events.slice(0,11).map(e=>`<div class="event ${e.kind==='death'?'dangerEvent':e.kind==='danger'?'warningEvent':''}"><b>${n(Math.floor(e.time/60))}:${n(e.time%60)}</b> ${escapeHTML(e.text)}</div>`).join('');
 syncEndgameFlow();
}
function escapeHTML(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function resumeRound(){
 if(executionTimer)clearInterval(executionTimer);
 if(match.pendingDecision){tacticalReview();renderStatus();return;}
 if(match.phase==='decision'&&match.executionRemaining===0){match.finishCompletedRound();renderStatus();return;}
 if(match.phase==='decision')match.phase='executing';
 executionTimer=setInterval(()=>{
  if(match.phase==='decision'&&match.pendingDecision){clearInterval(executionTimer);executionTimer=null;tacticalReview();return;}
  let r;
  try{beforeLiveStep();r=match.continueExecution(1);afterLiveStep();}
  catch(err){clearInterval(executionTimer);executionTimer=null;console.error('CoachLOL execution',err);notify('Falha ao executar a rodada. Verifique o log; a partida continua pausada.');return;}
  selected=selected?match.units.find(u=>u.id===selected.id):null;
  renderStatus();updateInspector();requestDraw();
  if(r.paused){clearInterval(executionTimer);executionTimer=null;lastPopupKey=null;tacticalReview();}
  else if(!r.running){clearInterval(executionTimer);executionTimer=null;
   secondsLeft=match.decisionSeconds;planningStartedAt=performance.now();
   $('boardHint').textContent='Rodada concluída. Planeje as próximas ordens; tabuleiro congelado.';
   notify('Rodada concluída · ações executadas simultaneamente.');}
 },SIMULATION_FRAME_MS/speedFactor);
}
function resolve(){
 if(match.ended||executionTimer||match.pendingDecision)return;
 if(match.round===1&&$('autoStarter').checked){
  for(const u of match.units.filter(x=>x.team==='blue'&&x.items.length===0)){
   const item=u.role==='JG'?'jungle_gustwalker':u.role==='SUP'?'support_atlas':u.role==='ADC'?'dorans_blade':u.klass==='mage'||u.klass==='enchanter'?'dorans_ring':u.klass==='tank'?'dorans_shield':'dorans_blade';
   match.buy('blue',u.id,item);
  }
 }
 const started=match.playTurn({autoStarter:$('autoStarter').checked});
 if(!started.ok){notify(started.reason||'Não é possível executar a rodada.');return;}
 routeDrafts={};$('boardHint').textContent='Ações confirmadas: executando a mesma janela dos dois times.';
 resumeRound();renderStatus();
}
function timer(){
 if(match.ended)return;
 if(match.phase==='decision'){
  if(match.pendingDecision){tacticalReview();renderStatus();return;}
  if(match.executionRemaining===0){match.finishCompletedRound();secondsLeft=match.decisionSeconds;planningStartedAt=performance.now();}
  else {match.phase='executing';if(!executionTimer)resumeRound();}
 }
 if(match.phase==='executing'){
  if(!executionTimer&&match.executionRemaining>0)resumeRound();
  else if(!executionTimer&&match.executionRemaining===0){match.finishCompletedRound();secondsLeft=match.decisionSeconds;planningStartedAt=performance.now();}
  renderStatus();return;
 }
 secondsLeft=Math.max(0,(match.phase==='preparation'?60:match.decisionSeconds)-Math.floor((performance.now()-planningStartedAt)*speedFactor/1000));
 if(secondsLeft<=0){resolve();return;}
 renderStatus();
}
setInterval(timer,250);

const cmds=window.CoachCommands;
function clearCommandPreview(){commandPreviewSource=null;commandPreview=null;$('applyTextOrders').disabled=true;$('commandPreview').hidden=true;$('textOrderStatus').textContent='As ordens continuam entre rodadas.';}
$('textOrders').addEventListener('input',clearCommandPreview);
$('previewOrders').onclick=()=>{
 if(match.teams.blue.ready||match.pendingDecision||match.phase==='executing'){notify('Aguarde o fim da execução.');return;}
 commandPreviewSource=$('textOrders').value;
 commandPreview=cmds.interpretCommands(commandPreviewSource,match,{team:'blue',selectedId:selected?.id});
 const pv=$('commandPreview');pv.hidden=false;
 pv.innerHTML=commandPreview.commands.map(x=>`<div class="orderGroup"><b>${escapeHTML(x.role||'?')}</b><span>${x.actions.map(v=>escapeHTML(v.label)).join(' · ')||'Sem ações reconhecidas'}</span></div>`).join('')
  +(commandPreview.errors.length?`<div class="orderWarnings">${commandPreview.errors.map(escapeHTML).join(' | ')}</div>`:'');
 $('applyTextOrders').disabled=!commandPreview.ok;
 $('textOrderStatus').textContent=commandPreview.ok?`${commandPreview.commands.length} blocos prontos para aplicar.`:'Revise os trechos marcados antes de confirmar.';
};
// Keyboard contract: Enter previews, next Enter applies. Shift+Enter inserts a newline.
// A changed text cannot apply an outdated preview; repeat and IME composition are ignored.
$('textOrders').addEventListener('keydown',e=>{
 if(e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.altKey||e.metaKey||e.isComposing||e.repeat)return;
 e.preventDefault();e.stopPropagation();
 if(commandPreviewSource===$('textOrders').value&&commandPreview){
  if(commandPreview.ok&&!$('applyTextOrders').disabled)$('applyTextOrders').click();
  else notify('Há erros na prévia. Corrija as ordens e pressione Enter novamente.');
 }else $('previewOrders').click();
});
$('applyTextOrders').onclick=()=>{
 if(!commandPreview?.ok)return;
 if(commandPreviewSource!==$('textOrders').value){clearCommandPreview();notify('Texto alterado: gere outra prévia.');return;}
 const result=cmds.applyCommands(commandPreview,match,{team:'blue'});
 if(!result.ok){notify(result.errors.join(' | '));return;}
 notify('Ordens convertidas e aplicadas. Confirme a rodada quando estiver pronto.');
 clearCommandPreview();$('textOrders').value='';updateInspector();renderStatus();requestDraw();
};


// Voice commands are opt-in, on-device only. Never use server-backed Web Speech fallback.
let localVoice=null,voiceBusy=false,voiceSession=0;
function stopLocalVoice(){
 voiceSession++;
 const active=localVoice;localVoice=null;
 $('voiceLocal').textContent='🎙 Voz local';
 if(active){try{active.abort();}catch{try{active.stop();}catch{}}}
}
$('voiceLocal').onclick=async()=>{
 const button=$('voiceLocal'),feedback=$('voiceFeedback'),help=$('voiceHelp');
 if(voiceBusy)return;
 if(localVoice){stopLocalVoice();feedback.textContent='Gravação encerrada.';return;}
 voiceBusy=true;button.disabled=true;
 const thisSession=++voiceSession;
 const LocalSpeech=window.SpeechRecognition||window.webkitSpeechRecognition;
 try{
  if(!LocalSpeech||typeof LocalSpeech.available!=='function'){
   feedback.textContent='Reconhecimento local indisponível neste navegador.';help.hidden=false;return;
  }
  const state=await LocalSpeech.available({langs:['pt-BR'],processLocally:true});
  if(thisSession!==voiceSession)return;
  if(state!=='available'){
   help.hidden=false;
   if(['downloadable','downloading'].includes(state)){
    feedback.textContent='Idioma local ainda não instalado. Clique em “Instalar idioma” para autorizar o download.';
    help.textContent='Instalar idioma local';help.href='#';
    help.hidden=false;
    help.onclick=async e=>{
     e.preventDefault();if(voiceBusy)return;
     if(typeof LocalSpeech.install!=='function'){feedback.textContent='Seu navegador não oferece instalação local.';return;}
     voiceBusy=true;help.style.pointerEvents='none';
     try{const ok=await LocalSpeech.install({langs:['pt-BR'],processLocally:true});feedback.textContent=ok?'Idioma local instalado. Clique em Voz local para começar.':'Falha ao instalar idioma local.';}
     catch{feedback.textContent='Não foi possível instalar o pacote local.';}
     finally{voiceBusy=false;help.style.pointerEvents='';}
    };
   }else feedback.textContent='Voz pt-BR offline indisponível; áudio não será enviado à nuvem.';
   return;
  }
  help.hidden=true;
  const recognition=new LocalSpeech();
  recognition.lang='pt-BR';recognition.continuous=false;recognition.interimResults=false;recognition.processLocally=true;
  let accepted=false;
  recognition.onresult=e=>{
   if(accepted||thisSession!==voiceSession)return;
   const final=Array.from(e.results||[]).filter(r=>r.isFinal!==false).map(r=>r[0]?.transcript||'').join(' ').trim();
   if(!final)return;accepted=true;
   const field=$('textOrders');field.value+=(field.value.trim()?'; ':'')+final;
   field.dispatchEvent(new Event('input',{bubbles:true}));
   $('previewOrders').click();feedback.textContent='Transcrição adicionada uma vez. Revise e pressione Enter para confirmar.';
  };
  recognition.onerror=e=>{if(thisSession===voiceSession)feedback.textContent='Reconhecimento encerrado: '+(e.error||'erro local');};
  recognition.onend=()=>{if(thisSession!==voiceSession)return;localVoice=null;button.textContent='🎙 Voz local';};
  localVoice=recognition;button.textContent='■ Parar voz';feedback.textContent='Ouvindo uma única frase no dispositivo…';
  recognition.start(); // Never auto-restart or request a second permission.
 }catch{if(thisSession===voiceSession)feedback.textContent='Microfone/idioma local indisponível.';stopLocalVoice();}
 finally{voiceBusy=false;button.disabled=false;}
};

function renderAllStats(u){
 if(!u)return;const stats=championStatsV39(u),effective=match.elementalStatsV452d3(u);for(const key of ['ad','ap','armor','mr','abilityHaste','tenacity','healShieldPower','slowResist'])stats[key]=effective[key];$('allStatsTitle').textContent=u.champ+' · NÍVEL '+u.level;
 $('allStatsGrid').innerHTML=STAT_SCHEMA_V39.map(([key,label])=>{
 const raw=stats[key],formatted=['cooldownReduction','critChance','critDamage','armorPenPercent','magicPenPercent','lifeSteal','omnivamp','physicalVamp','spellVamp','healShieldPower','tenacity','slowResist'].includes(key)?raw.toFixed(1)+'%':(Math.round(raw*10)/10).toLocaleString('pt-BR');
 return '<span>'+label+'</span><b>'+formatted+'</b>';
 }).join('');
 const effects=(u.statusEffectsV41||[]).filter(e=>e.until>match.gameTime);const detail=$('effectDetailsV41');
 if(detail)detail.innerHTML='<h4>EFEITOS ATIVOS · V4.1</h4>'+(effects.length?effects.map(e=>`<div class="effectDetailV41"><span>${escapeHTML(e.type.replaceAll('_',' '))}</span><b>${Math.ceil(e.until-match.gameTime)}s${e.power?' · '+Math.round(e.power)+' pontos':''}</b></div>`).join(''):'<p>Nenhum efeito temporário registrado.</p>');
}
function closeAllStats(){const box=$('allStatsOverlay');box.hidden=true;$('showAllStats').setAttribute('aria-expanded','false');}
$('showAllStats').onclick=e=>{e.stopPropagation();if(!selected)return;const box=$('allStatsOverlay');
 // Portaled to <body> so the scrollable sidebar and canvas cannot clip the flyout.
 if(box.parentElement!==document.body)document.body.append(box);
 const r=$('showAllStats').getBoundingClientRect();
 box.style.position='fixed';box.style.right='auto';box.style.left=Math.max(8,r.left-377)+'px';box.style.top=Math.max(12,Math.min(window.innerHeight-550,r.top-70))+'px';
 box.style.zIndex='9999';box.hidden=!box.hidden;$('showAllStats').setAttribute('aria-expanded',String(!box.hidden));if(!box.hidden)renderAllStats(selected);};
$('allStatsClose').onclick=closeAllStats;
$('allStatsOverlay').onclick=e=>e.stopPropagation();
document.addEventListener('pointerdown',e=>{if(!$('allStatsOverlay').hidden&&!e.target.closest('#allStatsOverlay')&&!e.target.closest('#showAllStats'))closeAllStats();},true);
function wallPlanningLimit(){return match.phase==='preparation'?60:match.decisionSeconds;}
function speedSelectApply(value){
 const next=Number(value);if(![1,2].includes(next))return;
 if(match.phase==='executing'||match.phase==='decision'||match.teams.blue.ready)return notify('Altere a velocidade durante o planejamento, antes de confirmar.');
 // Keep the simulated clock unchanged; adjust ONLY wall-time allocation.
 const elapsed=(performance.now()-planningStartedAt)/1000;
 const simulatedElapsed=elapsed*speedFactor;
 speedFactor=next;planningStartedAt=performance.now()-(simulatedElapsed/speedFactor)*1000;
 $('matchSpeed').value=String(speedFactor);
 notify('Velocidade '+speedFactor+'×: planejamento e execução acelerados; cooldowns em segundos de jogo preservados.');renderStatus();
}
$('matchSpeed').onchange=e=>speedSelectApply(e.target.value);
$('decisionLimit').onchange=e=>{const v=Number(e.target.value);if(![30,60,90].includes(v)||match.teams.blue.ready)return;match.decisionSeconds=v;if(match.phase!=='preparation'){secondsLeft=v;planningStartedAt=performance.now();}renderStatus();notify('Planejamento configurado: '+v+' segundos. Mapa permanece congelado.');};
$('confirm').onclick=resolve;
$('targetClose').onclick=()=>{if(match.pendingDecision)return notify('Escolha uma das respostas para continuar.');hideTarget();};
$('closeHud').onclick=()=>{selected=null;updateInspector();hideTarget();requestDraw()};
$('policySelect').onchange=e=>{if(!selected)return;match.setReaction('blue',selected.id,e.target.value);updateInspector();requestDraw()};
$('baseOpenShop').onclick=()=>openShop('all');
$('autoSkillToggle').onchange=e=>{if(!selected)return;match.setSkillPlan('blue',selected.id,{auto:e.target.checked});updateInspector();};
function saveSkillPriority(){if(!selected)return;const input=$('skillPriorityInput');const raw=input.value.toUpperCase().replace(/[\s,>›→+\-]/g,'');
 if(!/^[QWER]{1,4}$/.test(raw)||new Set(raw).size!==raw.length)return notify('Ordem inválida: use letras únicas Q/W/E/R, exemplo EWQ ou WQE.');
 const list=[...raw].filter(k=>k!=='R'||selected.champ==='Udyr'),allowed=selected.champ==='Udyr'?['Q','W','E','R']:['Q','W','E'];
 const priority=[...list,...allowed.filter(k=>!list.includes(k))];
 const opening=selected.champ==='Udyr'?priority:priority.filter(k=>k!=='R');const phases=priority.map(slot=>({slot,target:slot==='R'?6:5}));
 const result=match.setSkillPlan('blue',selected.id,{priority,opening,phases,auto:!!selected.autoLevelSkills});
 if(!result)return notify('Não é possível alterar prioridade durante a execução.');notify(selected.champ+': prioridade '+raw+' definida (R nos níveis permitidos).');updateInspector();}
$('skillPriorityApply').onclick=saveSkillPriority;$('skillPriorityInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();saveSkillPriority();}};
$('baseFollowLane').onclick=()=>{if(!selected||!match.leaveShop('blue',selected.id))return notify('Campeão ainda não está na fonte.');updateInspector();notify('Seguindo para a lane por escolha do jogador.');};
$('combatModes').addEventListener('click',e=>{const b=e.target.closest('button[data-style]');if(!b)return;combatStyle=b.dataset.style;updateInspector();});
$('comboUndo').onclick=()=>{comboSlots.pop();updateInspector()};
$('comboClear').onclick=()=>{comboSlots=[];updateInspector()};
$('comboSubmit').onclick=()=>{if(!pendingFightTargetId||!selected)return;
 const enemy=match.units.find(u=>u.id===pendingFightTargetId);
 if(!enemy||enemy.hp<=0||!match.visible('blue',enemy)){notify('Alvo não está mais visível.');return;}
 const ok=applyOrder({kind:'attack',targetId:enemy.id,combatStyle:comboSlots.length?'combo':combatStyle,combo:[...comboSlots],comboIndex:0});
 if(ok){pendingFightTargetId=null;comboSlots=[];action='auto';updateInspector();notify('Ataque programado: o adversário não precisa aceitar a luta.');}
};
// Visible-unit picker. All candidate coordinates originate from perspective(),
// so the widget cannot leak enemy positions through fog of war.
let targetPicker=null;
function closeTargetPicker(){if(targetPicker){targetPicker.remove();targetPicker=null;}}
function screenCandidates(px,py,reach=39){
 const units=match.perspective('blue').units.filter(u=>u.hp>0);
 return units.map(u=>({u,position:worldScreen(currentDrawPos(u).x,currentDrawPos(u).y)}))
  .map(t=>({...t,pixelDistance:Math.hypot(t.position.x-px,t.position.y-py)}))
  .filter(t=>t.pixelDistance<=reach)
  .sort((a,b)=>a.pixelDistance-b.pixelDistance||a.u.id.localeCompare(b.u.id));
}
function consumeChampionTarget(unit,pos){
 closeTargetPicker();
 if(action==='target_skill'&&targetedSkillSlot&&selected){
  const r=['Zed','KSante'].includes(selected.champ)&&targetedSkillSlot==='R'
    ?match.queueSpecialUltimate('blue',selected.id,unit.id)
    :match.queueTargetedSkill('blue',selected.id,targetedSkillSlot,unit.id);
  if(!r.ok){notify(r.reason);return;}
  notify(`${selected.champ}: ${targetedSkillSlot} em ${unit.champ} programada.`);
  targetedSkillSlot=null;targetMode=false;action='auto';stage.classList.remove('modeTarget');updateInspector();return;
 }
 if(unit.team==='blue'){
  if(action==='fight'&&selected?.id!==unit.id)return notify('Selecione um inimigo para lutar.');
  choose(match.units.find(v=>v.id===unit.id)||unit);hideTarget();return;
 }
 if(!selected||selected.hp<=0)return notify('Selecione primeiro um campeão aliado.');
 if(action==='fight'){
  showComboComposer(unit.id);return;
 }
 contextTarget({x:unit.x,y:unit.y},unit.id);
}
function openTargetPicker(candidates,px,py,{additive=false}={}){
 closeTargetPicker();
 const box=document.createElement('div');box.className='clusterTargetPicker';box.setAttribute('role','dialog');
 box.setAttribute('aria-label',additive?'Adicionar campeão aliado à seleção':'Escolher alvo entre campeões próximos');
 const heading=document.createElement('div');heading.className='clusterPickerHead';heading.textContent=additive?`SHIFT · SELECIONAR ALIADO · ${candidates.length}`:`ESCOLHER ALVO · ${candidates.length} CAMPEÕES`;
 const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Fechar escolha');close.onclick=closeTargetPicker;heading.append(close);box.append(heading);
 for(const {u} of candidates){
  const item=document.createElement('button');item.type='button';item.className='clusterTarget';
  const icon=document.createElement('img');icon.alt='';icon.src=officialPortrait(u.champ);whenPortraitFails(icon,u.champ);
  const title=document.createElement('span');title.innerHTML=`<b>${u.champ.replace(/[&<>"']/g,'')}</b><small>${u.team==='blue'?'ALIADO':'INIMIGO'} · ${u.role} · ${Math.round(u.hp/Math.max(1,u.maxHp)*100)}% HP${selected?' · '+Math.round(match.mapDistance(selected,u))+'u':''}</small>`;
  item.append(icon,title);item.onclick=()=>{if(additive){choose(match.units.find(v=>v.id===u.id),true);closeTargetPicker();notify(`${selectedUnitIds.size} campeão(s) na seleção.`);}else consumeChampionTarget(u,{x:u.x,y:u.y});};box.append(item);
 }
 stage.append(box);
 box.style.left=Math.round(clamp(px+12,8,Math.max(8,stage.clientWidth-box.offsetWidth-10)))+'px';
 box.style.top=Math.round(clamp(py+12,8,Math.max(8,stage.clientHeight-box.offsetHeight-16)))+'px';
 targetPicker=box;box.querySelector('.clusterTarget')?.focus();
}
let pointer=null;
const areaSelection=document.createElement('div');areaSelection.id='groupSelectRect';areaSelection.hidden=true;areaSelection.setAttribute('aria-hidden','true');
areaSelection.innerHTML='<span id="groupSelectHint">+ Selecionar aliados</span>';stage.append(areaSelection);
function drawSelectionRectangle(startX,startY,endX,endY){
 const rect=canvas.getBoundingClientRect(),left=Math.min(startX,endX)-rect.left,top=Math.min(startY,endY)-rect.top;
 areaSelection.style.left=Math.round(left)+'px';areaSelection.style.top=Math.round(top)+'px';areaSelection.style.width=Math.round(Math.abs(endX-startX))+'px';areaSelection.style.height=Math.round(Math.abs(endY-startY))+'px';
 areaSelection.hidden=false;
 const x1=Math.min(startX,endX)-rect.left,y1=Math.min(startY,endY)-rect.top,x2=Math.max(startX,endX)-rect.left,y2=Math.max(startY,endY)-rect.top;
 const count=match.units.filter(u=>u.team==='blue'&&u.hp>0).filter(u=>{const display=currentDrawPos(u),pos=worldScreen(display.x,display.y);return pos.x>=x1&&pos.x<=x2&&pos.y>=y1&&pos.y<=y2;}).length;
 $('groupSelectHint').textContent='+'+count+' aliados na área';
}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&targetPicker){closeTargetPicker();e.stopImmediatePropagation();return;}if(e.key==='Escape'&&riftPicker){closeRiftPicker();e.stopImmediatePropagation();}},true);
canvas.oncontextmenu=e=>e.preventDefault();
// Compact map-context picker; no free teleports: the authoritative engine checks
// range, cooldown, walkable destination and applies the jump to all nearby units.
let riftPicker=null,previewScryerAngleV452d4=null;
function closeRiftPicker(){riftPicker?.remove();riftPicker=null;previewScryerAngleV452d4=null;requestDraw();}
function openRiftPlantPicker(plant,clientX,clientY){
 closeRiftPicker();if(!selected)return;
 if(plant.kind==='scryer_bloom'||plant.kind==='firelight_bloom'||plant.kind==='blast_cone'){
  const actorId=selected.id,box=document.createElement('div');riftPicker=box;
  box.setAttribute('role','dialog');box.setAttribute('aria-label',plant.kind==='blast_cone'?'Fruta explosiva':'Florividente');
  box.className='scryerCompactPicker';
  Object.assign(box.style,{position:'fixed',left:Math.max(8,Math.min(clientX,innerWidth-248))+'px',top:Math.max(8,Math.min(clientY,innerHeight-280))+'px',zIndex:'9999'});
  box.innerHTML=`<div class="scryerCompactTitle">${plant.kind==='blast_cone'?'Fruta explosiva':'Florividente'}</div><div class="scryerCompactDialWrap"><div class="scryerCompactDial" id="scryerDial"><div class="scryerCompactRing"></div><div class="scryerCompactArrow" id="scryerArrow"></div><div class="scryerCompactDot"></div></div></div><output id="scryerAngleLabel" class="scryerCompactAngle">0°</output><div class="scryerCompactSliderRow"><span>Rotação</span><input id="scryerAngleSlider" type="range" min="0" max="359" step="1" value="0" aria-label="Rotação da Florividente"></div><button type="button" id="scryerConfirm" class="scryerCompactConfirm">Confirmar</button>`;
  document.body.append(box);
  const slider=box.querySelector('#scryerAngleSlider'),label=box.querySelector('#scryerAngleLabel'),arrow=box.querySelector('#scryerArrow'),dial=box.querySelector('#scryerDial');
  const applyAngle=deg=>{const wrapped=((Math.round(deg)%360)+360)%360;slider.value=String(wrapped);label.textContent=wrapped+'°';arrow.style.transform=`translate(-50%,-100%) rotate(${wrapped}deg)`;previewScryerAngleV452d4={x:plant.x,y:plant.y,heading:wrapped*Math.PI/180};requestDraw();};
  const pickAngleFromEvent=e=>{const rect=dial.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,dx=e.clientX-cx,dy=e.clientY-cy;if(!dx&&!dy)return;applyAngle(Math.atan2(dy,dx)*180/Math.PI);};
  slider.oninput=()=>applyAngle(Number(slider.value));
  let dragging=false;
  const stopDrag=()=>dragging=false;
  dial.addEventListener('pointerdown',e=>{dragging=true;dial.setPointerCapture(e.pointerId);pickAngleFromEvent(e);});
  dial.addEventListener('pointermove',e=>{if(dragging)pickAngleFromEvent(e);});
  dial.addEventListener('pointerup',e=>{stopDrag();if(dial.hasPointerCapture(e.pointerId))dial.releasePointerCapture(e.pointerId);});
  dial.addEventListener('pointercancel',stopDrag);
  box.querySelector('#scryerConfirm').onclick=()=>{const angle=Number(slider.value)*Math.PI/180;const r=match.requestRiftPlantV453Dev45('blue',actorId,plant.id,angle);closeRiftPicker();notify(r.ok?'Indo até a planta.':r.reason);fogCache=null;requestDraw();};
  applyAngle(0);return;
 }
 if(plant.kind!=='blast_cone'){
  const result=match.requestRiftPlantV453Dev45('blue',selected.id,plant.id,0);
  notify(result.ok?'Fruta utilizada.':result.reason);fogCache=null;requestDraw();return;
 }
 const box=document.createElement('div');riftPicker=box;box.setAttribute('role','dialog');box.setAttribute('aria-label','Direção da fruta de salto');
 Object.assign(box.style,{position:'fixed',left:Math.min(clientX,innerWidth-240)+'px',top:Math.min(clientY,innerHeight-170)+'px',zIndex:'9999',background:'#10181d',color:'#e5d4ae',border:'1px solid #ac8d49',borderRadius:'9px',padding:'9px',boxShadow:'0 6px 22px #000b'});
 const title=document.createElement('div');title.textContent='FRUTA EXPLOSIVA · ESCOLHA O LADO';title.style.cssText='font:bold 10px Arial;letter-spacing:.5px;margin-bottom:7px';box.append(title);
 const directions=document.createElement('div');directions.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:5px';box.append(directions);
 ['→','↘','↓','↙','←','↖','↑','↗'].forEach((symbol,i)=>{const b=document.createElement('button');b.type='button';b.textContent=symbol;
  b.style.cssText='border:1px solid #776a4b;background:#202b30;color:#e4d5a8;padding:6px 10px;border-radius:5px;cursor:pointer';
  b.onclick=()=>{const result=match.activateBlastConeV452d4('blue',selected.id,plant.id,i*Math.PI/4);closeRiftPicker();notify(result.ok?`Fruta ativada: ${result.affected.length} campeões lançados.`:result.reason);fogCache=null;requestDraw();updateInspector();};directions.append(b);});
 const cancel=document.createElement('button');cancel.textContent='Cancelar';cancel.style.cssText='margin-top:7px;color:#d6d6d6;background:none;border:0;cursor:pointer';cancel.onclick=closeRiftPicker;box.append(cancel);document.body.append(box);
}
canvas.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault();});
canvas.addEventListener('pointerdown',e=>{if(![0,1,2].includes(e.button))return;e.preventDefault();canvas.setPointerCapture(e.pointerId);pointer={x:e.clientX,y:e.clientY,endX:e.clientX,endY:e.clientY,px:camera.px,py:camera.py,angle:camera.angle,button:e.button,moved:false,shift:!!e.shiftKey};});
canvas.addEventListener('pointermove',e=>{
 if(!pointer){if(targetMode&&['ward','ult_direction','target_skill','kit_location'].includes(action)){const rect=canvas.getBoundingClientRect();hoverPos=screenWorld(e.clientX-rect.left,e.clientY-rect.top);requestDraw()}return;}
 let dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.hypot(dx,dy)>5)pointer.moved=true;if(!pointer.moved)return;
 if(pointer.button===0&&pointer.shift){pointer.endX=e.clientX;pointer.endY=e.clientY;drawSelectionRectangle(pointer.x,pointer.y,e.clientX,e.clientY);return;}
 if(pointer.button===2){camera.angle=pointer.angle+dx*.006;syncTilt();}else{camera.px=pointer.px+dx;camera.py=pointer.py+dy;requestDraw();}
});
canvas.addEventListener('pointerleave',()=>{hoverPos=null;requestDraw()});
canvas.addEventListener('pointercancel',()=>{pointer=null;areaSelection.hidden=true;hoverPos=null;requestDraw()});
canvas.addEventListener('pointerup',e=>{
 if(!pointer)return;
 const wasMoved=pointer.moved,button=pointer.button,shift=pointer.shift||e.shiftKey;
 const fromX=pointer.x,fromY=pointer.y;pointer=null;areaSelection.hidden=true;
 if(button!==0)return;
 if(shift&&wasMoved){
  const rect=canvas.getBoundingClientRect();
  const x1=Math.min(fromX,e.clientX)-rect.left,y1=Math.min(fromY,e.clientY)-rect.top;
  const x2=Math.max(fromX,e.clientX)-rect.left,y2=Math.max(fromY,e.clientY)-rect.top;
  const inside=match.units.filter(u=>u.team==='blue'&&u.hp>0).filter(u=>{
   const loc=worldScreen(currentDrawPos(u).x,currentDrawPos(u).y);
   return loc.x>=x1&&loc.x<=x2&&loc.y>=y1&&loc.y<=y2;
  });
  chooseArea(inside);return;
 }
 if(wasMoved)return;
 const rect=canvas.getBoundingClientRect(),pos=screenWorld(e.clientX-rect.left,e.clientY-rect.top);
 // Click on a *visible* hostile summoned Herald to order a real attack.
 // It does not cause damage directly and preserves attack range/CD/fog checks.
 if(!targetMode&&selected?.hp>0){
  const enemyHerald=(match.perspective('blue').team.heraldMercenaries||[]).filter(h=>h.team==='red'&&h.hp>0)
   .map(h=>({h,p:worldScreen(h.x,h.y)}))
   .sort((a,b)=>Math.hypot(a.p.x-(e.clientX-rect.left),a.p.y-(e.clientY-rect.top))-
                Math.hypot(b.p.x-(e.clientX-rect.left),b.p.y-(e.clientY-rect.top)))[0];
  if(enemyHerald&&Math.hypot(enemyHerald.p.x-(e.clientX-rect.left),enemyHerald.p.y-(e.clientY-rect.top))<=18){
   const r=match.orderAttackSummonedHeraldV452d4Dev21('blue',selected.id,enemyHerald.h.id);
   notify(r.ok?'Atacando Arauto inimigo. Ataque o olho pelas costas.':r.reason);
   requestDraw();return;
  }
 }
 if(action==='herald_deploy'&&targetMode){
  const dest=nearestWalkable(pos);
  if(!dest)return notify('Ponto de invocação não alcançável.');
  const r=match.orderHeraldSummonV452d4Dev20('blue',selected?.id,dest,heraldDeployLaneV452d4Dev20);
  notify(r.ok?'O portador caminhará até o local para soltar o Arauto.':r.reason);
  if(r.ok){action='auto';targetMode=false;stage.classList.remove('modeTarget');updateInspector();requestDraw();}
  return;
 }
 if((action==='flash'||action==='escape_skill')&&targetMode){
  // Flash/Ezreal are blinks: endpoint must be walkable, but path crossing
  // walls is legal. Do not apply normal route A* to the blink destination.
  let destination=match.walkable(pos.x,pos.y)?pos:null;
  if(!destination)for(let r=.002;r<.029&&!destination;r+=.003)for(let i=0;i<32;i++){
   const a=i*Math.PI/16,p={x:clamp(pos.x+r*Math.cos(a),0,1),y:clamp(pos.y+r*Math.sin(a),0,1)};
   if(match.walkable(p.x,p.y)){destination=p;break;}
  }
  if(!destination)return notify('Ponto de escape sem área caminhável.');
  const slot=action==='flash'?'flash':targetedSkillSlot;
  const result=match.castEscape('blue',selected.id,slot,destination);
  notify(result.ok?'Escape executado: '+selected.champ+'.':result.reason);
  if(result.ok){selected=match.units.find(u=>u.id===selected.id);action='auto';targetedSkillSlot=null;targetMode=false;stage.classList.remove('modeTarget');lastPopupKey=null;updateInspector();renderStatus();requestDraw();
   if(match.phase==='executing'&&match.executionRemaining>0&&!executionTimer)resumeRound();
  }else if(match.pendingDecision){$('targetPanel').hidden=false;}
  return;
 }
 if(action==='irelia_e_target'&&targetMode&&selected?.champ==='Irelia'){
  const active=match.ireliaBladesV453Dev43?.[selected.id];
  const result=active&&match.phase==='executing'
   ?match.castIreliaFlawlessDuetV453Dev43(selected,pos)
   :match.queueDirectionalSkill('blue',selected.id,'E',pos);
  notify(result.ok?(active?'Irelia E2: convergência preparada.':'Irelia E1: lâmina programada.'):result.reason);
  if(result.ok){action='auto';targetedSkillSlot=null;targetMode=false;stage.classList.remove('modeTarget');updateInspector();requestDraw();}
  return;
 }
 if(action==='kit_location'&&targetMode&&targetedSkillSlot){
  const slot=targetedSkillSlot;
  const out=match.queueKitSkillV42('blue',selected.id,slot,pos);
  notify(out.ok?selected.champ+' '+slot+': ação por mapa programada.':out.reason);
  if(out.ok){action='auto';targetedSkillSlot=null;targetMode=false;stage.classList.remove('modeTarget');updateInspector();requestDraw();}
  return;
 }
 if(action==='ult_direction'&&targetMode){
  const result=['Lux','Nami','Vex'].includes(selected.champ)?match.queueDirectionalSkill('blue',selected.id,'R',pos):match.queueSpecialUltimate('blue',selected.id,null,pos);
  notify(result.ok?selected.champ+': R global programado para a trajetória marcada.':result.reason);
  if(result.ok){action='auto';targetMode=false;stage.classList.remove('modeTarget');updateInspector();requestDraw();}
  return;
 }
 if(!targetMode&&selected&&selected.hp>0&&!shift){
  const nearby=[...match.riftAllFeaturesV452d4('plants'),...match.riftAllFeaturesV452d4('scryers')].filter(p=>(match.riftPlantTimersV452d4[p.id]||0)<=match.gameTime)
   .map(p=>({p,d:Math.hypot(worldScreen(p.x,p.y).x-(e.clientX-rect.left),worldScreen(p.x,p.y).y-(e.clientY-rect.top))}))
   .sort((a,b)=>a.d-b.d)[0];
  if(nearby&&nearby.d<=15){openRiftPlantPicker(nearby.p,e.clientX,e.clientY);return;}
  const gate=match.riftFeaturesV452d4('hexgates').map(p=>({p,d:Math.hypot(worldScreen(p.x,p.y).x-(e.clientX-rect.left),worldScreen(p.x,p.y).y-(e.clientY-rect.top))})).sort((a,b)=>a.d-b.d)[0];
  if(gate&&gate.d<=16){const r=match.beginHexgateV452d4('blue',selected.id,gate.p.id);notify(r.ok?'Portal iniciado: canalizando '+(r.until-match.gameTime)+'s simulados.':r.reason);return;}
 }
 const candidates=screenCandidates(e.clientX-rect.left,e.clientY-rect.top);
 if(shift){const allies=candidates.filter(t=>t.u.team==='blue'&&t.pixelDistance<=26);if(allies.length>1){openTargetPicker(allies,e.clientX-rect.left,e.clientY-rect.top,{additive:true});return;}const ally=allies[0];if(ally){choose(match.units.find(u=>u.id===ally.u.id),true);notify(`${selectedUnitIds.size} campeão(s) na seleção.`);}return;}
 if(candidates.length>1){openTargetPicker(candidates,e.clientX-rect.left,e.clientY-rect.top);return;}
 if(candidates.length===1&&(action==='target_skill'||!targetMode||action==='fight')){consumeChampionTarget(candidates[0].u,pos);return;}
 if(action==='target_skill'&&targetedSkillSlot&&selected){
  const characters=match.units.filter(u=>u.hp>0&&(u.team==='blue'||match.visible('blue',u)));
  const target=characters.map(u=>({u,screen:worldScreen(u.x,u.y)})).sort((a,b)=>Math.hypot(a.screen.x-(e.clientX-rect.left),a.screen.y-(e.clientY-rect.top))-Math.hypot(b.screen.x-(e.clientX-rect.left),b.screen.y-(e.clientY-rect.top)))[0];
  if(!target||Math.hypot(target.screen.x-(e.clientX-rect.left),target.screen.y-(e.clientY-rect.top))>25)return notify('Clique no retrato de um campeão visível.');
  const r=['Zed','KSante'].includes(selected.champ)&&targetedSkillSlot==='R'?match.queueSpecialUltimate('blue',selected.id,target.u.id):match.queueTargetedSkill('blue',selected.id,targetedSkillSlot,target.u.id);
  if(!r.ok)return notify(r.reason);
  notify(selected.champ+': '+targetedSkillSlot+' direcionada para '+target.u.champ+'. Será executada na rodada.');
  targetedSkillSlot=null;targetMode=false;action='auto';stage.classList.remove('modeTarget');updateInspector();return;
 }
 const friendly=match.units.filter(u=>u.team==='blue'&&u.hp>0).sort((a,b)=>dist(worldScreen(a.x,a.y),{x:e.clientX-rect.left,y:e.clientY-rect.top})-dist(worldScreen(b.x,b.y),{x:e.clientX-rect.left,y:e.clientY-rect.top}))[0];
 if(friendly&&dist(worldScreen(friendly.x,friendly.y),{x:e.clientX-rect.left,y:e.clientY-rect.top})<23){choose(friendly);hideTarget();return;}
 if(!selected||selected.hp<=0){notify('Selecione um campeão aliado vivo.');return;}
 if(drawRoute&&action==='route'){
  const snapped=nearestWalkable(pos,waypoints.length?waypoints[waypoints.length-1].point:selected);if(!snapped)return notify('Não há posição alcançável perto do clique.');
  if(dist(snapped,pos)>.0001)notify('Ponto ajustado para a área caminhável mais próxima.');
  waypoints.push({point:snapped,action:$('newStepAction')?.value||'move',duration:Number($('newStepDuration')?.value)||0});
  routeDrafts[selected.id]=waypoints;renderRouteEditor();$('boardHint').textContent=waypoints.length+' etapa(s) · configure as ações e finalize a rota';requestDraw();return;
 }
 if(action==='ward'&&targetMode){const wardDestination=nearestWalkable(pos);if(!wardDestination)return notify('Sentinela sem ponto caminhável alcançável');if(applyOrder({kind:'ward',wardType:selectedWardType,destination:wardDestination})){
  action='auto';targetMode=false;hoverPos=null;stage.classList.remove('modeTarget');
  $('boardHint').textContent='Sentinela marcada no local escolhido. '+selected.champ+' irá colocá-la quando estiver ao alcance.';
  notify('Ponto de ward marcado no mapa.');
 }return;}
 if(contextTarget(pos))return;
 const destination=nearestWalkable(pos);
 if(!destination)return notify('Destino inalcançável: não foi encontrado ponto navegável próximo.');
 if(dist(destination,pos)>.0001)notify('Destino ajustado para o ponto caminhável mais próximo.');
 if((selectedUnitIds.size>1?applyGroupMove(destination):applyOrder({kind:'move',destination,spell}))){
  action='auto';targetMode=false;drawRoute=false;stage.classList.remove('modeTarget');
  $('boardHint').textContent=`${selected.champ}: destino persistente marcado. Continue planejando os outros campeões.`;
 }
});
canvas.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey)return;const factor=Math.exp(-Math.sign(e.deltaY)*Math.min(Math.abs(e.deltaY),150)*.00165);camera.zoom=clamp(camera.zoom*factor,.70,3);requestDraw();},{passive:false});
$('undoWaypoint').onclick=()=>{waypoints.pop();routeDrafts[selected?.id]=waypoints;renderRouteEditor();requestDraw()};$('cancelRoute').onclick=()=>{drawRoute=false;targetMode=false;waypoints=[];routeDrafts[selected.id]=[];stage.classList.remove('modeTarget');updateInspector();requestDraw()};
$('finishRoute').onclick=()=>{if(!waypoints.length){notify('Adicione pontos à rota.');return}if(selected){const r=match.setPlan('blue',selected.id,waypoints,$('policySelect')?.value||'balanced');if(!r.ok){notify(r.reason);return}targetMode=false;drawRoute=false;waypoints=[];routeDrafts[selected.id]=[];stage.classList.remove('modeTarget');updateInspector();renderStatus();requestDraw();notify('Rota persistente salva para '+selected.champ+'. Continue planejando os outros campeões.');}};
$('viewReset').onclick=()=>{camera={zoom:1,px:0,py:0,angle:0,tilt:.55};syncTilt()};
$('viewTilt').onclick=()=>{camera.tilt=camera.tilt?0:.55;syncTilt()};
$('viewTiltRange').oninput=e=>{camera.tilt=clamp(Number(e.target.value)/100,0,.55);syncTilt()};
window.addEventListener('keydown',e=>{
 const tag=document.activeElement?.tagName;
 if(!$('smiteContestOverlay').hidden){
  if(!e.repeat&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()===smiteKeyV452d4Dev9()){
   e.preventDefault();answerSmiteContestV452d4Dev9('cast');
  }else if(e.key==='Escape')e.preventDefault();
  return;
 }
 // Ignore Tab only while typing inside form fields; otherwise it toggles the match scoreboard.
 if(e.key==='Tab'&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!['INPUT','TEXTAREA','SELECT'].includes(tag)&&!document.activeElement?.isContentEditable){e.preventDefault();if(!e.repeat)setScoreboardOpen(!scoreboardOpen);return;}
 if(scoreboardOpen){if(e.key==='Escape'){e.preventDefault();setScoreboardOpen(false);}return;}
 if(endgameIntroOpen&&e.key==='Escape'){e.preventDefault();return;}
 if(resultOverlayOpen&&e.key==='Escape'){e.preventDefault();setResultOverlayOpen(false);return;}
 if(e.ctrlKey&&!e.altKey&&!e.metaKey&&['q','w','e','r'].includes(e.key.toLowerCase())&&selected&&!['INPUT','TEXTAREA','SELECT'].includes(tag)){e.preventDefault();const up=match.upgradeSkill('blue',selected.id,e.key.toUpperCase());if(!up.ok)notify(up.reason);updateInspector();return;}
 if(['INPUT','TEXTAREA','SELECT'].includes(tag)||document.activeElement?.isContentEditable||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;
 if(e.key==='Escape'){$('shopModal').hidden=true;targetedSkillSlot=null;hideTarget();if(selected&&targetMode){action='auto';targetMode=false;drawRoute=false;hoverPos=null;stage.classList.remove('modeTarget');updateInspector();requestDraw()}return;}
 if(!$('shopModal').hidden)return;
 if(pendingFightTargetId&&['q','w','e','r'].includes(e.key.toLowerCase())){e.preventDefault();if(comboSlots.length<8){comboSlots.push(e.key.toUpperCase());combatStyle='combo';updateInspector();}return;}
 if(pendingFightTargetId&&e.key==='Enter'){e.preventDefault();$('comboSubmit').click();return;}
 if(e.key.toLowerCase()==='p'){e.preventDefault();$('viewTilt').click();return;}
 if(!selected)return;
 const key=e.key.toLowerCase(),shortcuts={b:'recall','4':'ward',m:'move',r:'route',f:'flash',s:'stop',a:'fight',d:'defend'};
 if(shortcuts[key]){e.preventDefault();mode(shortcuts[key]);}
});
syncTilt();
$('draftOpen').onclick=()=>location.href='draft.html';
$('save').onclick=()=>{const keys=['round','gameTime','roundHistory','lastResolvedSeconds','lastTacticalAlerts','duelRequests','events','teams','units','minions','wards','nextId','waveIndex','nextWave','structures','camps','ended','winner','encounterCooldowns','phase','pendingDecision','executionRemaining','executionStart','delayedEffects','campKnowledge','orderHistory','missiles','specialCastHistory','objectiveLedgerV44','teamfightLedgerV44'];let state={seed:match.seed,roundSeconds:match.roundSeconds,decisionSeconds:match.decisionSeconds,speedFactor,worldBounds:match.worldBounds,draft,snapshot:match.snapshotV40(),game:{}};for(const k of keys)state.game[k]=match[k];const saved=storage.set('coachlol_v08_save',JSON.stringify(state));notify(saved?'Partida salva neste dispositivo.':'Armazenamento indisponível neste navegador.')};
$('load').onclick=()=>{try{let state=JSON.parse(storage.get('coachlol_v08_save'));if(!state){notify('Nenhum salvamento local encontrado.');return}match=state.snapshot?.schema==='coachlol.snapshot.v4'
 ?Arena.fromSnapshotV40(window.MAP_DATA,window.MASK_DATA,state.snapshot)
 :new Arena(window.MAP_DATA,window.MASK_DATA,state);
 match.manualBlueHeraldPickupV452d4Dev20=true;
 const defaultCampsV44=match.camps;
 if(!state.snapshot)Object.assign(match,state.game);
 for(const c of defaultCampsV44.filter(c=>['herald','voidgrubs'].includes(c.timerKey)))
  if(!match.camps.some(v=>v.id===c.id))match.camps.push({...c,exhaustedV44:match.gameTime>=window.CoachArena.OBJECTIVE_PHASES_V44[c.timerKey].leave});
 match.objectiveLedgerV44??=[];match.teamfightLedgerV44??=[];
 for(const team of ['blue','red']){match.teams[team].voidgrubs??=0;match.teams[team].heralds??=0;}
 speedFactor=[1,2].includes(state.speedFactor)?state.speedFactor:1;$('matchSpeed').value=String(speedFactor);match.liveWindow=null;selected=null;selectedUnitIds=new Set();comboDrafts.clear();fogCache=null;livePose.clear();routeDrafts={};resetEndgameState();hideSmiteContestV452d4Dev9();secondsLeft=match.decisionSeconds;planningStartedAt=performance.now();$('decisionLimit').value=String(match.decisionSeconds);updateInspector();renderStatus();requestDraw();if(match.phase==='executing'&&match.executionRemaining)resumeRound();else if(match.phase==='decision'&&match.pendingDecision)tacticalReview();notify('Partida restaurada.')}catch(e){notify('Erro ao carregar: '+e.message)}};
function openShop(filter='all'){if(!selected)choose(match.units.find(u=>u.team==='blue'&&u.role==='ADC'));shopSelection=null;shopRecipeRoot=null;$('shopModal').hidden=false;renderShop(filter);}
$('shopOpen').onclick=()=>openShop('all');
$('openingShopOpen').onclick=()=>openShop('all');
$('shopClose').onclick=()=>$('shopModal').hidden=true;
$('shopStay').onclick=()=>$('shopModal').hidden=true;
$('shopLeaveBase').onclick=()=>{
 if(!selected)return;
 const u=selected;
 if(!match.leaveShop('blue',u.id)){notify('Saída manual disponível após recall ou renascimento.');return;}
 $('shopModal').hidden=true;updateInspector();notify(u.champ+' saiu da loja por sua decisão.');
};
let shopFilter='recommended',shopSelection=null,shopRecipeRoot=null,shopTierV453Dev48='all',selectedInventoryV453Dev48=-1;
const normShop=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const itemImageIds={blasting_wand:1026,oblivion_orb:3916,executioners_calling:3123,sorcerers_shoes:3020,mercurys_treads:3111,void_staff:3135,last_whisper:3035,trinket_stealth:3340,trinket_oracle:3364,trinket_farsight:3363,dorans_blade:1055,dorans_ring:1056,dorans_shield:1054,support_atlas:3865,jungle_gustwalker:1102,jungle_mosstomper:1103,jungle_scorchclaw:1101,boots:1001,long_sword:1036,amp_tome:1052,ruby_crystal:1028,cloth_armor:1029,sapphire_crystal:1027,null_magic_mantle:1033,bf_sword:1038,rabadon:3089,needless_rod:1058,giants_belt:1011,serrated_dirk:3134,recurve_bow:1043,ward:2055};
const shopLocalIdsV453Dev45=new Set(["agility_cloak", "amp_tome", "berserkers_greaves", "bf_sword", "black_cleaver", "blasting_wand", "blighting_jewel", "boots", "bramble_vest", "caulfields_warhammer", "chain_vest", "cloth_armor", "dagger", "dorans_blade", "dorans_ring", "dorans_shield", "executioners_calling", "fiendish_codex", "giants_belt", "glowing_mote", "health_potion", "hearthbound_axe", "infinity_edge", "ionian_boots", "jungle_gustwalker", "jungle_mosstomper", "jungle_scorchclaw", "kindlegem", "kraken_slayer", "last_whisper", "long_sword", "mercurys_treads", "morellonomicon", "mortal_reminder", "nashors_tooth", "navori_flickerblade", "needless_rod", "negatron_cloak", "null_magic_mantle", "oblivion_orb", "phage", "pickaxe", "rabadon", "randuins_omen", "rapid_firecannon", "rectrix", "recurve_bow", "refillable_potion", "ruby_crystal", "rylais_crystal_scepter", "sapphire_crystal", "scouts_slingshot", "seekers_armguard", "serrated_dirk", "sheen", "sorcerers_shoes", "support_atlas", "support_bounty", "support_compass", "thornmail", "trinity_force", "trinket_oracle", "trinket_stealth", "vampiric_scepter", "void_staff", "ward", "wardens_mail", "youmuus_ghostblade", "zeal", "zhonyas_hourglass"]);
const shopFallbackSrcV453Dev45=item=>item.officialRefV453Dev48?'assets/ui/items/item_indisponivel_dev48.svg':shopLocalIdsV453Dev45.has(item.id)?'assets/ui/items/'+item.id+'.svg':shopFallbackAsset(item);
const shopFallbackAsset=item=>{
 const code=String(item?.name||'IT').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase().replace(/[^A-ZÀ-Ú]/g,'I');
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="3" fill="#111d23"/><path d="M2 62 L62 2" stroke="#a68b50" opacity=".35"/><rect x="3" y="3" width="58" height="58" rx="2" fill="none" stroke="#806737"/><text x="32" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="23" fill="#e6d4a6">${code}</text></svg>`);
};
const shopIcons={starter:'✦',damage:'⚔',defense:'⬡',utility:'✧',tank:'⛨',fighter:'⚒',mage:'✷',marksman:'➹',support:'✚'};
for(const tab of document.querySelectorAll('#shopTabs button[data-filter]')){
 if(shopIcons[tab.dataset.filter]){const name=tab.textContent;tab.title=name;tab.setAttribute('aria-label',name);tab.textContent=shopIcons[tab.dataset.filter];tab.classList.add('shopIconTabV453Dev45');}
}
// DEV49: cache OFFLINE é permitido somente quando o PNG original veio do Data Dragon 16.21.1.
// Sem arte da Wiki nem arquivo de versão de outro patch.
const riotCachedItemsV453Dev49=new Set(window.COACHLOL_ITEM_ICON_CACHE_DEV49?.ids||[]);
function riotItemAssetV453Dev49(id){const k=String(id);
 return riotCachedItemsV453Dev49.has(k)?`assets/riot/items_16_21_1/${k}.png`:
  `https://ddragon.leagueoflegends.com/cdn/16.21.1/img/item/${encodeURIComponent(k)}.png`;
}
const shopAsset=item=>{const id=itemImageIds[item.id]||item.riotId;
 return id?riotItemAssetV453Dev49(id):null;};
// Patch-pinned Riot Data Dragon reference: view-only records cannot be purchased
// until the item gameplay effect is independently implemented and certified.
const officialItemsV453Dev48=window.COACHLOL_OFFICIAL_CATALOG?.items||{};
// DEV49: apenas a loja NORMAL de Summoner's Rift do patch 26.21, nunca ARAM/TFT/itens antigos.
const srShopRowsV453Dev49=window.COACHLOL_SR_SHOP_DEV49?.rows||{};
const officialCatalogExtrasV453Dev48=Object.values(srShopRowsV453Dev49)
 .filter(row=>row.status==='reference_only'&&!['conditional','exclusive'].includes(row.tier)&&officialItemsV453Dev48[row.id])
 .map(row=>{const ref=officialItemsV453Dev48[row.id];return {id:'official_'+row.id,riotId:row.id,
  name:row.name,cost:row.price,icon:'',stats:{},tags:['reference',...row.tags],notPurchasable:true,
  officialRefV453Dev48:ref,officialTierV453Dev49:row.tier};});
const officialReferenceIndexV453Dev48=new Map(officialCatalogExtrasV453Dev48.map(item=>[item.id,item]));
// Every node in the recipe tree is a real action surface, not an image.
// Clicking a component selects it; its own purchase button purchases it without
// losing the opened parent recipe (e.g. Rabadon -> Needless Large Rod).
function shopRecipeIcon(id,{owned=false,root=false}={}){
 const item=catalog.find(i=>i.id===id),node=document.createElement('div');node.className='shopRecipePart'+(owned?' owned':'')+(root?' recipeRoot':'');
 if(!item)return node;
 const selectBtn=document.createElement('button');selectBtn.type='button';selectBtn.className='shopRecipeSelect';selectBtn.setAttribute('aria-label','Ver '+item.name+' na receita');
 const im=document.createElement('img');im.src=shopAsset(item)||'assets/ui/items/'+id+'.svg';im.alt='';im.onerror=()=>{im.onerror=null;im.src=shopFallbackSrcV453Dev45(item)};
 const name=document.createElement('small');name.textContent=item.cost+'g';selectBtn.title=item.name;selectBtn.append(im,name);
 selectBtn.onclick=()=>{shopSelection=id;renderShop(shopFilter);};node.append(selectBtn);
 if(!root&&!item.notPurchasable){
  const buyBtn=document.createElement('button');buyBtn.type='button';buyBtn.className='shopRecipeQuickBuy';
  const can=selected?match.canBuy('blue',selected.id,id):{ok:false};
  buyBtn.textContent=can.ok?'COMPRAR':'PROGRAMAR';
  buyBtn.setAttribute('aria-label',(can.ok?'Comprar ':'Programar compra de ')+item.name+' pela receita');
  buyBtn.disabled=!selected||!['preparation','planning'].includes(match.phase)||match.teams.blue.ready;
  buyBtn.onclick=()=>{
   const result=match.purchaseOrPlan('blue',selected.id,id);
   if(result.ok){notify(item.name+(result.bought?' comprado pela receita.':' programado pela receita.'));updateInspector();renderStatus();renderShop(shopFilter);}
   else notify(result.reason||'Compra indisponível.');
  };
  node.append(buyBtn);
 }
 return node;
}
function shopRecipeBranch(itemId,inventory,root=false,depth=0,ancestors=[]){
 const row=document.createElement('div');row.className='shopRecipeBranch';
 if(ancestors.includes(itemId)||depth>8)return row;
 const i=inventory.indexOf(itemId);const owned=!root&&i>=0;
 if(owned)inventory.splice(i,1);
 row.append(shopRecipeIcon(itemId,{owned,root}));
 if(!owned){
  const children=match.itemRecipe(itemId);
  if(children.length){const sub=document.createElement('div');sub.className='recipeComponents';for(const child of children)sub.append(shopRecipeBranch(child,inventory,false,depth+1,[...ancestors,itemId]));row.append(sub);}
 }
 return row;
}
// DEV49: árvore de receita COMPLETA derivada de Data Dragon fixo, somente leitura.
// Ícone/preço na árvore; descrição completa apenas na coluna direita.
function officialRecipeBranchV453Dev49(id,seen=new Set(),depth=0){
 const row=document.createElement('div');row.className='shopRecipeBranch officialSrRecipeV453Dev49';
 const item=srShopRowsV453Dev49[id];if(!item||seen.has(id)||depth>8)return row;
 const part=document.createElement('div');part.className='shopRecipePart';
 const node=document.createElement('button');node.type='button';node.className='shopRecipeSelect';
 node.title=item.name;node.setAttribute('aria-label',item.name+' · '+item.price+' ouro');
 const im=document.createElement('img');im.alt='';im.loading='lazy';im.src=riotImageSrcV453Dev49(id);
 im.onerror=()=>{im.onerror=null;im.src='assets/ui/items/item_indisponivel_dev48.svg'};
 const gold=document.createElement('small');gold.textContent=item.price+'g';node.append(im,gold);
 node.onclick=()=>{const local=catalog.find(x=>String(x.riotId||itemImageIds[x.id]||'')===id);
  shopSelection=local?local.id:'official_'+id;renderShop(shopFilter);};
 part.append(node);row.append(part);
 if(item.from?.length){const children=document.createElement('div');children.className='recipeComponents';
  for(const child of item.from)children.append(officialRecipeBranchV453Dev49(child,new Set([...seen,id]),depth+1));
  row.append(children);}
 return row;
}
function riotImageSrcV453Dev49(id){
 return riotItemAssetV453Dev49(id);
}
function fitRecipeTreeV453Dev48(){
 const tree=$('shopRecipeTree'),branch=tree?.querySelector(':scope > .shopRecipeBranch');if(!tree||!branch)return;
 branch.style.zoom='1';
 const available=Math.max(1,tree.clientWidth-14),natural=branch.scrollWidth;
 if(!natural)return;
 branch.style.zoom=String(Math.min(1,available/natural));
 tree.dataset.fitted=String(natural<=available?'native':'scaled');
}
function renderShop(filter){
 shopFilter=filter;const u=selected;if(!u)return;
 if(shopSelection&&!catalog.some(i=>i.id===shopSelection)&&!officialReferenceIndexV453Dev48.has(shopSelection))shopSelection=null;
 const suggested=u.champ==='Fiddlesticks'?[...recommendedItems(u)]:[...recommendedItems(u),'trinket_stealth','trinket_oracle','trinket_farsight'];
 document.querySelectorAll('#shopTabs button').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));
 let items=filter==='all'?catalog.filter(x=>!x.notPurchasable&&(!x.roleLock||x.roleLock===u.role)):filter==='starter'?catalog.filter(x=>x.tags.includes('starter')&&(u.role==='JG'?x.roleLock==='JG':u.role==='SUP'?x.roleLock==='SUP':!x.roleLock)):filter==='damage'?catalog.filter(x=>!x.notPurchasable&&(x.stats.ad||x.stats.ap||x.stats.atkSpeed||x.stats.attackSpeedPct||x.stats.critChance)&&(!x.roleLock||x.roleLock===u.role)):filter==='defense'?catalog.filter(x=>!x.notPurchasable&&(x.stats.hp||x.stats.armor||x.stats.mr)&&(!x.roleLock||x.roleLock===u.role)):filter==='utility'?catalog.filter(x=>!x.notPurchasable&&(x.tags.includes('move')||x.tags.includes('vision')||x.roleLock)&&(!x.roleLock||x.roleLock===u.role)):catalog.filter(x=>suggested.includes(x.id));
 if(['tank','fighter','mage','marksman','support'].includes(filter))items=catalog.filter(x=>!x.notPurchasable&&(!x.roleLock||x.roleLock===u.role)&&x.tags.includes(filter));
 // Show the rest of the actual Summoner's Rift catalog as REFERENCES only.
 // No placeholder purchase action can mutate a player's gold or inventory.
 if(filter==='all')items=[...items,...officialCatalogExtrasV453Dev48];
 if(['damage','defense','utility','fighter','mage','marksman','support','tank','starter'].includes(filter)){
  const matchTag=ref=>{
   const text=ref.tags.map(normShop).join(' ');
   return filter==='damage'?/(attack|critical|spell|damage|armorpenetration)/.test(text):
    filter==='defense'||filter==='tank'?/(health|armor|spellblock|mana|resist)/.test(text):
    filter==='utility'||filter==='support'?/(support|vision|abilityhaste|cooldown|trinket)/.test(text):
    filter==='marksman'?/(attackspeed|critical|attackdamage)/.test(text):
    filter==='mage'?/(spelldamage|magic|mana)/.test(text):
    filter==='fighter'?/(attackdamage|health|armor)/.test(text):
    filter==='starter'?/(lane|consumable)/.test(text):false;
  };
  items=[...items,...officialCatalogExtrasV453Dev48.filter(i=>matchTag(i.officialRefV453Dev48))];
 }
 const selectedTierV453Dev48=item=>{
  if(shopTierV453Dev48==='all')return true;
  const tier=item.officialTierV453Dev49|| (item.tags.includes('legendary')?'legendary':
   item.tags.includes('epic')?'epic':item.tags.includes('starter')?'starter':'basic');
  return tier===shopTierV453Dev48;
 };
 items=items.filter(selectedTierV453Dev48);
 document.querySelectorAll('#shopTierFiltersV453Dev48 button').forEach(b=>b.classList.toggle('active',b.dataset.tier===shopTierV453Dev48));
 const search=normShop($('shopSearch')?.value||'');if(search)items=items.filter(x=>normShop(x.name+' '+x.id+' '+Object.keys(x.stats).join(' ')).includes(search));
 if(filter==='recommended')items.sort((a,b)=>suggested.indexOf(a.id)-suggested.indexOf(b.id));
 if(filter==='all'){
  const tier=item=>({legendary:0,epic:1,starter:2,basic:3})[item.officialTierV453Dev49|| (item.tags.includes('legendary')?'legendary':item.tags.includes('epic')?'epic':item.tags.includes('starter')?'starter':'basic')]??3;
  items.sort((a,b)=>tier(a)-tier(b)||a.cost-b.cost||a.name.localeCompare(b.name));
 }

 $('itemGrid').innerHTML='';
 if(filter==='recommended'){
  const title=document.createElement('div');title.className='shopRoleBanner';title.textContent='SUGESTÕES';
  $('itemGrid').append(title);
 }
 let lastTier=-1;
 for(const item of items){
  if(filter==='all'){
   const tier=({legendary:0,epic:1,starter:2,basic:3})[item.officialTierV453Dev49|| (item.tags.includes('legendary')?'legendary':item.tags.includes('epic')?'epic':item.tags.includes('starter')?'starter':'basic')]??3;
   if(tier!==lastTier){const heading=document.createElement('div');heading.className='shopRoleBanner';heading.textContent=['LENDÁRIOS','ÉPICOS','INICIAIS','BÁSICOS / UTILIDADE'][tier];$('itemGrid').append(heading);lastTier=tier;}
  }
  const check=match.canBuy('blue',u.id,item.id),btn=document.createElement('button');btn.className='itemBtn'+(shopSelection===item.id?' is-selected':'');
  const editable=['preparation','planning'].includes(match.phase)&&!match.teams.blue.ready&&!match.pendingDecision;
  btn.disabled=!editable||item.notPurchasable||!!(item.roleLock&&item.roleLock!==u.role);
  btn.title=check.ok?'Comprar agora':'Programar compra para a próxima volta à fonte';
  const roleMark=item.roleLock?' · '+item.roleLock:'';
  btn.disabled=false;btn.title=item.name+' · '+item.cost+' ouro'+(item.officialRefV453Dev48?' · consulta, indisponível':'');btn.setAttribute('aria-label',item.name+' · '+item.cost+' ouro');
  btn.dataset.itemId=item.id;btn.classList.toggle('unavailable',!editable||!!item.notPurchasable);
  btn.innerHTML=`<span class="itemIcon"><span class="itemEmoji">${escapeHTML(item.icon)}</span><img loading="lazy" src="${shopAsset(item)||shopFallbackAsset(item)}" alt=""/></span><em>${item.cost}</em>`;
  btn.querySelector('img').onerror=ev=>{ev.currentTarget.onerror=null;ev.currentTarget.src=shopFallbackSrcV453Dev45(item)};
  btn.onclick=()=>{shopRecipeRoot=item.id;shopSelection=item.id;renderShop(shopFilter);};$('itemGrid').append(btn);
 }
 const roster=$('shopChampionPicker');roster.replaceChildren();
 for(const champ of match.units.filter(v=>v.team==='blue')){const b=document.createElement('button');b.type='button';b.className='shopChampChoice'+(champ.id===u.id?' active':'');b.innerHTML=`<span class="shopChampIcon"><img src="${officialPortrait(champ.champ)}" onerror="this.onerror=()=>{this.onerror=null;this.src='assets/portraits/${escapeHTML(champ.champ)}.svg'};this.src='assets/portraits/${escapeHTML(champ.champ)}.webp'" alt=""></span><span><b>${escapeHTML(champ.champ)}</b><small>${champ.role} · ${Math.floor(champ.gold)} ouro</small></span><span class="shopChampQueue">${(champ.purchaseQueue||[]).length||''}</span>`;b.onclick=()=>{choose(champ);shopSelection=null;shopRecipeRoot=null;renderShop(shopFilter);};roster.append(b);}
 const queue=$('shopQueue');queue.replaceChildren();
 for(const [i,id] of (u.purchaseQueue||[]).entries()){const item=catalog.find(x=>x.id===id);if(!item)continue;const b=document.createElement('button');b.type='button';b.className='shopQueueItem';b.title='Cancelar item programado';b.textContent=`${item.icon} ${item.name} · ${item.cost} ouro ×`;b.onclick=()=>{match.cancelQueuedPurchase('blue',u.id,i);renderShop(shopFilter)};queue.append(b);}
 if(!(u.purchaseQueue||[]).length)queue.textContent='Sem itens programados';
 const chosen=catalog.find(i=>i.id===shopSelection),officialChosen=officialReferenceIndexV453Dev48.get(shopSelection);
 const inspect=$('shopItemInspect'),recipe=$('shopRecipeTree'),buy=$('shopPurchase');
 if(chosen){
  inspect.querySelector('.shopItemTitle').textContent=chosen.name+' · '+chosen.cost+' ouro';
  recipe.replaceChildren();
  const recipeOrigin=catalog.find(i=>i.id===shopRecipeRoot)||chosen;
  // The inspected component may differ from the recipe root. Keep the parent
  // tree visible while buying a part directly from it.
  // Melhoria da base: mostrar os itens que usam o selecionado acima da arvore.
  const upgrades=catalog.filter(i=>i.id!==recipeOrigin.id&&!i.notPurchasable&&match.itemRecipe(i.id).includes(recipeOrigin.id)).slice(0,12);
  if(upgrades.length){const shelf=document.createElement('div');shelf.className='shopUpgradesV453Dev45';
   for(const upgrade of upgrades){const b=document.createElement('button');b.type='button';b.title=upgrade.name;b.setAttribute('aria-label','Ver melhoria '+upgrade.name);
    const im=document.createElement('img');im.src=shopAsset(upgrade)||shopFallbackAsset(upgrade);im.onerror=()=>{im.onerror=null;im.src=shopFallbackSrcV453Dev45(upgrade)};
    const cost=document.createElement('small');cost.textContent=upgrade.cost+'g';b.append(im,cost);b.onclick=()=>{shopRecipeRoot=upgrade.id;shopSelection=upgrade.id;renderShop(shopFilter);};shelf.append(b);}
   recipe.append(shelf);
  }
  recipe.append(shopRecipeBranch(recipeOrigin.id,[...u.items],true));requestAnimationFrame(fitRecipeTreeV453Dev48);
  const components=match.itemRecipe(chosen.id);
  if(recipeOrigin.id!==chosen.id){const back=document.createElement('button');back.type='button';back.className='shopRecipeBack';back.textContent='← Voltar para '+recipeOrigin.name;back.onclick=()=>{shopSelection=recipeOrigin.id;renderShop(shopFilter)};recipe.prepend(back);}
  $('shopItemDescription').textContent=(Object.entries(chosen.stats).map(([k,v])=>'+'+v+' '+k).join(' · ')||'Equipamento')+(ITEM_EFFECTS_V43[chosen.id]?' · '+ITEM_EFFECTS_V43[chosen.id].kind:'')+' · Restante: '+match.itemPurchaseCost(u,chosen.id)+' ouro';
  buy.disabled=chosen.notPurchasable||!['preparation','planning'].includes(match.phase)||match.teams.blue.ready;
  if(chosen.tags.includes('trinket')){buy.textContent='TROCAR TRINKET · GRÁTIS';$('shopItemDescription').textContent='Exclusivo: '+(chosen.id==='trinket_oracle'?'varredura acompanha o campeão por uma rodada':chosen.id==='trinket_farsight'?'sentinela azul de visão remota':'colocação de ward amarela')+' · Troca apenas na fonte · recarga preservada.';}
  else buy.textContent=match.canBuy('blue',u.id,chosen.id).ok?'COMPRAR · '+match.itemPurchaseCost(u,chosen.id)+' OURO':'PROGRAMAR COMPRA ↗';
 }else if(officialChosen){
  const ref=officialChosen.officialRefV453Dev48;
  recipe.replaceChildren();inspect.querySelector('.shopItemTitle').textContent=officialChosen.name+' · '+ref.cost+' ouro';
  // Melhoria selecionada: ramificações ascendentes (into) no alto, ingredientes abaixo.
  const sr=srShopRowsV453Dev49[ref.id];
  if(sr?.into?.length){const upgrades=document.createElement('div');upgrades.className='shopUpgradesV453Dev45';
   for(const next of sr.into.filter(x=>srShopRowsV453Dev49[x]&&!['exclusive','conditional'].includes(srShopRowsV453Dev49[x].tier)).slice(0,12)){
    const upgraded=srShopRowsV453Dev49[next],button=document.createElement('button');button.type='button';button.title=upgraded.name;
    const img=document.createElement('img');img.src=riotImageSrcV453Dev49(next);img.onerror=()=>{img.onerror=null;img.src='assets/ui/items/item_indisponivel_dev48.svg'};
    const price=document.createElement('small');price.textContent=upgraded.price+'g';button.append(img,price);
    button.onclick=()=>{const local=catalog.find(x=>String(x.riotId||itemImageIds[x.id]||'')===next);shopSelection=local?local.id:'official_'+next;renderShop(shopFilter);};upgrades.append(button);
   }recipe.append(upgrades);
  }
  recipe.append(officialRecipeBranchV453Dev49(ref.id));requestAnimationFrame(fitRecipeTreeV453Dev48);
  $('shopItemDescription').textContent=(ref.descriptionPt||ref.description||'')+' · Mecânica não certificada nesta versão.';
  buy.disabled=true;buy.textContent='INDISPONÍVEL';
 }else{recipe.replaceChildren();inspect.querySelector('.shopItemTitle').textContent='Selecione um item para ver a receita';$('shopItemDescription').textContent='';buy.disabled=true;}
 
 const pet=u.junglePet?`<p class="questState"><b>SMITE ${u.smiteDamage}</b> · ${u.smiteCharges||0}/2 usos · ${u.jungleTreats}/35 cargas · ${u.jungleBuff||u.junglePet}</p>`:'<p class="questState">Escolha pet azul / verde / vermelho para obter Smite.</p>';
 const sup=`<p class="questState"><b>QUEST SUP ${u.supportQuest}/800</b> · ${u.supportCharges}/3 cargas de ouro</p>`;
 $('shopUnit').innerHTML='<div class="itemUnit">'+u.champ+'</div><p>'+u.role+' · '+u.klass+'</p>'+(u.role==='JG'?pet:u.role==='SUP'?sup:'');
 $('shopGold').textContent=u.gold;
 const inventory=$('shopInventory');inventory.replaceChildren();
 const inventoryTitle=document.createElement('strong');inventoryTitle.textContent='EQUIPAMENTOS';inventory.append(inventoryTitle);
 const undoShop=document.createElement('button');undoShop.type='button';undoShop.textContent='↶ Desfazer última compra/venda';const undoCheck=match.canUndoShopV453Dev61('blue',u.id);undoShop.disabled=!undoCheck.ok;undoShop.title=undoCheck.ok?'Desfaz somente nesta visita à fonte. Sair e voltar bloqueia transações anteriores.':undoCheck.reason;undoShop.onclick=()=>{const r=match.undoShopV453Dev61('blue',u.id);selectedInventoryV453Dev48=-1;notify(r.ok?'Transação desfeita sem perda de ouro':r.reason);updateInspector();renderStatus();renderShop(shopFilter);};inventory.append(undoShop);
 const slots=document.createElement('div');slots.className='inventoryIconRowV453Dev48';inventory.append(slots);
 for(let i=0;i<6;i++){
  const id=u.items[i],item=catalog.find(x=>x.id===id),slot=document.createElement('button');slot.type='button';
  slot.className='inventoryIconV453Dev48'+(i===selectedInventoryV453Dev48?' active':'');
  slot.title=item?.name||'Slot vazio';slot.disabled=!item;slot.setAttribute('aria-label',item?.name||'Vazio');
  if(item){const state=match.itemProcStatusV453Dev39(u).find(v=>v.id===id);
   if(state){slot.title=item.name+' · '+state.label+' · '+state.description;
    slot.dataset.itemInventoryProcV453Dev39=state.description;}
   const image=document.createElement('img');image.src=shopAsset(item)||shopFallbackSrcV453Dev45(item);
   image.onerror=()=>{image.onerror=null;image.src=shopFallbackSrcV453Dev45(item)};
   slot.append(image);slot.onclick=()=>{selectedInventoryV453Dev48=i===selectedInventoryV453Dev48?-1:i;renderShop(shopFilter);};}
  slots.append(slot);
 }
 const item=u.items[selectedInventoryV453Dev48]!=null?catalog.find(x=>x.id===u.items[selectedInventoryV453Dev48]):null;
 if(item){const actions=document.createElement('div');actions.className='inventoryActionRowV453Dev48';
  const title=document.createElement('small');title.textContent=item.name;title.title=item.name;
  const saleCheck=match.canSellItemV453Dev60('blue',u.id,selectedInventoryV453Dev48);
  const sell=document.createElement('button');sell.type='button';sell.textContent=saleCheck.ok?'Vender · +'+saleCheck.refund+'g':'Venda indisponível';
  sell.title=saleCheck.ok?('Comprado por '+item.cost+'g · revenda oficial '+saleCheck.refund+'g · perda '+saleCheck.loss+'g'):saleCheck.reason;
  sell.disabled=!saleCheck.ok;
  sell.onclick=()=>{const result=match.sellItemV43('blue',u.id,selectedInventoryV453Dev48);selectedInventoryV453Dev48=-1;
   notify(result.ok?'Item vendido por '+result.refund+' ouro':result.reason);updateInspector();renderStatus();renderShop(shopFilter);};
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancelar';
  cancel.onclick=()=>{selectedInventoryV453Dev48=-1;renderShop(shopFilter);};
  if(saleCheck.ok){const hint=document.createElement('small');hint.className='saleRefundV453Dev60';hint.textContent='Compra '+item.cost+'g · revenda '+saleCheck.refund+'g (−'+saleCheck.loss+'g)';actions.append(hint);}
  actions.append(title,sell,cancel);inventory.append(actions);
 }
 const runeSelect=$('shopRunePage');runeSelect.value=u.runePageV43||'none';
 $('shopRuneApply').disabled=match.phase!=='preparation'||match.teams.blue.ready;
 $('shopLeaveBase').disabled=!u.awaitingShop;
 $('shopStay').textContent=u.awaitingShop?'Fechar · permanecer na fonte':'Fechar loja';
}
$('shopRuneApply').onclick=()=>{if(!selected)return;const id=$('shopRunePage').value;const result=match.chooseRunePageV43('blue',selected.id,id);notify(result.ok?'Runas aplicadas: '+RUNE_PAGES_V43[id].name:result.reason);updateInspector();renderStatus();renderShop(shopFilter);};
$('shopPurchase').onclick=()=>{if(!selected||!shopSelection)return;const item=catalog.find(i=>i.id===shopSelection);const result=match.purchaseOrPlan('blue',selected.id,shopSelection);if(result.ok){notify(item.name+(result.bought?' equipado/comprado.':' programado para próxima fonte.'));updateInspector();renderStatus();renderShop(shopFilter);}else notify(result.reason||'Compra indisponível.');};
$('shopSaveLoadout').onclick=()=>{if(!selected)return;const ids=[...selected.items,...(selected.purchaseQueue||[])];storage.set('coachlol_arsenal_'+selected.champ,JSON.stringify(ids));notify('Arsenal de '+selected.champ+' salvo neste dispositivo.');};
$('shopApplyLoadout').onclick=()=>{if(!selected)return;let ids=[];try{ids=JSON.parse(storage.get('coachlol_arsenal_'+selected.champ)||'[]')}catch{}if(!Array.isArray(ids)||!ids.length)return notify('Salve primeiro um arsenal.');let ok=0;const have={};for(const id of [...selected.items,...(selected.purchaseQueue||[])])have[id]=(have[id]||0)+1;const wanted={};for(const id of ids){wanted[id]=(wanted[id]||0)+1;if((have[id]||0)>=wanted[id])continue;const r=match.queuePurchase('blue',selected.id,id);if(r.ok)ok++;}renderShop(shopFilter);notify(ok+' itens restantes do arsenal programados.');};
$('shopTabs').onclick=e=>{const btn=e.target.closest('button[data-filter]');if(btn)renderShop(btn.dataset.filter)};
$('shopTierFiltersV453Dev48').onclick=e=>{const btn=e.target.closest('button[data-tier]');if(btn){shopTierV453Dev48=btn.dataset.tier;renderShop(shopFilter);}};
document.addEventListener('pointerdown',e=>{if(selectedInventoryV453Dev48<0||e.target.closest('#shopInventory'))return;
 selectedInventoryV453Dev48=-1;requestAnimationFrame(()=>{if(!$('shopModal').hidden)renderShop(shopFilter);});});
$('shopSearch').addEventListener('input',()=>renderShop(shopFilter));
$('shopClearSearch').onclick=()=>{$('shopSearch').value='';renderShop(shopFilter);$('shopSearch').focus()};

// Gameplay header hides dev-only save/load/draft buttons; accessible in local development via F10.
function setDebugControls(value){document.body.classList.toggle('showDevTools',!!value);const input=$('debugControlsToggle');if(input)input.checked=!!value;}
$('debugControlsToggle').onchange=e=>setDebugControls(e.target.checked);
window.addEventListener('keydown',e=>{if(e.key==='F10'){e.preventDefault();setDebugControls(!document.body.classList.contains('showDevTools'));}});

// V2.3 - compact workspace, local chat, and appearance.
const workspace=$('workspaceLayout');
function setWorkspace(){const l=Number(storage.get('coachlol_left_px'))||195,r=Number(storage.get('coachlol_right_px'))||280;workspace.style.setProperty('--left-width',l+'px');workspace.style.setProperty('--right-width',r+'px');}
setWorkspace();
for(const [handle,isLeft] of [[$('resizeLeft'),true],[$('resizeRight'),false]]){
 handle.addEventListener('pointerdown',e=>{e.preventDefault();handle.setPointerCapture(e.pointerId);handle.classList.add('dragging');});
 handle.addEventListener('pointermove',e=>{if(!handle.hasPointerCapture(e.pointerId))return;const rect=workspace.getBoundingClientRect();const requested=isLeft?e.clientX-rect.left:rect.right-e.clientX;const limit=Math.min(420,rect.width*.36);const value=Math.round(clamp(requested,155,limit));const key=isLeft?'--left-width':'--right-width';workspace.style.setProperty(key,value+'px');storage.set(isLeft?'coachlol_left_px':'coachlol_right_px',String(value));resize();});
 handle.addEventListener('pointerup',e=>{handle.classList.remove('dragging');if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);});
}
function settingsRange(id,label,key){const el=$(id),out=$(label);const start=Number(storage.get(key))||100;el.value=String(start);out.textContent=start+'%';el.oninput=()=>{const n=Number(el.value);out.textContent=n+'%';document.documentElement.style.setProperty('--'+id,n/100);storage.set(key,String(n));};el.dispatchEvent(new Event('input'));}
settingsRange('uiScale','uiScaleLabel','coachlol_ui_scale');settingsRange('fontScale','fontScaleLabel','coachlol_font_scale');
$('settingsOpen').onclick=()=>$('settingsModal').hidden=false;$('settingsClose').onclick=()=>$('settingsModal').hidden=true;
$('settingsModal').addEventListener('click',e=>{if(e.target===$('settingsModal'))$('settingsModal').hidden=true;});
$('resetWorkspace').onclick=()=>{for(const key of ['coachlol_ui_scale','coachlol_font_scale','coachlol_left_px','coachlol_right_px'])try{localStorage.removeItem(key)}catch{}$('uiScale').value='100';$('fontScale').value='100';$('uiScale').dispatchEvent(new Event('input'));$('fontScale').dispatchEvent(new Event('input'));storage.set('coachlol_left_px','195');storage.set('coachlol_right_px','280');setWorkspace();camera={zoom:1,px:0,py:0,angle:0,tilt:.55};syncTilt();resize();notify('Interface e câmera restauradas.');};
const chat=$('arenaChat'),messages=$('chatMessages');let chatTimer=null;
function showChat(){chat.hidden=false;stage.parentElement.classList.add('chatDockOpen');$('chatText').focus();if(chatTimer)clearTimeout(chatTimer);if($('chatAutoHide').checked)chatTimer=setTimeout(()=>{chat.hidden=true;stage.parentElement.classList.remove('chatDockOpen');},45000);}
$('chatOpen').onclick=showChat;$('chatMinimize').onclick=()=>{chat.hidden=true;stage.parentElement.classList.remove('chatDockOpen');};
$('chatForm').onsubmit=e=>{e.preventDefault();const value=$('chatText').value.trim();if(!value)return;const entry=document.createElement('div');entry.className='chatLine';const from=document.createElement('b');from.textContent='Você';const msg=document.createElement('span');msg.textContent=value;entry.append(from,msg);messages.append(entry);$('chatText').value='';messages.scrollTop=messages.scrollHeight;showChat();
 // Offline bot-only reply; there is no network transport or multiplayer opponent yet.
 if(match.mode==='bot'){
  const bot=document.createElement('div');bot.className='chatLine botChat';
  const who=document.createElement('b');who.textContent='Bot local';const text=document.createElement('span');
  text.textContent=/\b(ward|visao|invasao|invade|gank)\b/i.test(value)?'Vou reforçar a visão.':'Entendido. Boa rodada!';
  bot.append(who,text);messages.append(bot);messages.scrollTop=messages.scrollHeight;
 }
};
let chatDrag=null;const chatHead=$('arenaChatHandle');chatHead.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const area=$('boardHolder').getBoundingClientRect(),bounds=chat.getBoundingClientRect();chatDrag={x:e.clientX,y:e.clientY,left:bounds.left-area.left,top:bounds.top-area.top};chatHead.setPointerCapture(e.pointerId);});
chatHead.addEventListener('pointermove',e=>{if(!chatDrag)return;chat.style.left=clamp(chatDrag.left+e.clientX-chatDrag.x,0,Math.max(0,stage.clientWidth-chat.offsetWidth))+'px';chat.style.top=clamp(chatDrag.top+e.clientY-chatDrag.y,0,Math.max(0,stage.clientHeight-chat.offsetHeight))+'px';chat.style.bottom='auto';});
chatHead.addEventListener('pointerup',e=>{chatDrag=null;if(chatHead.hasPointerCapture(e.pointerId))chatHead.releasePointerCapture(e.pointerId);});
window.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.ctrlKey||e.altKey||e.metaKey||!$('shopModal').hidden||!$('settingsModal').hidden||scoreboardOpen)return;const tag=document.activeElement?.tagName;if(['TEXTAREA','INPUT','SELECT'].includes(tag))return;if(pendingFightTargetId)return;e.preventDefault();showChat();});


// Default gameplay hierarchy: abilities > actions > PATH/GANK > reaction. The
// original DOM elements are moved, never cloned: all existing JS listeners stay live.
const pathWidget=$('tacticPanel'),reactionWidget=document.querySelector('.policyPanel');
if(pathWidget&&reactionWidget)reactionWidget.before(pathWidget);
// All independent tactical widgets are movable, without replacing their JS-bound nodes.
// Auto-up is part of the abilities widget, so moving abilities keeps that toggle.
for(const id of ['quickToggles','policyPanel','tacticPanel','smitePanel','tiltControls']){
 const section=$(id);if(!section)continue;
 section.classList.add('reorderWidget','extraWidget');
 const handle=document.createElement('span');handle.className='widgetHandle compactGrip';
 handle.draggable=true;handle.textContent='⠿';handle.title='Arrastar e reorganizar';
 handle.setAttribute('aria-label','Mover painel '+id);
 (section.tagName==='DETAILS'?section.querySelector('summary'):section).prepend(handle);
}
// Skill and action widgets can be rearranged without moving or replacing game hooks.
const inspector=$('selectedInspector');
const defaultWidgetIds=['skillWidget','actionsWidget','tacticPanel','policyPanel','smitePanel'];
const layoutKey='coachlol_widget_order_v31';
function rememberWidgetOrder(){const ids=[...inspector.children].filter(n=>n.classList?.contains('reorderWidget')&&n.id).map(n=>n.id);storage.set(layoutKey,JSON.stringify(ids));}
function restoreWidgetOrder(){let ids=[];try{ids=JSON.parse(storage.get(layoutKey)||'[]');}catch{}if(!Array.isArray(ids))return;for(const id of ids){if(typeof id!=='string'||!defaultWidgetIds.concat(['quickToggles','tiltControls']).includes(id))continue;const node=$(id);if(node?.parentElement===inspector&&node.classList.contains('reorderWidget'))inspector.append(node);}}
restoreWidgetOrder();
let movingInnerWidget=null;
for(const widget of document.querySelectorAll('#selectedInspector > .reorderWidget')){
 widget.querySelector('.widgetHandle')?.addEventListener('dragstart',e=>{movingInnerWidget=widget;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',widget.id);widget.classList.add('draggingPanel');});
 widget.addEventListener('dragover',e=>{if(!movingInnerWidget||movingInnerWidget===widget)return;e.preventDefault();});
 widget.addEventListener('drop',e=>{if(!movingInnerWidget||movingInnerWidget===widget)return;e.preventDefault();widget.before(movingInnerWidget);movingInnerWidget.classList.remove('draggingPanel');movingInnerWidget=null;rememberWidgetOrder();});
 widget.addEventListener('dragend',()=>{widget.classList.remove('draggingPanel');movingInnerWidget=null;});
}
// Dock windows can be reordered and transferred between sidebars by their headings.
// This moves existing DOM nodes (never recreates the gameplay inspector).
let movingDock=null;
const sideDocks=[document.querySelector('.layout .left'),document.querySelector('.layout .right')].filter(Boolean);
for(const side of sideDocks){
 side.addEventListener('dragover',e=>{if(!movingDock)return;e.preventDefault();side.classList.add('dockDropTarget');});
 side.addEventListener('dragleave',e=>{if(e.target===side)side.classList.remove('dockDropTarget');});
 side.addEventListener('drop',e=>{if(!movingDock)return;e.preventDefault();side.append(movingDock);side.classList.remove('dockDropTarget');movingDock.classList.remove('draggingPanel');movingDock=null;resize();});
}
for(const panel of document.querySelectorAll('.layout .left > .panel, .layout .right > .panel')){
 const head=panel.querySelector('.sectHead');if(!head)continue;
 head.draggable=true;head.classList.add('dockMoveGrip');head.title='Arraste o título para mover este painel entre as laterais';
 head.addEventListener('dragstart',e=>{movingDock=panel;panel.classList.add('draggingPanel');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',panel.id||'panel');});
 head.addEventListener('dragend',()=>{if(movingDock)movingDock.classList.remove('draggingPanel');movingDock=null;for(const side of sideDocks)side.classList.remove('dockDropTarget');});
}

// Preserve the original 20s Champion Select (accessible from header) but use approved roster on gameplay launch.
if(draft)notify('Composições carregadas da Champ Select.');
resize();choose(match.units.find(u=>u.id==='blue_ADC'));renderStatus();startRAF();notify('60s de preparação: compre itens, defina as rotas ou use ordens por texto.');
// V4.5.2: summoner spells are immutable once Champ Select locks the match.

})();
