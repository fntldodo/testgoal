/* ============================
 * 몽실이의 연애 스타일 테스트 (완전본)
 * - 응답 시간 기반 가중치 적용
 * - 동점/근소차(<=2) BALANCE 처리
 * - 이전/건너뛰기/되돌아가기 지원
 * ============================ */

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
const ans   = [];      // 선택 점수(0~3)
const times = [];      // 각 문항 응답 시간(초)
let startTime = Date.now();

const stepLabel = document.getElementById('stepLabel');
const barFill   = document.getElementById('barFill');
const qText     = document.getElementById('qText');
const wrap      = document.getElementById('choiceWrap');
const card      = document.getElementById('card');
const result    = document.getElementById('result');
const prevBtn   = document.getElementById('prev');
const skipBtn   = document.getElementById('skip');

// ------------------------ 렌더링 ------------------------
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

  // 이전 선택 표시 유지
  const prevSel = ans[idx];
  if (prevSel !== undefined) {
    Array.from(wrap.children).forEach(b=>{
      if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
    });
  }

  // 클릭 핸들러
  Array.from(wrap.children).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>choose(Number(btn.dataset.s)), 180);
    });
  });

  // 질문 시작 시각 기록
  startTime = Date.now();
}

// ------------------------ 선택/이동 ------------------------
function choose(s){
  const elapsed = (Date.now() - startTime) / 1000; // 초
  times[idx] = elapsed;

  const weight = getWeight(elapsed, QUESTIONS[idx].k);
  ans[idx] = s;

  // 되돌아왔을 수도 있으니 재계산 루틴 사용
  // 현재 idx 까지를 재합산
  score.E = score.S = score.C = score.I = 0;
  for (let i=0; i<=idx; i++) {
    const v = ans[i] ?? 0;
    const w = (i===idx) ? weight : getWeight(times[i] ?? 0, QUESTIONS[i].k);
    score[QUESTIONS[i].k] += v * w;
  }

  next();
}

function next(){
  idx++;
  if (idx < QUESTIONS.length) render();
  else finish();
}

prevBtn?.addEventListener('click', ()=>{
  if (idx === 0) return;
  idx--;
  recalcTo(idx);
  render();
});

skipBtn?.addEventListener('click', ()=>{
  ans[idx] = 0;
  times[idx] = (Date.now() - startTime) / 1000;
  next();
});

// idx 위치까지 점수 재계산
function recalcTo(pos){
  score.E = score.S = score.C = score.I = 0;
  for (let i=0; i<pos; i++) {
    const v = ans[i] ?? 0;
    const w = getWeight(times[i] ?? 0, QUESTIONS[i].k);
    score[QUESTIONS[i].k] += v * w;
  }
}

// ------------------------ 가중치 로직 ------------------------
/* 
  응답시간 가중치 기본값:
  - <1s : 0.7 (즉흥)
  - <4s : 1.0 (보통)
  - <8s : 1.2 (신중)
  - ≥8s : 1.1 (매우 신중)

  + 항목별 성향 보정(선택사항):
  - E/C(표현·교류) 문항을 "빠르게" 답하면 1.05배
  - I/S(자율·안정) 문항을 "느리게(≥4s)" 답하면 1.05배
*/
function getWeight(sec, key){
  let w;
  if (sec < 1) w = 0.7;
  else if (sec < 4) w = 1.0;
  else if (sec < 8) w = 1.2;
  else w = 1.1;

  // 미세 보정
  if ((key==='E' || key==='C') && sec < 2) w *= 1.05;
  if ((key==='I' || key==='S') && sec >= 4) w *= 1.05;

  return Number(w.toFixed(3));
}

// ------------------------ 분류/결과 ------------------------
/* 동점/근소차(<=2) → BALANCE */
function classify(sc){
  const arr = Object.entries(sc).sort((a,b)=>b[1]-a[1]);
  const [k1,v1] = arr[0];
  const [,v2]  = arr[1];
  const diff = v1 - v2;

  if (diff <= 2) return 'BALANCE';
  if (k1 === 'S') return 'DODO';             // 안정/신뢰
  if (k1 === 'I') return 'JAYU';             // 자율/공간
  if (k1 === 'E' || k1 === 'C') return 'POGEUN'; // 표현/교류
  return 'BALANCE';
}

const DESCRIPTIONS = {
  POGEUN: {
    title:'💖 포근몽실형',
    text :'따뜻함의 결정체! 사랑을 적극적으로 표현하고 상대의 마음을 잘 읽는 감정형 연애 스타일.',
    quote:'"사랑은 말로도, 눈빛으로도 충분히 전해져요 ☁️"'
  },
  DODO: {
    title:'🌸 도도몽실형',
    text :'겉보기엔 조용하지만, 속은 깊고 진심이 가득한 타입. 신뢰가 쌓이면 누구보다 따뜻해요.',
    quote:'"속도는 느려도 진심은 깊어요 🌷"'
  },
  JAYU: {
    title:'🐬 자유몽실형',
    text :'연애도 인생도 유쾌하게! 구속보다 자유를 존중하는 타입. 재치 있고 상쾌한 공기 메이커.',
    quote:'"서로 자유로울 때 사랑이 자라요 💫"'
  },
  BALANCE: {
    title:'☁️ 균형몽실형',
    text :'감정과 이성을 조화롭게 다루는 밸런스형. 상황에 따라 주도와 배려를 오가는 타입.',
    quote:'"사랑은 밀당보다 리듬 맞추기 🎵"'
  }
};

function finish(){
  card.style.display = 'none';
  barFill.style.width = '100%';

  const type = classify(score);
  const desc = DESCRIPTIONS[type];

  const avgTime = times.length
    ? (times.reduce((a,b)=>a+b,0)/times.length).toFixed(1)
    : '0.0';

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

      <div style="margin:10px 0 6px; font-size:13px; color:var(--text-soft)">
        평균 응답 시간: <b>${avgTime}s</b>
      </div>

      <div class="result-actions">
        <a class="start" href="../index.html">메인으로</a>
        <button class="start" onclick="location.reload()">다시 테스트</button>
      </div>
    </div>`;
  result.style.display = 'block';
}

// 시작
render();