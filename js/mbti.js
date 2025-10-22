// 몽실 MBTI (12문항, 4지선다·중립 없음)
// 각 문항은 EI / SN / TF / JP 축 중 하나에 기여. 동의 강도가 높을수록 첫 글자 쪽으로 가중.
const Q = [
  // E–I (3)
  { t:"EI", p:+1, q:"처음 보는 사람과도 금방 대화를 시작하는 편이다." },
  { t:"EI", p:-1, q:"모임보다 혼자 쉬는 시간이 에너지 회복에 더 좋다." },
  { t:"EI", p:+1, q:"즉흥적인 만남이나 제안을 부담 없이 수락한다." },

  // S–N (3)
  { t:"SN", p:+1, q:"아이디어를 떠올릴 때 현실 적용 여부보다 가능성 자체가 더 흥미롭다." },
  { t:"SN", p:-1, q:"새로운 방식을 시도하기보다 검증된 절차를 선호한다." },
  { t:"SN", p:+1, q:"상세 규정보다 큰 흐름과 콘셉트가 더 중요하다고 느낀다." },

  // T–F (3)
  { t:"TF", p:+1, q:"의사결정에서 논리적 일관성이 공감보다 우선이다." },
  { t:"TF", p:-1, q:"상대의 감정이 상할 수 있으면 다소 비합리적이어도 양보한다." },
  { t:"TF", p:+1, q:"대화를 정리할 때 근거, 기준, 원칙을 자주 언급한다." },

  // J–P (3)
  { t:"JP", p:+1, q:"할 일은 미리 계획하고 일정대로 끝내는 편이다." },
  { t:"JP", p:-1, q:"계획대로 흘러가기보다 상황에 맞춰 유연하게 바꾸는 편이다." },
  { t:"JP", p:+1, q:"마감이 멀어도 일찍 시작해 여유 있게 진행하는 편이다." },
];

// 점수 컨테이너 (각 축 0~최대 9)
const score = { EI:0, SN:0, TF:0, JP:0 };
let idx = 0;
const ans = []; // 각 문항 선택 기록 (되돌리기/스킵 처리용)

// DOM
const stepLabel = document.getElementById("stepLabel");
const barFill   = document.getElementById("barFill");
const qText     = document.getElementById("qText");
const card      = document.getElementById("card");
const resultBox = document.getElementById("result");
const choices   = Array.from(document.querySelectorAll(".choice"));
const prevBtn   = document.getElementById("prev");
const skipBtn   = document.getElementById("skip");

// 0~3 점수를 +1 방향 혹은 -1 방향으로 변환
function applyScore(dim, polarity, raw){
  // 동의 강도: 3 매우그렇다 / 2 그렇다 / 1 아니다 / 0 전혀아니다
  // p: +1(문항 동의=앞글자), -1(문항 동의=뒷글자)
  // '아니다' 선택이면 동의 강도가 반대로 작용 → raw를 (3-raw)로 치환하여 일관된 처리
  const agree = raw;                   // 0~3
  const towardFront = polarity > 0 ? agree : (3 - agree);
  score[dim] += towardFront;           // 축 누적
}

// UI 갱신
function render(){
  const total = Q.length;
  stepLabel.textContent = `${idx+1} / ${total}`;
  barFill.style.width = `${((idx)/total)*100}%`;
  qText.textContent = Q[idx].q;
}

// 답변 선택
choices.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const raw = Number(btn.dataset.score); // 0~3
    // 되돌리기 대비 현재 문항 기록 저장
    ans[idx] = raw;
    applyScore(Q[idx].t, Q[idx].p, raw);
    nextStep();
  });
});

// 이전으로
prevBtn.addEventListener("click", ()=>{
  if(idx===0) return;
  // 이전 기록을 롤백하려면 점수를 일단 되감고 다시 계산
  resetScore();
  idx -= 1;
  for(let i=0;i<idx;i++){
    applyScore(Q[i].t, Q[i].p, ans[i] ?? 0);
  }
  render();
});

