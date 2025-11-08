/* 도파민 테스트 전용 도트 로고 주입 (추가형)
   - 기존 IMG 로고는 폴백으로 남기고, 모드로 표시 제어:
     ?logo=dot|img|both (기본 dot)
*/
(function () {
  const qs = new URL(location.href).searchParams;
  const mode = (qs.get('logo') || 'dot').toLowerCase(); // dot | img | both

  function makeDotLogo() {
    const holder = document.createElement('div');
    holder.className = 'dot-logo';
    const canvas = document.createElement('canvas');
    holder.appendChild(canvas);

    if (window.MongsilDot && typeof window.MongsilDot.draw === 'function') {
      canvas.width = canvas.height = 64;
      // 도파민 테스트: 활기/보상 계열 팔레트(dandelion)로 통일
      window.MongsilDot.draw(canvas, 'dandelion', 'dopamine:logo');
    } else {
      const ctx = canvas.getContext('2d', { alpha: true });
      canvas.width = canvas.height = 64;
      ctx.clearRect(0,0,64,64);
      const colors = ['#fff5dc','#ffe6a8','#ffcf60','#ffd8c4'];
      for (let y=4; y<60; y+=8){
        for (let x=4; x<60; x+=8){
          const c = colors[(x+y) % colors.length];
          ctx.fillStyle = c;
          ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
        }
      }
    }
    return holder;
  }

  function inject() {
    const headerLogo = document.querySelector('.logo');
    if (!headerLogo) return;
    const img = headerLogo.querySelector('img');

    const dot = makeDotLogo();
    headerLogo.insertBefore(dot, headerLogo.firstChild);

    if (mode === 'img') {
      dot.style.display = 'none';
      if (img) img.style.display = '';
    } else if (mode === 'both') {
      dot.style.display = '';
      if (img) img.style.display = '';
    } else {
      dot.style.display = '';
      if (img) img.style.display = 'none';
    }
  }

  if (document.readyState !== 'loading') inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
