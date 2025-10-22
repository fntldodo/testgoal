const qs=[
 {q:'새로운 환경에 금방 적응한다'},{q:'감정 기복이 적다'},{q:'주변 사람의 기분에 잘 공감한다'},{q:'혼자 있는 시간이 꼭 필요하다'},{q:'계획대로 일이 안되면 스트레스를 받는다'}
];
let i=0, total=0; const box=document.getElementById('quiz-container'); const next=document.getElementById('next-btn');
function r(){ box.innerHTML=`<div><strong>Q${i+1}.</strong> ${qs[i].q}</div>
<div class='choices'><button onclick='a(2)'>그렇다</button><button onclick='a(1)'>보통</button><button onclick='a(0)'>아니다</button></div>`;}
window.a=function(s){ total+=s; i++; if(i<qs.length) r(); else done();}
function done(){ const tone= total>=7?'차분형':(total>=4?'균형형':'활동형');
 box.outerHTML=`<div class='result'><h2>${tone}</h2><p>추천 톤: ${tone==='차분형'?'파스텔 민트':'웜 핑크'}</p><a class='start' href='../index.html'>메인으로</a></div>`; next.style.display='none';}
next.addEventListener('click',()=>alert('선택 버튼을 눌러주세요')); r();