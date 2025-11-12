// v2025.1 — 관계 경계 점검 (관계 속 나의 경계는 단단할까?)
document.addEventListener('DOMContentLoaded', () => {
  // 15문항: '경계가 흔들리는 신호' 중심 (높을수록 경계 취약도 ↑)
  const Q = [
    "그 사람과 대화 후 내 판단이 틀린 것 같다는 생각이 든다.",
    "‘내가 너무 예민한가?’라는 의심이 자주 든다.",
    "사소한 문제도 내 탓 같아 사과부터 하게 된다.",
    "불편함을 말하면 분위기가 더 나빠질까 걱정된다.",
    "그 사람의 기분이 내 하루 컨디션을 좌우한다.",
    "내가 본 사실보다 그 사람의 말이 더 맞는 것처럼 느껴진다.",
    "경계를 말로 표현해도 잘 지켜지지 않는다.",
    "중요한 결정에서 내 의견이 일관되게 묵살된 경험이 있다.",
    "대화를 마치면 이유 없이 기운이 빠지거나 배가 고프다.",
    "과거 상처가 그 사람 앞에서 더 크게 살아난다.",
    "불편함을 말하면 ‘너가 과장한다’는 반응을 들었다.",
    "내가 느낀 감정·해석을 스스로 자주 의심한다.",
    "관계가 깨질까 봐 ‘싫다’는 말을 보류한다.",
    "도움/배려 뒤에 은근한 빚짐 느낌이 남는다.",
    "그 사람 앞에서 말투/표정이 평소와 많이 달라진다."
  ];

  const CHOICES = [
    {v:0, t:"전혀 아니다"},
    {v:1, t:"거의 아니다"},
    {v:2, t:"보통"},
    {v:3, t:"그런 편이다"},
    {v:4, t:"매우 그렇다"}
  ];

  const qText = document.getElementById('qText');
  const choicesEl = document.getElementById('choices');
  const qNow = document.getElementById('qNow');
  const pg = document.getElementById('pg');

  const result = document.getElementById('result');
  const percentEl = document.getElementById('percent');
  const labelEl = document.getElementById('label');
  const fill = document.getElementById('fill');
  const desc = document.getElementById('desc');
  const pills = document.getElementById('pills');

  let idx = 0;
  let answers = [];

  function renderQ(){
    qText.textContent = Q[idx];
    qNow.textContent = (idx+1);
    pg.style.width = `${((idx)/Q.length)*100}%`;

    choicesEl.innerHTML = '';
    CHOICES.forEach(c => {
      const row = document.createElement('div');
      row.className = 'choice';
      row.innerHTML = `<span>${c.t}</span><button type="button">선택</button><small>${c.v}</small>`;
      const t0 = performance.now();
      row.querySelector('button').addEventListener('click', () => {
        const rt = Math.max(100, performance.now() - t0); // ms
        answers.push({v:c.v, rt});
        idx++;
        if (idx < Q.length) renderQ(); else finish();
      });
      choicesEl.appendChild(row);
    });
  }

  function finish(){
    pg.style.width = `100%`;
    // 응답시간 가중치 ±20% (빠르면 가산, 느리면 감산) — 캡핑
    const avgRt = answers.reduce((a,b)=>a+b.rt,0)/answers.length;
    const weighted = answers.map(a => {
      const bias = Math.max(0.8, Math.min(1.2, avgRt ? (avgRt / a.rt) : 1));
      return a.v * bias;
    });

    // 확률(%) — 높을수록 경계가 흔들리는 경향 ↑
    const raw = weighted.reduce((a,b)=>a+b,0) / (4 * Q.length); // 0~1
    const pct = Math.round(raw * 100); // 0~100

    // 라벨 · 설명 · 팁
    let label, text, tips;
    if (pct >= 75){
      label = "경계 취약 (주의)";
      text = "관계 안전지대가 좁아져 있습니다. 감정·기억을 다시 확인하고, 작은 경계부터 회복하세요.";
      tips = ["감정-사실-해석 분리 메모", "경계 문장 연습(“지금은 힘들어요”)", "신뢰 인물과 기록 공유"];
    } else if (pct >= 50){
      label = "혼합 단계";
      text = "흔들리는 순간이 보입니다. 불편 신호를 놓치지 말고, 작고 구체적인 요청부터 시작하세요.";
      tips = ["대화 후 감정체크 3문장", "요청은 구체·짧게", "중요 결정 서면 확인"];
    } else if (pct >= 30){
      label = "회복 진행";
      text = "감정과 경계를 구분하려는 시도가 보입니다. 지속적으로 ‘싫어요/잠시 멈춰요’를 연습해보세요.";
      tips = ["싫어요 연습(짧고 분명하게)", "피곤할 땐 대화 보류", "경계가 지켜지면 감사 피드백"];
    } else {
      label = "안정";
      text = "자기감정 신뢰가 분명합니다. 경계를 잘 지키고 있으며, 초기에 이상 신호를 점검하는 습관을 유지하세요.";
      tips = ["초기 신호 체크리스트", "경계가 지켜진 경험 기록", "지속 가능한 지지망 유지"];
    }

    percentEl.textContent = pct;
    labelEl.textContent = label;
    fill.style.width = `${pct}%`;
    desc.textContent = text;

    pills.innerHTML = '';
    [...tips, "마음 리마인드: ‘내 감정도 사실’", "불편함은 경계의 지도"].forEach(t=>{
      const p = document.createElement('span');
      p.className = 'result-pill';
      p.textContent = t;
      pills.appendChild(p);
    });

    document.querySelector('.test-card').style.display = 'none';
    result.style.display = '';
  }

  renderQ();
});
