
const Q = [
  {k:'E', q:'상대의 말보다 표정을 먼저 읽는다.'},
  {k:'E', q:'감정에 따라 하루 에너지가 크게 달라진다.'},
  {k:'E', q:'결정 전에 “기분이 어떤가”를 먼저 본다.'},
  {k:'E', q:'위로의 말 한마디가 큰 힘이 된다.'},
  {k:'E', q:'누군가의 슬픔을 보면 쉽게 공감한다.'},
  {k:'L', q:'논리적으로 틀린 말을 들으면 바로잡고 싶다.'},
  {k:'L', q:'감정보다 사실 확인이 더 중요하다.'},
  {k:'L', q:'감정이 흔들릴 때, 분석하며 정리하려 한다.'},
  {k:'L', q:'문제는 감정보다 구조를 바꿔야 해결된다고 생각한다.'},
  {k:'L', q:'감정 표현보다 명확한 계획이 편하다.'},
  {k:'B', q:'감정과 생각이 싸울 때, 적당히 조율하려 한다.'},
  {k:'B', q:'이해되지 않아도 “그럴 수도 있지”라고 생각한다.'},
  {k:'B', q:'감정과 논리를 번갈아 써가며 설득한다.'},
  {k:'B', q:'상황에 맞춰 감정·논리 모드를 전환할 수 있다.'},
  {k:'B', q:'결국 중요한 건 마음의 평형이라 생각한다.'}
];
let idx = 0; const score = {E:0, L:0, B:0}; const ans = [];
const stepLabel=document.getElementById('stepLabel');
const barFill=document.getElementById('barFill');
const qText=document.getElementById('qText');
const wrap=document.getElementById('choiceWrap');
const card=document.getElementById('card');
const resultBox=document.getElementById('result');
const prevBtn=document.getElementById('prev');
const skipBtn=document.getElementById('skip');
function render(){
  stepLabel.textContent=`${idx+1} / ${Q.length}`;
  barFill.style.width=`${(idx/Q.length)*100}%`;
  qText.textContent=Q[idx].q;
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
      setTimeout(()=>choose(Number(btn.dataset.s)),200);
    });
  });
}
function choose(s){ ans[idx]=s; score[Q[idx].k]+=s; next(); }
function next(){ idx++; if(idx<Q.length) render(); else finish(); }
prevBtn.addEventListener('click',()=>{ if(idx===0)return; idx--; recalcTo(idx); render(); });
skipBtn.addEventListener('click',()=>{ ans[idx]=0; next(); });
function recalcTo(end){ score.E=score.L=score.B=0; for(let i=0;i<end;i++){ const v=ans[i]??0; score[Q[i].k]+=v; } }
function classify(sc){
  const e=sc.E,l=sc.L,b=sc.B; const max=Math.max(e,l,b); const spread=max-Math.min(e,l,b);
  if(spread<=3) return 'BALANCE'; if(max===e) return 'EMOTION'; if(max===l) return 'LOGIC'; return 'HARMONY';
}
const PLANTS={
  EMOTION:{ title:'🌼 민들레형', desc:'감정에 진심인 사람. 따뜻하고 공감이 풍부한 타입.', quote:'“바람에 흔들려도 다시 피어나는 건, 마음의 힘.”', tips:['감정기록 하루 1줄','기분의 온도를 말로 표현'] },
  LOGIC:{ title:'🌵 선인장형', desc:'논리적이고 자립적인 사고형. 파도 속 중심을 잡는 단단함.', quote:'“물을 아낄 줄 아는 자가, 더 멀리 간다.”', tips:['감정도 데이터로 기록','판단 뒤 감정 체크'] },
  HARMONY:{ title:'🌿 고사리형', desc:'상황에 따라 감정과 논리를 조율하는 균형 감각!', quote:'“빛과 그늘이 모두 있어야 초록이 진해진다.”', tips:['빠른 감정 전환 인정','호흡과 쉼으로 리셋'] },
  BALANCE:{ title:'☁️ 균형몽실형', desc:'감정과 논리를 고르게 쓰는 부드러운 중재자.', quote:'“균형은 마음의 기술.”', tips:['생각↔느낌 5분 루틴','균형 시그널 체크'] }
};
function finish(){
  card.style.display='none'; barFill.style.width='100%';
  const type = classify(score); const c = PLANTS[type];
  const html=`<div class="result-card">
      <div class="result-hero">
        <img src="../assets/plant.png" alt="식물 아이콘">
        <div>
          <div class="result-title">${c.title}</div>
          <div class="result-desc">${c.quote}</div>
        </div>
      </div>
      <p>${c.desc}</p>
      <div style="margin-top:8px">${c.tips.map(t=>`<div class="pill">${t}</div>`).join('')}</div>
      <div class="result-actions">
        <a class="start" href="../index.html">메인으로</a>
        <button class="start" onclick="location.reload()">다시 테스트</button>
      </div>
    </div>`;
  resultBox.innerHTML=html; resultBox.style.display='block';
}
render();
