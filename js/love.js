/* ===================================================
 * 몽실이의 연애 스타일 테스트 (5지선다 + 8유형)
 * ---------------------------------------------------
 * ✅ 선택 점수가 최우선 (0~4: 전혀/아니다/보통/그렇다/매우그렇다)
 * ✅ 응답 시간은 ±20% 이내 보조 가중치(선택 뒤엎지 않음)
 * ✅ 분류: 단일 4(E,C,S,I) + 조합 4(EC,ES,EI,CS,CI,IS) = 8유형
 * ✅ 강도 해석: 평균점수 5단계(매우 낮음 ~ 매우 높음)
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
const score  = {E:0, S:0, C:0, I:0};   // 가중 반영 누적점수(0~4 기준)
const counts = {E:0, S:0, C:0, I:0};   // 축별 응답 문항수
const ans    = [];                      // 각 문항 원점수(0~4)
const times  = [];                      // 각 문항 응답 시간(초)
let startTime = Date.now();

// DOM
const stepLabel=document.getElementById('stepLabel');
const barFill  =document.getElementById('barFill');
const qText    =document.getElementById('qText');
const wrap     =document.getElementById('choiceWrap');
const card     =document.getElementById('card');
const result   =document.getElementById('result');
const prevBtn  =document.getElementById('prev');
const skipBtn  =document.getElementById('skip');

/* -------------------- 렌더 -------------------- */
function render(){
  stepLabel.textContent = `${idx+1} / ${QUESTIONS.length}`;
  barFill.style.width   = `${(idx/QUESTIONS.length)*100}%`;
  qText.textContent     = QUESTIONS[idx].q;

  // 5지선다(0~4)
  wrap.innerHTML = `
    <button class="choice" data-s="4">매우 그렇다</button>
    <button class="choice" data-s="3">그렇다</button>
    <button class="choice" data-s="2">보통이다</button>
    <button class="choice ghost" data-s="1">아니다</button>
    <button class="choice ghost" data-s="0">전혀 아니다</button>
  `;

  // 이전 선택 표시 유지
  const prevSel = ans[idx];
  if(prevSel !== undefined){
    Array.from(wrap.children).forEach(b=>{
      if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
    });
  }

  // 클릭 핸들러
  Array.from(wrap.children).forEach(btn=>{
    btn.addEventListener('click',()=>{
      Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>choose(Number(btn.dataset.s)), 160);
    });
  });

  startTime = Date.now();
}

/* -------------------- 응답 처리 -------------------- */
function choose(s){
  const elapsed = (Date.now() - startTime) / 1000;
  times[idx] = elapsed;

  const k = QUESTIONS[idx].k;
  const w = getWeight(elapsed, k);         // 시간 보조 가중치(±20% 내)
  ans[idx] = s;

  // 선택 우선 + 시간은 보조: adjusted = s + s*(w-1)*0.2
  const adjusted = s + (s * (w - 1) * 0.2);
  score[k]  += adjusted;
  counts[k] += 1;

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
  // 스킵: 0점 처리(선택 안함), 시간만 기록
  ans[idx] = 0;
  times[idx] = (Date.now() - startTime) / 1000;
  next();
});

/* -------------------- 되돌아감 재계산 -------------------- */
function recalc(end){
  score.E=score.S=score.C=score.I=0;
  counts.E=counts.S=counts.C=counts.I=0;
  for(let i=0;i<end;i++){
    const s = ans[i] ?? 0;
    const k = QUESTIONS[i].k;
    const w = getWeight(times[i] ?? 0, k);
    const adjusted = s + (s * (w - 1) * 0.2);
    score[k]  += adjusted;
    counts[k] += 1;
  }
}

/* -------------------- 시간 가중치(보조) -------------------- */
function getWeight(sec, key){
  let w=1.0;
  if(sec < 1) w=0.85;
  else if(sec < 4) w=1.0;
  else if(sec < 8) w=1.15;
  else w=1.10;

  // 아주 미세한 축별 보정(선택 뒤엎지 않음)
  if((key==='E'||key==='C') && sec<2)  w *= 1.05; // 빠른 즉응=표현/교류에 살짝 +5%
  if((key==='I'||key==='S') && sec>=4) w *= 1.05; // 신중/안정적 응답에 +5%

  return Number(w.toFixed(2));
}

/* -------------------- 8유형 분류 -------------------- */
/*
  규칙:
  1) 축 점수 내림차순 → top1(k1,v1), top2(k2,v2)
  2) top1 - top2 격차가 충분(DIFF_STRICT)이면 단일형 k1_ONLY
  3) 아니면 top1+top2 조합형 (알파벳 정렬로 CE/ES/EI/CS/CI/IS)
  ※ 균형형(BALANCE) 없음
*/
const DIFF_STRICT = 3.0; // 단일형으로 볼 최소 격차(튜닝 가능)

function classify(sc){
  const arr = Object.entries(sc).sort((a,b)=>b[1]-a[1]);
  const [k1,v1] = arr[0];
  const [k2,v2] = arr[1];
  const diff = v1 - v2;

  if(diff >= DIFF_STRICT) return `${k1}_ONLY`;
  return [k1,k2].sort().join(''); // CE/ES/EI/CS/CI/IS
}

