/* ===================================================
 * 몽실이의 연애 스타일 테스트 (최종 가중/균형 보정 버전)
 * ---------------------------------------------------
 * ✅ 선택 점수가 핵심
 * ✅ 응답 시간은 ±20% 이내에서 보조
 * ✅ 일관된 긍정/부정 응답은 BALANCE 불가
 * ✅ 정말 애매한 중간 점수만 BALANCE 처리
 * =================================================== */

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

let idx = 0;
const score = {E:0, S:0, C:0, I:0};
const ans = [];
const times = [];
let startTime = Date.now();

const stepLabel=document.getElementById('stepLabel');
const barFill=document.getElementById('barFill');
const qText=document.getElementById('qText');
const wrap=document.getElementById('choiceWrap');
const card=document.getElementById('card');
const result=document.getElementById('result');
const prevBtn=document.getElementById('prev');
const skipBtn=document.getElementById('skip');

/* -------------------- 질문 렌더 -------------------- */
function render(){
  stepLabel.textContent = `${idx+1} / ${QUESTIONS.length}`;
  barFill.style.width   = `${(idx/QUESTIONS.length)*100}%`;
  qText.textContent     = QUESTIONS[idx].q;
  wrap.innerHTML = `
    <button class="choice" data-s="3">매우 그렇다</button>
    <button class="choice" data-s="2">그렇다</button>
    <button class="choice ghost" data-s="1">아니다</button>
    <button class="choice ghost" data-s="0">전혀 아니다</button>
  `;

  const prevSel = ans[idx];
  if(prevSel!==undefined){
    Array.from(wrap.children).forEach(b=>{
      if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
    });
  }

  Array.from(wrap.children).forEach(btn=>{
    btn.addEventListener('click',()=>{
      Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>choose(Number(btn.dataset.s)),180);
    });
  });

  startTime = Date.now();
}

/* -------------------- 응답 처리 -------------------- */
function choose(s){
  const elapsed = (Date.now() - startTime) / 1000;
  times[idx] = elapsed;

  const weight = getWeight(elapsed, QUESTIONS[idx].k);
  ans[idx] = s;

  score[QUESTIONS[idx].k] += s + (s * (weight - 1) * 0.2);
  next();
}

function next(){
  idx++;
  if(idx < QUESTIONS.length) render();
  else finish();
}

prevBtn?.addEventListener('click', ()=>{
  if(idx===0) return;
  idx--;
  recalc(idx);
  render();
});
skipBtn?.addEventListener('click', ()=>{
  ans[idx]=0; next();
});

/* -------------------- 보조 계산 -------------------- */
function recalc(end){
  score.E=score.S=score.C=score.I=0;
  for(let i=0;i<end;i++){
    const v=ans[i]??0;
    const w=getWeight(times[i]??0, QUESTIONS[i].k);
    score[QUESTIONS[i].k]+=v + (v*(w-1)*0.2);
  }
}

/* -------------------- 시간 가중치 -------------------- */
function getWeight(sec,key){
  let w=1.0;
  if(sec < 1) w=0.8;
  else if(sec < 4) w=1.0;
  else if(sec < 8) w=1.15;
  else w=1.1;
  if((key==='E'||key==='C') && sec<2) w*=1.05;
  if((key==='I'||key==='S') && sec>=4) w*=1.05;
  return Number(w.toFixed(2));
}

/* -------------------- 분류 로직 -------------------- */
function classify(sc){
  const arr = Object.entries(sc).sort((a,b)=>b[1]-a[1]);
  const [k1,v1]=arr[0];
  const [,v2]=arr[1];
  const total = arr.reduce((a,b)=>a+b[1],0);
  const diff = v1 - v2;
  const ratio = v1 / ((total/4) || 1); // 평균 대비 강도

  // 🔹 진짜로 애매할 때만 균형
  if(diff <= 2 && ratio < 1.1) return 'BALANCE';

  // 🔹 모두 낮고 분포 고르다면 균형
  const allLow = Object.values(sc).every(v=>v < 10);
  if(allLow && diff < 3) return 'BALANCE';

  // 🔹 극단값 예외처리 (한쪽만 강할 때)
  if(v1 > 1.3 * v2 || ratio >= 1.15){
    if(k1==='S') return 'DODO';
    if(k1==='I') return 'JAYU';
    if(k1==='E'||k1==='C') return 'POGEUN';
  }

  // 기본값
  if(k1==='S') return 'DODO';
  if(k1==='I') return 'JAYU';
  if(k1==='E'||k1==='C') return 'POGEUN';
  return 'BALANCE';
}

/* -------------------- 결과 설명 -------------------- */
const DESCRIPTIONS={
  POGEUN:{
    title:'💖 포근몽실형',
    text:'따뜻함의 결정체! 사랑을 적극적으로 표현하고 상대의 마음을 잘 읽는 감정형 연애 스타일.',
    quote:'"사랑은 말로도, 눈빛으로도 충분히 전해져요 ☁️"'
  },
  DODO:{
    title:'🌸 도도몽실형',
    text:'겉보기엔 조용하지만 속은 깊고 진심이 가득한 타입. 신뢰가 쌓이면 누구보다 따뜻해요.',
    quote:'"속도는 느려도 진심은 깊어요 🌷"'
  },
  JAYU:{
    title:'🐬 자유몽실형',
    text:'연애도 인생도 유쾌하게! 구속보다 자유를 존중하는 타입. 재치 있고 상쾌한 공기 메이커.',
    quote:'"서로 자유로울 때 사랑이 자라요 💫"'
  },
  BALANCE:{
    title:'☁️ 균형몽실형',
    text:'감정과 이성을 조화롭게 다루는 밸런스형. 상황에 따라 주도와 배려를 오가는 타입.',
    quote:'"사랑은 밀당보다 리듬 맞추기 🎵"'
  }
};

/* -------------------- 결과 출력 -------------------- */
function finish(){
  card.style.display='none';
  barFill.style.width='100%';

  const type = classify(score);
  const desc = DESCRIPTIONS[type];
  const avgTime = times.length ? (times.reduce((a,b)=>a+b,0)/times.length).toFixed(1) : '0.0';

  result.innerHTML = `
    <div class="result-card">
      <div class="result-hero">
        <img src="../assets/love.png" alt="연애 캐릭터" onerror="this.style.display='none'">
        <div>
          <div class="result-title">${desc.title}</div>
          <div class="result-desc">${desc.quote}</div>
        </div>
      </div>
      <p style="margin:8px 0">${desc.text}</p>
      <div style="margin:10px 0;font-size:13px;color:var(--text-soft)">
        평균 응답 시간: <b>${avgTime}s</b>
      </div>
      <div class="result-actions">
        <a class="start" href="../index.html">메인으로</a>
        <button class="start" onclick="location.reload()">다시 테스트</button>
      </div>
    </div>
  `;
  result.style.display='block';
}

render();