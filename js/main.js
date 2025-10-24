// =========================
// 몽실몽실 메인 스크립트
// - 카드 "시작하기" → tests/{key}.html 이동
// - 상단 칩(가로 스크롤) 클릭 이동
// - "테스트 보러 가기" 스크롤
// - 칩 가로 스크롤: 버튼/드래그 지원
// - Lottie 403/에러 시 PNG 자동 대체
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
    const start = (x) => { isDown = true; startX = x; startScroll = scroller.scrollLeft; };
    const move  = (x) => { if (!isDown) return; const dx = x - startX; scroller.scrollLeft = startScroll - dx; };
    const end   = () => { isDown = false; };

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

      // 플레이어가 없으면 바로 PNG 노출
      if (!player) { if (fallback) fallback.style.display = 'block'; return; }

      const url = player.getAttribute('data-lottie');
      if (!url) { player.remove(); if (fallback) fallback.style.display = 'block'; return; }

      // JSON을 먼저 요청 → 성공하면 src 세팅 / 실패면 PNG로 전환
      fetch(url, { mode: 'cors' })
        .then(res => {
          if (!res.ok) throw new Error('Lottie blocked: ' + res.status);
          player.setAttribute('src', url);
        })
        .catch(() => {
          try { player.remove(); } catch (e) {}
          if (fallback) fallback.style.display = 'block';
        });

      // 타임아웃(2.5초) 대비: 여전히 src 미세팅이면 PNG로 전환
      setTimeout(() => {
        if (player.isConnected && !player.getAttribute('src')) {
          try { player.remove(); } catch (e) {}
          if (fallback) fallback.style.display = 'block';
        }
      }, 2500);
    });
  })();
});
