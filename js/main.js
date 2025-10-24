
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
// --- Lottie 로더(403/오류 시 PNG 자동 대체) ---
(function () {
  const boxes = document.querySelectorAll('.anim');
  boxes.forEach(box => {
    const player = box.querySelector('lottie-player.lp');
    const fallback = box.querySelector('.anim-fallback');
    if (!player) { if (fallback) fallback.style.display = 'block'; return; }
    const url = player.getAttribute('data-lottie');
    if (!url) { player.remove(); if (fallback) fallback.style.display = 'block'; return; }

    // JSON을 먼저 가져와 CORS/403 확인 → 성공 시 src 설정
    fetch(url, { mode: 'cors' })
      .then(res => {
        if (!res.ok) throw new Error('Lottie blocked: ' + res.status);
        player.setAttribute('src', url);
      })
      .catch(() => {
        // 실패 → PNG로 대체
        player.remove();
        if (fallback) fallback.style.display = 'block';
      });

    // 혹시 무응답 대비 타임아웃(2.5초)도 PNG로 대체
    setTimeout(() => {
      if (player.isConnected && !player.getAttribute('src')) {
        try { player.remove(); } catch (e) {}
        if (fallback) fallback.style.display = 'block';
      }
    }, 2500);
  });
})();
