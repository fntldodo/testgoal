const qs=[
 {q:'연락은 자주 하는 편이다'},{q:'데이트는 즉흥보다 계획형이다'},{q:'서로의 시간 존중을 중요하게 본다'}
];
let i=0, a=0; const box=document.getElementById('quiz-container'); const next=document.getElementById('next-btn');
function r(){ const cur=qs[i]; box.innerHTML=`<div><strong>Q${i+1}.</strong> ${cur.q}</div><div class='choices'><button onclick='ans(1)'>그렇다</button><button onclick='ans(0)'>아니다</button></div>`;}
window.ans=function(v){ a+=v; i++; if(i<qs.length) r(); else done();}
function done(){ const t = a>=2 ? '따뜻한 배려형 💞' : '자유로운 페이스형 🌿';
 box.outerHTML=`<div class='result'><h2>${t}</h2><p>연락/데이트/경계선의 균형을 중요하게 생각해요.</p><a class='start' href='../index.html'>메인으로</a></div>`; next.style.display='none';}
next.addEventListener('click',()=>alert('선택 버튼을 눌러주세요')); r();