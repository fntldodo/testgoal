const questions=[
  {q:'파티에서 처음 보는 사람과 쉽게 이야기할 수 있다.', type:['E','I']},
  {q:'하루 일정은 미리 계획하는 편이다.', type:['J','P']},
  {q:'감정보다 논리를 더 중시한다.', type:['T','F']},
  {q:'사람들보다 혼자 있을 때 에너지가 충전된다.', type:['I','E']},
  {q:'새로운 시도보다 익숙한 방식이 편하다.', type:['S','N']},
];
let i=0; const scores={E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
const box=document.getElementById('quiz-container'); const next=document.getElementById('next-btn'); let picked=null;
function render(){ const q=questions[i]; box.innerHTML=`<div><strong>Q${i+1}.</strong> ${q.q}</div>
<div class='choices'><button onclick='pick(0)'>그렇다</button><button onclick='pick(1)'>아니다</button></div>`; picked=null;}
window.pick=function(c){ const pair=questions[i].type; if(c===0) scores[pair[0]]++; else scores[pair[1]]++; picked=true;}
next.addEventListener('click',()=>{ if(picked==null) return alert('선택해주세요'); i++; if(i<questions.length) render(); else done();});
function done(){ const ei=scores.E>=scores.I?'E':'I', sn=scores.S>=scores.N?'S':'N', tf=scores.T>=scores.F?'T':'F', jp=scores.J>=scores.P?'J':'P';
  const mbti=`${ei}${sn}${tf}${jp}`;
  box.outerHTML=`<div class='result'><h2>당신의 MBTI는 ${mbti}</h2><p>몽실이가 준비한 결과 카드로 이어집니다 ☁️</p><a class='start' href='../index.html'>메인으로</a></div>`;
  next.style.display='none';
}
render();