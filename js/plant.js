const qs=[{q:'나는 감정에 민감하다'},{q:'논리적 설명을 선호한다'},{q:'관계의 조화가 중요하다'}];
let i=0,e=0,l=0; const box=document.getElementById('quiz-container'); const next=document.getElementById('next-btn');
function r(){ box.innerHTML=`<div><strong>Q${i+1}.</strong> ${qs[i].q}</div><div class='choices'><button onclick='ans(1)'>그렇다</button><button onclick='ans(0)'>아니다</button></div>`;}
window.ans=function(v){ if(i===0||i===2)e+=v; else l+=v; i++; if(i<qs.length) r(); else done();}
function done(){ const t=e>=l?'라벤더 🌸 (포근 감성형)':'올리브 🌿 (차분 논리형)';
 box.outerHTML=`<div class='result'><h2>${t}</h2><p>나에게 어울리는 식물 비유!</p><a class='start' href='../index.html'>메인으로</a></div>`; next.style.display='none';}
next.addEventListener('click',()=>alert('선택 버튼을 눌러주세요')); r();