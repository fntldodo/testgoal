
const QUESTIONS = [
  {k:'E',q:'좋아하는 사람이 생기면 표현을 아끼지 않는 편이다.'},
  {k:'S',q:'연애에서도 믿음과 안정감이 가장 중요하다고 생각한다.'},
  {k:'C',q:'대화가 끊기면 불안해진다.'},
  {k:'I',q:'연인과 떨어져 있어도 각자 시간을 즐길 수 있다.'},
  {k:'E',q:'감정은 숨기기보다 바로 표현하는 게 좋다고 생각한다.'},
  {k:'S',q:'불확실한 관계보다는 확실히 정해진 관계가 편하다.'},
  {k:'C',q:'서로의 일상을 자주 공유하는 걸 좋아한다.'},
  {k:'I',q:'연애가 나를 구속하지 않았으면 좋겠다.'},
  {k:'E',q:'연애 초반에 스킨십이 빨리 늘어나는 걸 자연스럽게 느낀다.'},
  {k:'S',q:'연애의 핵심은 신뢰라고 생각한다.'},
  {k:'C',q:'감정 표현이 서툰 상대에게 답답함을 느낀다.'},
  {k:'I',q:'연인이 나의 사생활을 세세히 아는 건 부담스럽다.'},
  {k:'E',q:'사랑한다는 말을 자주 해야 관계가 유지된다고 생각한다.'},
  {k:'S',q:'한 번의 실수보다 일관된 태도가 더 중요하다.'},
  {k:'I',q:'서로 일정한 거리감이 있어야 오래간다고 생각한다.'}
];
let idx=0; const score={E:0,S:0,C:0,I:0}; const ans=[];
const stepLabel=document.getElementById('stepLabel');
const barFill=document.getElementById('barFill');
const qText=document.getElementById('qText');
const wrap=document.getElementById('choiceWrap');
const card=document.getElementById('card');
const result=document.getElementById('result');
const prevBtn=document.getElementById('prev');
const skipBtn=document.getElementById('skip');
function render(){
  stepLabel.textContent=`${idx+1} / ${QUESTIONS.length}`;
  barFill.style.width=`${(idx/QUESTIONS.length)*100}%`;
  qText.textContent=QUESTIONS[idx].q;
  wrap.innerHTML=`
    <button class="choice" data-s="3">매우 그렇다</button>
    <button class="choice" data-s="2">그렇다</button>
    <button class="choice ghost" data-s="1">아니다</button>
    <button class="choice ghost" data-s="0">전혀 아니다</button>`;
  const prevSel=ans[idx]; if(prevSel!==undefined){ Array.from(wrap.children).forEach(b=>{ if(Number(b.dataset.s)===prevSel)b.classList.add('selected');});}
  Array.from(wrap.children).forEach(btn=>{
    btn.addEventListener('click',()=>{
      Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>choose(Number(btn.dataset.s)),220);
    });
  });
}
function choose(s){ ans[idx]=s; score[QUESTIONS[idx].k]+=s; next(); }
function next(){ idx++; if(idx<QUESTIONS.length) render(); else finish(); }
prevBtn.addEventListener('click',()=>{ if(idx===0)return; idx--; recalc(); render(); });
skipBtn.addEventListener('click',()=>{ ans[idx]=0; next(); });
function recalc(){ score.E=score.S=score.C=score.I=0; for(let i=0;i<idx;i++) score[QUESTIONS[i].k]+=ans[i]??0; }
function finish(){
  card.style.display='none'; barFill.style.width='100%';
  const type = classify(score); const desc = DESCRIPTIONS[type];
  result.innerHTML=`
    <div class="result-card">
      <div class="result-hero">
        <img src="../assets/love.png" alt="연애 캐릭터">
        <div>
          <div class="result-title">${desc.title}</div>
          <div class="result-desc">${desc.quote}</div>
        </div>
      </div>
      <p style="margin:8px 0">${desc.text}</p>
      <div class="result-actions">
        <a class="start" href="../index.html">메인으로</a>
        <button class="start" onclick="location.reload()">다시 테스트</button>
      </div>
    </div>`;
  result.style.display='block';
}
function classify(sc){
  const pairs = Object.entries(sc).sort((a,b)=>b[1]-a[1]);
  const top = pairs[0][0];
  if(top==='E' || top==='C') return 'POGEUN';
  if(top==='S') return 'DODO';
  if(top==='I') return 'JAYU';
  return 'BALANCE';
}
const DESCRIPTIONS={
  POGEUN:{ title:'💖 포근몽실형', text:'따뜻함의 결정체! 사랑을 적극적으로 표현하고, 상대의 마음을 잘 읽는 감정형 연애 스타일.', quote:'"사랑은 말로도, 눈빛으로도 충분히 전해져요 ☁️"' },
  DODO:{ title:'🌸 도도몽실형', text:'겉보기엔 조용하지만, 속은 깊고 진심이 가득한 타입. 신뢰가 쌓이면 누구보다 따뜻해요.', quote:'"속도는 느려도 진심은 깊어요 🌷"' },
  JAYU:{ title:'🐬 자유몽실형', text:'연애도 인생도 유쾌하게! 구속보다 자유를 존중하는 타입. 재치 있고 상쾌한 공기 메이커.', quote:'"서로 자유로울 때 사랑이 자라요 💫"' },
  BALANCE:{ title:'☁️ 균형몽실형', text:'감정과 이성을 조화롭게 다루는 이상적 밸런스형. 상황에 따라 주도와 배려를 오가는 타입.', quote:'"사랑은 밀당보다 리듬 맞추기 🎵"' }
};
render();
