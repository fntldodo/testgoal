/* ===================================================
 * MBTI 빠른 테스트 (12문항 · 5지선다 0~4 · 시간 가중치 ±20%)
 * - 선택 점수가 핵심, 응답시간은 보조(결과 뒤집지 않음)
 * - E/I, S/N, T/F, J/P 4축 → MBTI 16타입 산출
 * - 축별 미터는 3문항 × 최대 4점 = 12를 분모로 %
 * =================================================== */

const Q = [
  {k:'EI', a:'E', q:'사람 많은 자리에서 에너지가 오른다.'},
  {k:'EI', a:'I', q:'혼자 있는 시간이 꼭 필요하다.'},
  {k:'EI', a:'E', q:'처음 본 사람에게 먼저 말을 거는 편이다.'},

  {k:'SN', a:'S', q:'사실·경험이 중요하다. 추상은 다소 답답하다.'},
  {k:'SN', a:'N', q:'가능성과 아이디어를 이야기하는 게 즐겁다.'},
  {k:'SN', a:'S', q:'새 정보는 구체적인 예시가 있을 때 이해가 쉽다.'},

  {k:'TF', a:'T', q:'의사결정에서 논리/정확성이 우선이다.'},
  {k:'TF', a:'F', q:'사람들의 감정과 관계 영향을 먼저 본다.'},
  {k:'TF', a:'T', q:'논리적 모순을 보면 바로 잡고 싶다.'},

  {k:'JP', a:'J', q:'계획표/마감이 있어야 마음이 편하다.'},
  {k:'JP', a:'P', q:'상황 따라 즉흥적으로 움직이는 편이다.'},
  {k:'JP', a:'J', q:'할 일을 미리 정리하고 진행한다.'},
];

let idx = 0;
const score = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
const counts= {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0}; // 축별 문항 수(표시용)
const ans   = []; // 0~4
const times = []; // 초

// DOM
const stepLabel=document.getElementById('stepLabel');
const barFill  =document.getElementById('barFill');
const qText    =document.getElementById('qText');
const wrap     =document.getElementById('choiceWrap');
const card     =document.getElementById('card');
const result   =document.getElementById('result');
const prevBtn  =document.getElementById('prev');
const skipBtn  =document.getElementById('skip');

let startTime = Date.now();

/* ---------- 렌더 ---------- */
function render(){
  stepLabel.textContent = `${idx+1} / ${Q.length}`;
  barFill.style.width   = `${(idx/Q.length)*100}%`;
  qText.textContent     = Q[idx].q;

  // 5지선다(0~4)
  wrap.innerHTML = `
    <button class="choice" data-s="4">매우 그렇다</button>
    <button class="choice" data-s="3">그렇다</button>
    <button class="choice" data-s="2">보통이다</button>
    <button class="choice ghost" data-s="1">아니다</button>
    <button class="choice ghost" data-s="0">전혀 아니다</button>
  `;

  // 이전 선택 복원
  const prevSel = ans[idx];
  if(prevSel !== undefined){
    Array.from(wrap.children).forEach(b=>{
      if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
    });
  }

  // 클릭
  Array.from(wrap.children).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>choose(Number(btn.dataset.s)), 140);
    });
  });

  startTime = Date.now();
}

/* ---------- 응답 처리 ---------- */
function choose(s){
  const elapsed = (Date.now() - startTime)/1000;
  times[idx] = elapsed;

  const {a} = Q[idx];  // E/I/S/N/T/F/J/P 중 하나
  const w    = getWeight(elapsed); // 0.8~1.2

  ans[idx] = s;

  // 선택(핵심) + 시간(보조, 20% 캡)
  const adjusted = s + (s * (w - 1) * 0.2);

  score[a]  += adjusted;
  counts[a]  = (counts[a] ?? 0) + 1;

  next();
}

function next(){
  idx++;
  if(idx<Q.length) render();
  else finish();
}

prevBtn?.addEventListener('click', ()=>{
  if(idx===0) return;
  idx--;
  recalc(idx);
  render();
});

skipBtn?.addEventListener('click', ()=>{
  ans[idx]   = 0;
  times[idx] = (Date.now() - startTime)/1000;
  next();
});

/* ---------- 되돌아감 재계산 ---------- */
function recalc(end){
  for(const k of Object.keys(score)) score[k]=0;
  for(const k of Object.keys(counts)) counts[k]=0;

  for(let i=0;i<end;i++){
    const s = ans[i] ?? 0;
    const {a} = Q[i];
    const w = getWeight(times[i] ?? 0);
    const adjusted = s + (s * (w - 1) * 0.2);
    score[a] += adjusted;
    counts[a] = (counts[a] ?? 0) + 1;
  }
}

