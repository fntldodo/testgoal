// 이미지 onerror → 안전 대체
window.addEventListener('error',(e)=>{
  const t=e?.target;
  if(t && t.tagName==='IMG'){
    if(!t.dataset.fallbackUsed){
      t.dataset.fallbackUsed='1';
      t.src='./assets/mongsil.png';
    }
  }
}, true);

// 중복 script 방지(선택): 같은 src가 이미 있으면 무시
(function(){
  const seen=new Set();
  [...document.querySelectorAll('script[src]')].forEach(s=>{
    const src=s.getAttribute('src');
    if(seen.has(src)){ try{s.remove();}catch{} }
    else seen.add(src);
  });
})();