// 건너뛰기 (0점 처리)
skipBtn.addEventListener("click", ()=>{
  ans[idx] = 0;
  applyScore(Q[idx].t, Q[idx].p, 0);
  nextStep();
});

function nextStep(){
  idx += 1;
  if(idx < Q.length) render();
  else finish();
}

function resetScore(){
  score.EI=0; score.SN=0; score.TF=0; score.JP=0;
}

function finish(){
  barFill.style.width = "100%";
  card.style.display = "none";
  const type = decideType(score);
  const detail = TYPE_DESCRIPTIONS[type] || "편안하고 균형 잡힌 성향이에요.";
  const pills = dimsToPills(type).map(p=>`<span class="pill">${p}</span>`).join("");

  resultBox.innerHTML = `
    <div class="result">
      <h2 style="font-size:28px;margin-bottom:8px">당신의 MBTI는 <strong>${type}</strong></h2>
      <p style="margin-bottom:12px">${detail}</p>
      <div>${pills}</div>
      <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <a class="start" href="../index.html">메인으로</a>
        <button class="start ghost" onclick="history.back()">한 문항 돌아가기</button>
        <button class="start" onclick="restart()">다시 테스트</button>
      </div>
      <p class="note" style="margin-top:14px">* 자기보고식 성향 파악 도구이며, 임상적 진단을 대체하지 않습니다.</p>
    </div>
  `;
  resultBox.style.display = "block";
}

function restart(){
  idx=0; ans.length=0; resetScore();
  resultBox.style.display="none"; card.style.display="block";
  render();
}

// 축 점수를 MBTI 4글자로 변환
function decideType(sc){
  const EI = sc.EI >= 5 ? "E" : "I"; // 최대 9점 기준, 경계는 5로 설정
  const SN = sc.SN >= 5 ? "N" : "S";
  const TF = sc.TF >= 5 ? "T" : "F";
  const JP = sc.JP >= 5 ? "J" : "P";
  return EI+SN+TF+JP;
}

// 보조: 설명/태그
function dimsToPills(type){
  const map = {
    E:"외향(E)", I:"내향(I)", N:"직관(N)", S:"감각(S)", T:"사고(T)", F:"감정(F)", J:"판단(J)", P:"인식(P)"
  };
  return type.split("").map(ch=>map[ch]);
}

// 16유형 초간단 설명 (따뜻하고 간결하게)
const TYPE_DESCRIPTIONS = {
  ENFJ:"관계의 에너자이저. 사람을 연결하고 가능성을 키워요.",
  ENFP:"아이디어 스파크. 자유롭고 따뜻하게 변화를 이끕니다.",
  ENTJ:"명확한 리더십. 목표를 구조화해 성과로 만듭니다.",
  ENTP:"호기심 많은 도전자. 새 관점을 제시하며 유연합니다.",
  ESFJ:"정감 어린 케어러. 팀 분위기를 포근하게 돌봐요.",
  ESFP:"현장형 무드메이커. 즐거움 속에서 몰입합니다.",
  ESTJ:"실행력 있는 관리자. 원칙과 시스템을 중시합니다.",
  ESTP:"상황판독 고수. 즉각적 판단과 행동이 강점이에요.",
  INFJ:"의미 탐색가. 깊은 통찰로 사람을 돕습니다.",
  INFP:"따뜻한 이상가. 가치와 진정성을 소중히 여겨요.",
  INTJ:"전략 설계자. 장기 비전을 계획으로 구체화합니다.",
  INTP:"논리 탐구자. 개념을 정교하게 다듬어요.",
  ISFJ:"차분한 보호자. 성실함으로 안정감을 줍니다.",
  ISFP:"감성 실천가. 조용히 따뜻함을 전합니다.",
  ISTJ:"신뢰받는 실무가. 꼼꼼함과 책임감이 강점입니다.",
  ISTP:"분석형 해결사. 문제 핵심을 정확히 짚어요."
};

// 초기 렌더
render();
