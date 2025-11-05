// /js/main.js — v2025.2
document.addEventListener('DOMContentLoaded', () => {
  const ALLOWED = new Set(['mbti','personality','love','independence','animal','plant','weather','mindtalk','energy']);
  let navigating = false;
  const canAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const go = (key) => {
    if (!key || navigating || !ALLOWED.has(key)) return;
    navigating = true;
    setTimeout(() => { location.href = `./tests/${key}.html`; }, 0);
  };

  // 카드 내부 버튼
  document.querySelectorAll('.card .start').forEach(btn => {
    btn.addEventListener('click', () => {
      go(btn.closest('.card')?.dataset.key);
    }, { passive: true });
  });

  // 카드 전체 클릭 + 키보드
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.start')) return;
      go(card.dataset.key);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); go(card.dataset.key);
      }
    });
  });

  // 칩 클릭
  document.querySelectorAll('.test-chip').forEach(chip => {
    chip.addEventListener('click', () => go(chip.dataset.link), { passive: true });
  });

  // “테스트 보러 가기” 스크롤
  const startAll = document.getElementById('startAll');
  if (startAll) {
    startAll.addEventListener('click', () => {
      const main = document.querySelector('main'); if (!main) return;
      if (canAnimate) window.scrollTo({ top: main.offsetTop - 10, behavior: 'smooth' });
      else window.scrollTo(0, main.offsetTop - 10);
    });
  }

  // 칩 가로 스크롤(버튼/드래그/터치)
  (function () {
    const scroller = document.getElementById('scrollTests'); if (!scroller) return;
    const prev = document.querySelector('.nav-btn.prev');
    const next = document.querySelector('.nav-btn.next');
    const STEP = 160;

    prev?.addEventListener('click', () => scroller.scrollBy({ left: -STEP, behavior: canAnimate ? 'smooth' : 'auto' }));
    next?.addEventListener('click', () => scroller.scrollBy({ left:  STEP, behavior: canAnimate ? 'smooth' : 'auto' }));

    let isDown = false, startX = 0, startScroll = 0;

    const start = x => { isDown = true; startX = x; startScroll = scroller.scrollLeft; scroller.classList.add('dragging'); };
    const move  = x => { if (!isDown) return; const dx = x - startX; scroller.scrollLeft = startScroll - dx; };
    const end   = () => { isDown = false; scroller.classList.remove('dragging'); };

    // 마우스
    scroller.addEventListener('mousedown', e => start(e.pageX));
    window.addEventListener('mousemove', e => move(e.pageX));
    window.addEventListener('mouseup', end);

    // 터치
    scroller.addEventListener('touchstart', e => start(e.touches[0].pageX), { passive: true });
    window.addEventListener('touchmove',  e => move(e.touches[0].pageX), { passive: true });
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);
  })();
});