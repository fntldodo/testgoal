// --- Lottie 로더(403/에러 시 PNG 자동 대체) ---
(function () {
  const boxes = document.querySelectorAll('.anim');
  boxes.forEach(box => {
    const player = box.querySelector('lottie-player.lp');
    const fallback = box.querySelector('.anim-fallback');
    if (!player) { if (fallback) fallback.style.display = 'block'; return; }
    const url = player.getAttribute('data-lottie');
    if (!url) { player.remove(); if (fallback) fallback.style.display = 'block'; return; }

    // JSON을 먼저 요청 → 성공이면 src 설정, 실패(403 등)면 PNG로 대체
    fetch(url, { mode: 'cors' })
      .then(res => {
        if (!res.ok) throw new Error('Lottie blocked: ' + res.status);
        player.setAttribute('src', url);
      })
      .catch(() => {
        player.remove();
        if (fallback) fallback.style.display = 'block';
      });

    // 무응답 대비 타임아웃(2.5초) — 이 경우도 PNG로 대체
    setTimeout(() => {
      if (player.isConnected && !player.getAttribute('src')) {
        try { player.remove(); } catch (e) {}
        if (fallback) fallback.style.display = 'block';
      }
    }, 2500);
  });
})();
