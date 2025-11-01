// =========================
// 몽실몽실 메인 스크립트 (index 전용)
// - 카드 "시작하기" → tests/{key}.html 이동
// - 상단 칩 클릭 → tests/{key}.html 이동
// - "테스트 보러 가기" → 카드 그리드로 스크롤
// - 칩 가로 스크롤: 버튼/드래그/터치
// - Lottie 403/오류 시 PNG 자동 대체
// =========================

document.addEventListener('DOMContentLoaded', () => {
  // 카드 버튼 → 각 테스트 페이지로 이동
  document.querySelectorAll('.card .start').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.closest('.card')?.dataset.key;
      if (!key) return;
      location.href = `./tests/${key}.html`;
    });
  });

  // 상단 칩 → 각 테스트 페이지로 이동
  document.querySelectorAll('.test-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.link;
      if (!key) return;
      location.href = `./tests/${key}.html`;
    });
  });

  // "테스트 보러 가기" → 카드 그리드로 스크롤
  const startAll = document.getElementById('startAll');
  if (startAll) {
    startAll.addEventListener('click', () => {
      const main = document.querySelector('main');
      if (main) window.scrollTo({ top: main.offsetTop - 10, behavior: 'smooth' });
    });
  }

  // 상단 칩 가로 스크롤(버튼/드래그/터치)
  (function initHorizontalChips() {
    const scroller = document.getElementById('scrollTests');
    if (!scroller) return;

    const prev = document.querySelector('.nav-btn.prev');
    const next = document.querySelector('.nav-btn.next');
    const STEP = 140;

    if (prev) prev.addEventListener('click', () => scroller.scrollBy({ left: -STEP, behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => scroller.scrollBy({ left:  STEP, behavior: 'smooth' }));

    let isDown = false, startX = 0, startScroll = 0;
    const start = (x) => { isDown = true; startX = x; startScroll = scroller.scrollLeft; scroller.classList.add('dragging'); };
    const move  = (x) => { if (!isDown) return; const dx = x - startX; scroller.scrollLeft = startScroll - dx; };
    const end   = () => { isDown = false; scroller.classList.remove('dragging'); };

    scroller.addEventListener('mousedown', e => start(e.pageX));
    window.addEventListener('mousemove',   e => move(e.pageX));
    window.addEventListener('mouseup',     end);

    scroller.addEventListener('touchstart', e => start(e.touches[0].pageX), { passive: true });
    window.addEventListener('touchmove',    e => move(e.touches[0].pageX),   { passive: true });
    window.addEventListener('touchend',     end);
  })();

  // Lottie 로더: CORS/403/오류 시 PNG로 자동 대체
  (function initLottieFallbacks() {
    const boxes = document.querySelectorAll('.anim');
    boxes.forEach(box => {
      const player = box.querySelector('lottie-player.lp');
      const fallback = box.querySelector('.anim-fallback');

      if (!player) { if (fallback) fallback.style.display = 'block'; return; }

      const url = player.getAttribute('data-lottie');
      if (!url) { player.remove(); if (fallback) fallback.style.display = 'block'; return; }

      fetch(url, { mode: 'cors' })
        .then(res => {
          if (!res.ok) throw new Error('Lottie blocked: ' + res.status);
          player.setAttribute('src', url);
        })
        .catch(() => {
          try { player.remove(); } catch (e) {}
          if (fallback) fallback.style.display = 'block';
        });

      setTimeout(() => {
        if (player.isConnected && !player.getAttribute('src')) {
          try { player.remove(); } catch (e) {}
          if (fallback) fallback.style.display = 'block';
        }
      }, 2500);
    });
  })();
});
