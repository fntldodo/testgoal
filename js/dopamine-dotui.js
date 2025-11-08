/* dopamine-dotui.js v2025.3 — 도트 그래픽 UI/저장 (추가형)
   - 기존 기능 삭제/변경 없음. 버튼만 append.
   - URL ?dot=overlay|off|replace 로 표시 제어.
*/
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const url = new URL(location.href);
  const dotParam = (url.searchParams.get('dot') || '').toLowerCase(); // replace|overlay|off

  const res = document.getElementById('result');
  if (!res) return;

  const obs = new MutationObserver(() => {
    const hero = $('.result-hero', res);
    if (!hero) return;

    const dot = $('.dot-hero', hero);
    const img = $('img', hero);

    if (dotParam === 'off') {
      if (dot) dot.style.display = 'none';
      if (img) img.style.display = '';
    } else if (dotParam === 'overlay') {
      if (dot) dot.style.display = '';
      if (img) img.style.display = '';
    } else {
      if (dot) dot.style.display = '';
      if (img) img.style.display = 'none';
    }

    const actions = $('.result-actions', res);
    if (!actions) return;

    if (!$('#dot-save-btn', actions) && $('.dot-hero canvas', hero)) {
      const saveBtn = document.createElement('button');
      saveBtn.id = 'dot-save-btn';
      saveBtn.className = 'start';
      saveBtn.type = 'button';
      saveBtn.textContent = '도트 PNG 저장';

      saveBtn.addEventListener('click', () => {
        const canvas = $('.dot-hero canvas', hero);
        if (!canvas) return;
        const ts = new Date();
        const pad = n => String(n).padStart(2, '0');
        const fname = `dopamine_${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.png`;

        try {
          const data = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = data; a.download = fname;
          document.body.appendChild(a);
          a.click();
          requestAnimationFrame(()=>document.body.removeChild(a));
        } catch(e){
          console.warn('[dot-save] capture failed:', e);
        }
      });

      actions.appendChild(saveBtn);
    }
  });

  obs.observe(res, { childList: true, subtree: true });
})();