/* ---------- 시간 가중치(보조) ---------- */
function getWeight(sec){
  if(sec < 1)  return 0.9;   // 너무 빠른 반응은 -10%
  if(sec < 4)  return 1.0;   // 정상
  if(sec < 8)  return 1.15;  // 숙고
  return 1.1;                // 매우 길면 +10%
}

/* ---------- 타입 산출 ---------- */
function typeOf(sc){
  const EI = (sc.E>=sc.I)?'E':'I';
  const SN = (sc.S>=sc.N)?'S':'N';
  const TF = (sc.T>=sc.F)?'T':'F';
  const JP = (sc.J>=sc.P)?'J':'P';
  return EI+SN+TF+JP;
}

const BRIEF={
  ENFP:'🌈 아이디어 스파크러 — 자유와 사람, 둘 다 소중!',
  ENTP:'⚡ 변화를 즐기는 토론가 — 논리로 새판짜기',
  ENFJ:'☀️ 분위기 리더 — 사람을 연결하는 다정한 리더',
  ENTJ:'🚀 추진력 전략가 — 목표를 계획으로 바꾸는 사람',
  ESFP:'🎉 현장 텐션업 — 지금 이 순간을 즐기는 감각파',
  ESTP:'🏃 액션 플레어 — 생각보다 먼저 움직이는 해결사',
  ESFJ:'🤝 케어 코디 — 팀의 체온을 지키는 실용형 다정가',
  ESTJ:'📋 질서 설계자 — 시스템으로 안정 주는 실행가',
  INFP:'🌙 마음 디자이너 — 가치와 의미로 채우는 몽상가',
  INTP:'🧩 개념 탐험가 — 구조와 원리를 파헤치는 분석가',
  INFJ:'🌿 조용한 조율가 — 깊이와 방향을 제시하는 안내자',
  INTJ:'🛰️ 계획 건축가 — 장기 플랜에 강한 전략가',
  ISFP:'🍃 부드러운 실천가 — 따뜻하지만 자유로운 예술가',
  ISTP:'🛠️ 조용한 해결사 — 손으로 증명하는 분석 실용가',
  ISFJ:'🏠 든든한 보호자 — 신뢰와 성실의 디테일 장인',
  ISTJ:'🧭 원칙 수호자 — 규칙과 안정의 기준점'
};

/* ---------- 미터 ---------- */
function meter(L, Lv, R, Rv){
  // 각 축: 문항 3개 × 4(최대) = 12가 분모
  const lPct = Math.round((Lv/12)*100);
  const rPct = Math.round((Rv/12)*100);
  const leftBar  = `<span style="display:block;height:8px;width:${lPct}%;background:var(--mint-500)"></span>`;
  const rightBar = `<span style="display:block;height:8px;width:${rPct}%;background:var(--mint-400)"></span>`;
  return `
    <div style="background:#fff;border:1px solid var(--mint-200);border-radius:12px;padding:10px">
      <div style="display:flex;justify-content:space-between;font-weight:700">
        <span>${L}</span><span>${R}</span>
      </div>
      <div style="display:flex;gap:6px;align-items:center;margin-top:6px">
        <div style="flex:1;background:var(--mint-100);border-radius:999px;overflow:hidden">${leftBar}</div>
        <div style="flex:1;background:var(--mint-100);border-radius:999px;overflow:hidden;direction:rtl">${rightBar}</div>
      </div>
      <div style="display:flex;justify-content:space-between;color:var(--text-soft);font-size:12px;margin-top:4px">
        <span>${lPct}%</span><span>${rPct}%</span>
      </div>
    </div>`;
}

/* ---------- 결과 ---------- */
function finish(){
  card.style.display='none';
  barFill.style.width='100%';

  const code = typeOf(score);
  const brief = BRIEF[code] || '☁️ 균형형 구름 — 상황에 맞게 톤을 바꾸는 유연한 타입!';

  result.innerHTML = `
    <div class="result-card">
      <div class="result-hero">
        <img src="../assets/mbti.png" alt="MBTI 아이콘" onerror="this.style.display='none'">
        <div>
          <div class="result-title">나의 MBTI: <strong>${code}</strong></div>
          <div class="result-desc">${brief}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px">
        ${meter('E',score.E,'I',score.I)}
        ${meter('S',score.S,'N',score.N)}
        ${meter('T',score.T,'F',score.F)}
        ${meter('J',score.J,'P',score.P)}
      </div>

      <div class="result-actions">
        <a class="start" href="../index.html">메인으로</a>
        <button class="start" onclick="location.reload()">다시 테스트</button>
      </div>

      <p class="note" style="margin-top:10px">* 간단 버전입니다. 재미로 즐겨주세요 ☁️</p>
    </div>`;
  result.style.display='block';
}

/* ---------- 시작 ---------- */
render();
