// /js/main.js  — v2025.2 (touch/keyboard a11y + double-click guard)
document.addEventListener('DOMContentLoaded', () => {
  // 허용된 테스트 키(안전한 라우팅용)
  const ALLOWED = new Set([
    'mbti','personality','love','independence','animal','plant','weather','mindtalk','energy'
  ]);

  let navigating = false;
  const canAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function navigate(key) {
    if (!key || navigating || !ALLOWED.has(key)) return;
    navigating = true;
    // 약간의 지연은 더블클릭 방지 + 시각적 피드백 여유
    setTimeout(() => { location.href = `./tests/${key}.html`; }, 0);
  }

  /* 카드 내부 버튼 → tests/{key}.html */
  document.querySelectorAll('.card .start').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.closest('.card')?.dataset.key;
      navigate(key);
    }, { passive: true });
  });

  /* 카드 전체 클릭/키보드 접근성 */
  document.querySelectorAll('.card').forEach(card => {
    // 클릭(내부 start 버튼 클릭 시 중복 방지)
    card.addEventListener('click', e => {
      if (e.target.closest('.start')) return;
      navigate(card.dataset.key);
    });

    // 키보드: Enter / Space
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate(card.dataset.key);
      }
    });
  });

  /* 칩 → tests/{key}.html */
  document.querySelectorAll('.test-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      navigate(chip.dataset.link);
    }, { passive: true });
  });

  /* “테스트 보러 가기” → 메인 그리드로 스크롤 */
  const startAll = document.getElementById('startAll');
  if (startAll) {
    startAll.addEventListener('click', () => {
      const main = document.querySelector('main');
      if (!main) return;
      if (canAnimate) {
        window.scrollTo({ top: main.offsetTop - 10, behavior: 'smooth' });
      } else {
        window.scrollTo(0, main.offsetTop - 10);
      }
    });
  }

/* 칩 스크롤: 네이티브 터치 사용 + 좌/우 버튼 + 휠 보조 */
(function () {
  const scroller = document.getElementById('scrollTests');
  if (!scroller) return;

  const prev = document.querySelector('.nav-btn.prev');
  const next = document.querySelector('.nav-btn.next');
  const STEP = 160;

  prev?.addEventListener('click', () =>
    scroller.scrollBy({ left: -STEP, behavior: canAnimate ? 'smooth' : 'auto' })
  );
  next?.addEventListener('click', () =>
    scroller.scrollBy({ left:  STEP, behavior: canAnimate ? 'smooth' : 'auto' })
  );

  // 트랙패드/마우스 휠의 세로 입력을 가로로 매핑
  scroller.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && !e.shiftKey) {
      scroller.scrollLeft += e.deltaY;
      e.preventDefault(); // 페이지 세로 스크롤 방지
    }
  }, { passive: false });

  // 스크롤 직후 오작동 클릭 방지(선택 사항)
  let moved = false;
  scroller.addEventListener('pointerdown', () => (moved = false));
  scroller.addEventListener('pointermove', () => (moved = true));
  scroller.addEventListener('click', (e) => {
    if (moved) e.stopPropagation();
  }, true);
})();

});
