// ===== 1️⃣ 기존 로직 (테스트 카드 이동 + 스크롤 버튼) =====
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


// ===== 2️⃣ 새 기능: 상단 카테고리 캐러셀(화살표 + 드래그/스와이프) =====
(function(){
  const scroller = document.getElementById('scrollTests');
  if(!scroller) return;

  const prev = document.querySelector('.nav-btn.prev');
  const next = document.querySelector('.nav-btn.next');
  const STEP = 140; // 화살표 한 번 클릭 시 이동 거리

  // 좌우 화살표
  prev.addEventListener('click', ()=> scroller.scrollBy({left: -STEP, behavior:'smooth'}));
  next.addEventListener('click', ()=> scroller.scrollBy({left:  STEP, behavior:'smooth'}));

  // 드래그(PC) / 스와이프(모바일)
  let isDown = false, startX = 0, startScroll = 0;
  const start = (x)=>{ isDown=true; startX=x; startScroll=scroller.scrollLeft; }
  const move  = (x)=>{ if(!isDown) return; const dx = x - startX; scroller.scrollLeft = startScroll - dx; }
  const end   = ()=>{ isDown=false; }

  scroller.addEventListener('mousedown', e=> start(e.pageX));
  window.addEventListener('mousemove', e=> move(e.pageX));
  window.addEventListener('mouseup',   end);
  scroller.addEventListener('touchstart', e=> start(e.touches[0].pageX), {passive:true});
  window.addEventListener('touchmove',  e=> move(e.touches[0].pageX),  {passive:true});
  window.addEventListener('touchend',   end);

  // 키보드 좌우 화살표 지원
  scroller.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft')  scroller.scrollBy({left:-STEP, behavior:'smooth'});
    if(e.key === 'ArrowRight') scroller.scrollBy({left: STEP, behavior:'smooth'});
  });

  // 칩 클릭 → 각 테스트 페이지 이동 (보강용)
  scroller.querySelectorAll('.test-chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const link = chip.dataset.link;
      if(link) location.href = `./tests/${link}.html`;
    });
  });
})();
