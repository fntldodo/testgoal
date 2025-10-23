
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card .start').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.closest('.card').dataset.key;
      location.href = `./tests/${key}.html`;
    });
  });
  document.querySelectorAll('.test-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      location.href = `./tests/${chip.dataset.link}.html`;
    });
  });
  const startAll = document.getElementById('startAll');
  if (startAll) startAll.addEventListener('click', () => {
    const main = document.querySelector('main');
    if (main) window.scrollTo({ top: main.offsetTop - 10, behavior: 'smooth' });
  });
});
(function(){
  const scroller = document.getElementById('scrollTests');
  if(!scroller) return;
  const prev = document.querySelector('.nav-btn.prev');
  const next = document.querySelector('.nav-btn.next');
  const STEP = 140;
  if(prev) prev.addEventListener('click', ()=> scroller.scrollBy({left: -STEP, behavior:'smooth'}));
  if(next) next.addEventListener('click', ()=> scroller.scrollBy({left:  STEP, behavior:'smooth'}));
  let isDown = false, startX = 0, startScroll = 0;
  const start = (x)=>{ isDown=true; startX=x; startScroll=scroller.scrollLeft; }
  const move  = (x)=>{ if(!isDown) return; const dx = x - startX; scroller.scrollLeft = startScroll - dx; }
  const end   = ()=>{ isDown=false; }
  scroller.addEventListener('mousedown', e=> start(e.pageX));
  window.addEventListener('mousemove', e=> move(e.pageX));
  window.addEventListener('mouseup', end);
  scroller.addEventListener('touchstart', e=> start(e.touches[0].pageX), {passive:true});
  window.addEventListener('touchmove', e=> move(e.touches[0].pageX), {passive:true});
  window.addEventListener('touchend', end);
})();