// js/home-search.js — v2025.4
// 인덱스 전용: 4유형 자동 분류 + 검색 필터 + 정보 패널 토글

document.addEventListener('DOMContentLoaded', () => {
  /* =========================
   * 1. 4유형 자동 분류
   * ========================= */
  const pool = document.querySelector('#allTestsPool');
  const rows = {
    personality: document.querySelector('.card-row[data-type-row="personality"]'),
    relation: document.querySelector('.card-row[data-type-row="relation"]'),
    mood: document.querySelector('.card-row[data-type-row="mood"]'),
    growth: document.querySelector('.card-row[data-type-row="growth"]'),
  };

  if (pool) {
    const cardsInPool = Array.from(pool.querySelectorAll('article.card[data-type]'));

    cardsInPool.forEach(card => {
      const type = (card.dataset.type || 'personality').toLowerCase();
      const targetRow = rows[type] || rows.personality; // 안전 장치

      // 카드 이동
      targetRow.appendChild(card);
    });

    // 풀은 더 이상 보일 필요 없음
    pool.style.display = 'none';
  }

  /* =========================
   * 2. 검색 / 필터
   * ========================= */
  const searchInput = document.querySelector('#testSearchInput');
  const allCards = Array.from(document.querySelectorAll('article.card[data-type]'));
  const sections = Array.from(document.querySelectorAll('.test-section'));
  const noResultMsg = document.querySelector('#noResultMsg');

  function normalize(str) {
    return (str || '').toString().trim().toLowerCase();
  }

  function applyFilter(queryRaw) {
    const q = normalize(queryRaw);

    if (!allCards.length) return;

    // 검색어가 없으면 전부 보이기
    if (!q) {
      allCards.forEach(card => {
        card.style.display = '';
      });
      sections.forEach(sec => {
        // 타입 섹션만 대상 (id=allTestsPool은 aria-hidden 처리)
        if (sec.id === 'allTestsPool') return;
        sec.style.display = '';
      });
      if (noResultMsg) noResultMsg.classList.remove('active');
      return;
    }

    let anyVisible = false;

    allCards.forEach(card => {
      const title = normalize(card.querySelector('h3')?.textContent);
      const desc = normalize(card.querySelector('.desc')?.textContent);
      const category = normalize(card.dataset.category);
      const keywords = normalize(card.dataset.keywords);
      const type = normalize(card.dataset.type);

      const haystack = [title, desc, category, keywords, type].join(' ');
      const match = haystack.includes(q);

      card.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });

    // 섹션별로 카드가 하나도 안 보이면 섹션 접기
    sections.forEach(sec => {
      if (sec.id === 'allTestsPool') return;
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
    // 초기: 전체 보이기
    applyFilter('');
  }

  /* =========================
   * 3. 정보 패널 토글
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

  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
    }
  });
});