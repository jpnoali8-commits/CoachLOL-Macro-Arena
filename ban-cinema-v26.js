/* Cosmetic effects only; observes existing draft state without changing turns,
   bans, picks, selection, timers or engine objects. */
(()=>{
 const $=id=>document.getElementById(id);
 const flow=window.DraftFlow,overlay=$('banCinema');if(!flow||!overlay)return;
 const slots={blue:$('visualBlueBans'),red:$('visualRedBans')};
 const copies={blue:$('blueBans'),red:$('redBans')};
 let oldCount=0,initialized=false,lastSequence='',hideTimer;
 const safeImg=(source)=>{
   const copy=source.cloneNode(true);
   copy.querySelectorAll('img').forEach(img=>{img.onerror=()=>{img.onerror=null;img.src='assets/portraits/'+img.alt.replace(/[^a-z0-9]/ig,'')+'.svg'}});
   return copy;
 };
 function renderMirrors(){for(const side of ['blue','red']){
   slots[side].replaceChildren(...[...copies[side].children].map(safeImg));
 }}
 function playBan(name,id,known){
   if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
   overlay.hidden=false;overlay.classList.remove('active');
   const art=known?`url("${window.ChampionArt?.splash?.(id)||'assets/portraits/'+id+'.webp'}")`:'none';
   overlay.style.setProperty('--ban-art',art);
   $('banCinemaName').textContent=known?name.toUpperCase():'BANIMENTO';
   void overlay.offsetWidth;overlay.classList.add('active');
   clearTimeout(hideTimer);hideTimer=setTimeout(()=>{overlay.hidden=true;overlay.classList.remove('active')},1750);
 }
 function synchronize(){
   const s=flow.getState();if(!s)return;
   renderMirrors();
   const count=s.bans.blue.length+s.bans.red.length;
   const signature=s.bans.blue.join(',')+'|'+s.bans.red.join(',');
   if(initialized&&count>oldCount){
     const activeSide=s.bans.blue.length>(lastSequence.split('|')[0]||'').split(',').filter(Boolean).length?'blue':'red';
     const id=s.bans[activeSide].at(-1);
     const known=s.mode==='bot'||s.viewer===activeSide||s.stage!=='ban';
     playBan(id||'Campeão',id,known);
   }
   lastSequence=signature;oldCount=count;initialized=true;
 }
 const observer=new MutationObserver(()=>requestAnimationFrame(synchronize));
 observer.observe(copies.blue,{childList:true,subtree:true});
 observer.observe(copies.red,{childList:true,subtree:true});
 synchronize();
})();
