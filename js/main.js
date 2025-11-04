document.addEventListener('DOMContentLoaded',()=>{
  // 카드 → tests/{key}.html
  document.querySelectorAll('.card .start').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const key=btn.closest('.card')?.dataset.key; if(!key) return;
      location.href=`./tests/${key}.html`;
    });
  });
  // 카드 전체 클릭/엔터 접근성
  document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('click',e=>{
      if(e.target.closest('.start')) return; // 중복 방지
      const key=card.dataset.key; if(!key) return;
      location.href=`./tests/${key}.html`;
    });
    card.addEventListener('keydown',e=>{
      if(e.key==='Enter' || e.key===' '){
        e.preventDefault();
        const key=card.dataset.key; if(!key) return;
        location.href=`./tests/${key}.html`;
      }
    });
  });

  // 칩 → tests/{key}.html
  document.querySelectorAll('.test-chip').forEach(chip=>{
    chip.addEventListener('click',()=>{
      const key=chip.dataset.link; if(!key) return;
      location.href=`./tests/${key}.html`;
    });
  });

  // “테스트 보러 가기” → 메인 그리드로 스크롤
  const startAll=document.getElementById('startAll');
  if(startAll){
    startAll.addEventListener('click',()=>{
      const main=document.querySelector('main');
      if(main) window.scrollTo({top:main.offsetTop-10,behavior:'smooth'});
    });
  }

  // 칩 스크롤(버튼/드래그/터치)
  (function(){
    const scroller=document.getElementById('scrollTests'); if(!scroller) return;
    const prev=document.querySelector('.nav-btn.prev'), next=document.querySelector('.nav-btn.next'), STEP=160;
    prev?.addEventListener('click',()=> scroller.scrollBy({left:-STEP,behavior:'smooth'}));
    next?.addEventListener('click',()=> scroller.scrollBy({left: STEP,behavior:'smooth'}));
    let isDown=false,startX=0,startScroll=0;
    const start=e=>{ isDown=true; startX=e; startScroll=scroller.scrollLeft; };
    const move=e=>{ if(!isDown) return; const dx=e-startX; scroller.scrollLeft=startScroll-dx; };
    const end=()=>{ isDown=false; };
    scroller.addEventListener('mousedown',e=>start(e.pageX));
    window.addEventListener('mousemove',e=>move(e.pageX));
    window.addEventListener('mouseup',end);
    scroller.addEventListener('touchstart',e=>start(e.touches[0].pageX),{passive:true});
    window.addEventListener('touchmove',e=>move(e.touches[0].pageX),{passive:true});
    window.addEventListener('touchend',end);
  })();
});