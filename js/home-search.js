// js/home-search.js — v2025.3
// 인덱스 전용: 검색어 기반 카드 필터 + 섹션 표시/숨김 + 정보 패널 토글

document.addEventListener('DOMContentLoaded', () => {
  /* =========================
   * 1. 테스트 검색 / 필터링
   * ========================= */
  const searchInput = document.querySelector('#testSearchInput');
  const cards = Array.from(document.querySelectorAll('article.card[data-key]'));
  const sections = Array.from(document.querySelectorAll('.test-section'));
  const noResultMsg = document.querySelector('#noResultMsg');

  function normalize(str) {
    return (str || '').toString().trim().toLowerCase();
  }

  function applyFilter(queryRaw) {
    if (!cards.length) return;

    const q = normalize(queryRaw);

    // 검색어 없으면 전부 보이기
    if (!q) {
      cards.forEach(card => {
        card.style.display = '';
      });
      sections.forEach(sec => {
        sec.style.display = '';
      });
      if (noResultMsg) noResultMsg.classList.remove('active');
      return;
    }

    let anyVisible = false;

    // 카드 단위 필터
    cards.forEach(card => {
      const title = normalize(card.querySelector('h3')?.textContent);
      const desc = normalize(card.querySelector('.desc')?.textContent);
      const category = normalize(card.dataset.category);
      const keywords = normalize(card.dataset.keywords);

      const haystack = [title, desc, category, keywords].join(' ');
      const match = haystack.includes(q);

      card.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });

    // 섹션에서 보이는 카드가 없으면 섹션 숨김
    sections.forEach(sec => {
      const visibleCards = Array.from(sec.querySelectorAll('article.card'))
        .filter(c => c.style.display !== 'none');
      sec.style.display = visibleCards.length ? '' : 'none';
    });

    if (noResultMsg) {
      noResultMsg.classList.toggle('active', !anyVisible);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      applyFilter(e.target.value);
    });
    // 초기 상태: 전체 표시
    applyFilter('');
  }

  /* =========================
   * 2. 정보 패널(슬라이드) 토글
   * ========================= */
  const openBtn = document.querySelector('.info-open-btn');
  const closeBtn = document.querySelector('.info-close-btn');
  const backdrop = document.querySelector('.info-drawer-backdrop');
  const body = document.body;

  function openDrawer(){
    body.classList.add('info-drawer-open');
  }
  function closeDrawer(){
    body.classList.remove('info-drawer-open');
  }

  if (openBtn) {
    openBtn.addEventListener('click', openDrawer);
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  // ESC 키로 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
    }
  });
});