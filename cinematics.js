(()=>{'use strict';
const core=window.CoachCinemaCore;
function create({stage,viewerTeam='blue',manifest=window.CoachCinemaManifest||{}}={}){
 if(!stage||!core)throw new Error('Stage/Core cinematográfico indisponível');
 const registry=core.normalizeManifest(manifest), seen=new WeakSet();
 let enabled=true,playing=false,aborted=false,queue=[],finishTimeout=null,active=null, glbRenderer=null;
 const shell=document.createElement('section');shell.className='cinemaHud';shell.setAttribute('aria-label','Anúncios e cinematics do jogo');shell.setAttribute('aria-live','polite');shell.hidden=true;
 const mediaBox=document.createElement('div');mediaBox.className='cinemaMedia';
 const content=document.createElement('div');content.className='cinemaContent';
 const kicker=document.createElement('span');kicker.className='cinemaKicker';
 const body=document.createElement('div');body.className='cinemaMessage';
 const symbol=document.createElement('span');symbol.className='cinemaSymbol';symbol.setAttribute('aria-hidden','true');
 const text=document.createElement('span');text.className='cinemaText';
 const skip=document.createElement('button');skip.type='button';skip.className='cinemaSkip';skip.textContent='Pular ×';skip.setAttribute('aria-label','Pular animação');
 body.append(symbol,text);content.append(kicker,body);shell.append(mediaBox,content,skip);stage.append(shell);
 const stopMedia=()=>{for(const video of mediaBox.querySelectorAll('video')){video.pause();video.removeAttribute('src');video.load();}mediaBox.replaceChildren();};
 const end=()=>{clearTimeout(finishTimeout);finishTimeout=null;stopMedia();shell.hidden=true;active=null;playing=false;if(!aborted&&enabled)startNext();};
 skip.onclick=()=>end();
 const mediaFor=(ev)=>{
  if(!ev.media)return;
  if(['webm','mp4'].includes(ev.media.type)){
   const video=document.createElement('video');video.muted=true;video.playsInline=true;video.autoplay=true;video.preload='none';video.className='cinemaVideo';video.setAttribute('aria-hidden','true');
   video.onerror=()=>{video.remove();};video.src=ev.media.src;video.play().catch(()=>{});mediaBox.append(video);
  }else if(['glb','gltf'].includes(ev.media.type)&&typeof glbRenderer==='function'){
   // Renderer is an optional injected capability; no hidden WebGL/CDN dependency.
   try{glbRenderer({container:mediaBox,event:ev,source:ev.media.src});}catch{mediaBox.replaceChildren();}
  }
 };
 function startNext(){
  if(playing||!enabled||!queue.length||aborted)return;
  queue.sort(core.eventSort);active=queue.shift();playing=true;
  kicker.textContent=active.label;symbol.textContent=active.icon;text.textContent=active.caption;
  shell.dataset.eventType=active.type;shell.dataset.vfx=active.vfx;
  shell.classList.toggle('cinemaReduced',window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||false);
  mediaFor(active);shell.hidden=false;finishTimeout=setTimeout(end,active.durationMs);
 }
 function enqueue(ev){if(!ev||!enabled)return false;if(queue.length>=Math.min(12,manifest.defaultMaxQueue||8)){const min=Math.min(...queue.map(q=>q.priority));if(ev.priority<=min)return false;queue.splice(queue.findIndex(q=>q.priority===min),1);}queue.push(ev);startNext();return true;}
 function ingest(events,{gameTime,round}={}){
  // Authoritative simulation time is the input. No clock timeouts can change match.
  if(!Array.isArray(events))return 0;
  let count=0;
  for(const raw of events){if(!raw||seen.has(raw))continue;
   seen.add(raw);
   if(raw.time!==gameTime||raw.round!==round)continue;
   const visual=core.presentationEvent(raw,viewerTeam,registry);
   if(visual&&enqueue(visual))count++;
  }
  return count;
 }
 return {
  ingest,enqueue,registry,
  enable(next){enabled=!!next;if(!enabled){queue=[];end();}else startNext();},
  registerGLBRenderer(renderer){glbRenderer=typeof renderer==='function'?renderer:null;},
  close(){aborted=true;queue=[];end();shell.remove();},
  getState(){return {enabled,playing,queueLength:queue.length,active:active?.type||null};}
 };
}
window.CoachCinematics={create};
})();
