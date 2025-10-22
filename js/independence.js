const qs=[
 {q:'아침/점심/저녁 루틴이 일정하다'},{q:'결정을 남에게 자주 묻지 않는다'},{q:'혼자 사는 상상에 거부감이 적다'}
];
let i=0,score=0; const box=document.getElementById('quiz-container'); const next=document.getElementById('next-btn');
function r(){ box.innerHTML=`<div><strong>Q${i+1}.</strong> ${qs[i].q}</div><div class='choices'><button onclick='ans(2)'>그렇다</button><button onclick='ans(1)'>보통</button><button onclick='ans(0)'>아니다</button></div>`;}
window.ans=function(s){ score+=s; i++; if(i<qs.length) r(); else done();}
function done(){ const tier=score>=5?'독립형':'균형형';
 box.outerHTML=`<div class='result'><h2>${tier}</h2><p>${tier==='독립형'?'자기결정과 루틴 유지가 강점':'상황에 맞춘 유연함이 강점'}</p><a class='start' href='../index.html'>메인으로</a></div>`; next.style.display='none';}
next.addEventListener('click',()=>alert('선택 버튼을 눌러주세요')); r();