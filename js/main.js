// /js/main.js — v2025.3 (scroll 안정화 + dopamine 추가)
document.addEventListener('DOMContentLoaded', () => {
  // ✅ 도파민 테스트(dopamine) 추가
  const ALLOWED = new Set([
    'mbti',
    'personality',
    'love',
    'independence',
    'animal',
    'plant',
    'weather',
    'mindtalk',
    'energy',
    'dopamine'
  ]);

  let navigating = false;
  const canAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const go = (key) => {
    if (!key || navigating || !ALLOWED.has(key)) return;
    navigating = true;
    setTimeout(() => { location.href = `./tests/${key}.html`; }, 0);
  };

  /* ---------------- 카드 내 “시작하기” 버튼 ---------------- */
  document.querySelectorAll('.card .start').forEach(btn => {
    btn.addEventListener('click', () => {
      go(btn.closest('.card')?.dataset.key);
    }, { passive: true });
  });

  /* ---------------- 카드 전체 클릭 + 키보드 진입 ---------------- */
  document.querySelectorAll('.card').forEach(card => {
    // 카드 전체 클릭
    card.addEventListener('click', e => {
      // 안에 있는 .start 버튼 클릭은 여기서 처리 X (위 핸들러가 담당)
      if (e.target.closest('.start')) return;
      go(card.dataset.key);
    });

    // 키보드 접근성: Enter / Space
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go(card.dataset.key);
      }
    });
  });

  /* ---------------- 상단 Chips 클릭 시 바로 이동 ---------------- */
  document.querySelectorAll('.test-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      go(chip.dataset.link);
    }, { passive: true });
  });

  /* ---------------- “테스트 보러 가기” 버튼: 아래 카드로 스크롤 ---------------- */
  const startAll = document.getElementById('startAll');
  if (startAll) {
    startAll.addEventListener('click', () => {
      const main = document.querySelector('main');
      if (!main) return;
      const top = main.offsetTop - 10;

      if (canAnimate) {
        window.scrollTo({ top, behavior: 'smooth' });
      } else {
        window.scrollTo(0, top);
      }
    });
  }

  /* ---------------- 칩 가로 스크롤(버튼 + 드래그/터치) ---------------- */
  (function () {
    const scroller = document.getElementById('scrollTests');
    if (!scroller) return;

    const prev = document.querySelector('.nav-btn.prev');
    const next = document.querySelector('.nav-btn.next');
    const STEP = 160; // 한 번에 이동할 거리

    // ← / → 버튼 클릭 시 가로 스크롤
    prev?.addEventListener('click', () => {
      scroller.scrollBy({
        left: -STEP,
        behavior: canAnimate ? 'smooth' : 'auto'
      });
    });

    next?.addEventListener('click', () => {
      scroller.scrollBy({
        left: STEP,
        behavior: canAnimate ? 'smooth' : 'auto'
      });
    });

    // 드래그 스크롤 (마우스 + 터치)
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const startDrag = (clientX) => {
      isDown = true;
      moved = false;
      startX = clientX;
      startScroll = scroller.scrollLeft;
      scroller.classList.add('dragging');
    };

    const moveDrag = (clientX) => {
      if (!isDown) return;
      const dx = clientX - startX;
      if (Math.abs(dx) > 3) moved = true; // 드래그로 인식
      scroller.scrollLeft = startScroll - dx;
    };

    const endDrag = () => {
      isDown = false;
      scroller.classList.remove('dragging');
    };

    // 마우스 드래그
    scroller.addEventListener('mousedown', (e) => {
      // 왼쪽 버튼만
      if (e.button !== 0) return;
      startDrag(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      moveDrag(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      endDrag();
    });

    // 터치 드래그
    scroller.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      if (!t) return;
      startDrag(t.clientX);
    }, { passive: true });

    scroller.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (!t) return;
      moveDrag(t.clientX);
    }, { passive: true });

    scroller.addEventListener('touchend', endDrag);
    scroller.addEventListener('touchcancel', endDrag);

    // 드래그 후 클릭 방지: 드래그한 상태에서 칩을 눌렀을 때 잘못 진입되는 것 막기
    scroller.addEventListener('click', (e) => {
      if (!moved) return; // 실제 클릭이면 그대로 통과
      e.stopPropagation();
      e.preventDefault();
    }, true);
  })();
});