/* -------------------- 강도 해석(5단계) -------------------- */
function interpretLevel(avg){ // avg: 0~4
  if(avg >= 3.7) return {label:'매우 높음', tone:'result-very-high'};
  if(avg >= 3.0) return {label:'높음',     tone:'result-high'};
  if(avg >= 2.0) return {label:'중간',     tone:'result-mid'};
  if(avg >= 1.0) return {label:'낮음',     tone:'result-low'};
  return {label:'매우 낮음', tone:'result-very-low'};
}

/* -------------------- 카피/설명 -------------------- */
const TYPE_COPY = {
  // 단일형 4
  E_ONLY: { title:'💗 표현 스파크형',
    quote:'"마음은 전할 때 살아난다!"',
    text :'감정 표현/애정 피드백이 빠르고 확실한 타입. 관계의 온도를 올리는 리드 플레이어.' },
  C_ONLY: { title:'🤝 공감 네비게이터형',
    quote:'"너의 리듬을 먼저 듣는다."',
    text :'상대의 감정 신호를 잘 캐치하고 조율하는 협력가. 대화와 케어에 강점.' },
  S_ONLY: { title:'🧭 신뢰 앵커형',
    quote:'"꾸준함이 사랑을 지킨다."',
    text :'일관성과 책임감을 중시. 약속·경계·루틴을 통해 안정적인 관계를 만든다.' },
  I_ONLY: { title:'🕊️ 자유 바람형',
    quote:'"숨 쉴 공간이 사랑을 오래가게 한다."',
    text :'자율성과 속도 조절을 중시. 서로의 개별성 존중이 관계 만족의 핵심.' },

  // 조합형 6 (정렬키 사용: CE, ES, EI, CS, CI, IS)
  CE: { title:'💞 따뜻한 커뮤니케이터형 (E+C)',
    quote:'"마음은 나누고 귀는 열고."',
    text :'표현과 공감의 투톱. 빠른 애정표현 + 섬세한 경청으로 관계 온도를 높인다.' },
  ES: { title:'🌷 다정한 신뢰 빌더형 (E+S)',
    quote:'"따뜻함을 꾸준히."',
    text :'표현력과 안정감의 조합. 애정표현을 일관된 행동으로 증명하는 스타일.' },
  EI: { title:'🎈 유쾌한 독립형 (E+I)',
    quote:'"함께여도 가볍게, 가볍지만 진심."',
    text :'표현은 적극적이되 구속은 싫은 타입. 밝고 자유로운 에너지로 리듬을 맞춘다.' },
  CS: { title:'🫶 온정적 수호자형 (C+S)',
    quote:'"마음을 지키는 방법을 안다."',
    text :'공감 + 신뢰의 단단함. 안정적인 애착과 돌봄으로 관계를 단단히 붙잡는다.' },
  CI: { title:'🌤️ 배려적 독립형 (C+I)',
    quote:'"서로의 거리도 존중이야."',
    text :'공감하지만 의존은 최소화. 섬세한 배려와 건강한 거리 두기를 균형 있게 사용.' },
  IS: { title:'🌿 차분한 파트너십형 (I+S)',
    quote:'"느리지만 견고하게."',
    text :'자율과 안정의 합. 과장 없이 담백하고 오래 가는 팀플레이어.' }
};

/* -------------------- 보조 UI: 축별 미터 -------------------- */
function axisMeters(){
  const keys = ['E','C','S','I'];
  return keys.map(k=>{
    const maxPerItem = 4; // 5지선다 최댓값
    const totalMax   = (counts[k] || 0) * maxPerItem;
    const raw        = score[k];
    const pct        = totalMax ? Math.round((raw / totalMax) * 100) : 0;
    const name = {E:'표현', C:'교류', S:'안정', I:'자율'}[k];
    return `
      <div style="margin:8px 0">
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${name}</span><span>${pct}%</span>
        </div>
        <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
          <span style="display:block;height:100%;width:${pct}%;background:var(--mint-500)"></span>
        </div>
      </div>
    `;
  }).join('');
}

/* -------------------- 결과 출력 -------------------- */
function finish(){
  card.style.display='none';
  barFill.style.width='100%';

  // 최종 유형
  const typeKey = classify(score);
  const info = TYPE_COPY[typeKey] || {
    title:'☁️ 몽실형', quote:'"함께 맞춰가요."', text:'데이터가 적어요. 한 번 더 시도해볼까요?'
  };

  // 전체 평균(0~4)
  const answered = ans.filter(v=>v!==undefined).length || 1;
  const totalAdj = Object.values(score).reduce((a,b)=>a+b,0);
  const avgAll   = totalAdj / answered; // 0~4 스케일
  const level    = interpretLevel(avgAll);

  const avgTime = times.length
    ? (times.reduce((a,b)=>a+b,0)/times.length).toFixed(1) : '0.0';

  result.innerHTML = `
    <div class="result-card">
      <div class="result-hero">
        <img src="../assets/love.png" alt="연애 캐릭터" onerror="this.style.display='none'">
        <div>
          <div class="result-title">${info.title}</div>
          <div class="result-desc">${info.quote}</div>
          <div class="pill" style="margin-top:6px">표현 강도: <b>${level.label}</b> (${avgAll.toFixed(1)}점)</div>
        </div>
      </div>

      <p style="margin:10px 0">${info.text}</p>
      <div style="margin-top:8px">${axisMeters()}</div>

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

/* -------------------- 시작 -------------------- */
render();