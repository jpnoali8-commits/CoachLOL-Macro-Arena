/* Visual positioning only. Gameplay handlers and data are untouched. */
(()=>{
 const board=document.querySelector('.boardColumn');const header=document.querySelector('.header');
 if(!board||!header)return;
 let frame=0;
 function align(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
  const b=board.getBoundingClientRect(),h=header.getBoundingClientRect();
  if(b.width>0) header.style.setProperty('--board-center',`${b.left+b.width/2-h.left}px`);
 });}
 window.addEventListener('resize',align,{passive:true});
 if(typeof ResizeObserver==='function'){const ro=new ResizeObserver(align);ro.observe(board);ro.observe(header)}
 align();
})();
