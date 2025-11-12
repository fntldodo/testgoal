// v2025.1 — 관계/가해 성향 (가스라이팅 하는 쪽) 확률 계산
document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    "상대가 불편하다고 말하면, ‘그건 네가 예민해서 그래’라는 생각이 든다.",
    "내가 한 말을 상대가 기억 못 하면, ‘그땐 분명 그랬다’며 강하게 확신을 준다.",
    "상대의 감정보다 ‘사실’과 ‘논리’로 설득하려는 편이다.",
    "대화에서 내가 정답을 알고 있다고 느끼는 편이다.",
    "상대의 기억/인식을 ‘그건 잘못 기억하는 거야’라고 정정해 준다.",
    "상대가 싫다고 해도 ‘그건 너를 위한 거야’라고 설득해본 적이 있다.",
    "갈등 상황에서 사과보다 설명을 먼저 한다.",
    "내 기준에서 비합리적이면, 상대 감정은 잠시 제쳐두고라도 바로잡고 싶다.",
    "상대의 문제를 ‘고쳐주고’ 싶은 마음이 자주 든다.",
    "대화가 길어지면 결국 내 의견으로 정리되는 경우가 많다.",
    "상대가 힘들다 하면 ‘그 정도는 누구나 겪어’라고 비교하게 된다.",
    "관계에서 리드하고 조율하는 역할을 내가 맡는 편이다.",
    "상대의 표현이 과장되었다고 느끼는 경우가 많다.",
    "내 의도가 선하면 결과적 불편은 감수할 수 있다고 본다.",
    "상대가 지적할 때, ‘그건 오해야’라고 바로잡고 싶어진다."
  ];

  const CHOICES = [
    {v:0, t:"전혀 아니다"}, {v:1, t:"거의 아니다"},
    {v:2, t:"보통"}, {v:3, t:"그런 편이다"}, {v:4, t:"매우 그렇다"}
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
  let t0 = performance.now();

  function renderQ(){
    qText.textContent = Q[idx];
    qNow.textContent = (idx+1);
    pg.style.width = `${((idx)/Q.length)*100}%`;

    choicesEl.innerHTML = '';
    CHOICES.forEach(c => {
      const row = document.createElement('div');
      row.className = 'choice';
      row.innerHTML = `<span>${c.t}</span><button type="button">선택</button><small>${c.v}</small>`;
      const start = performance.now();
      row.querySelector('button').addEventListener('click', () => {
        const rt = Math.max(100, performance.now() - start); // ms
        answers.push({v:c.v, rt});
        idx++;
        if (idx < Q.length) renderQ(); else finish();
      });
      choicesEl.appendChild(row);
    });
  }

  function finish(){
    pg.style.width = `100%`;
    // 응답시간 가중: 각 항목에 대해 평균 RT 대비 ±20% 범위로 보정
    const avgRt = answers.reduce((a,b)=>a+b.rt,0)/answers.length;
    const w = answers.map(a => {
      const bias = Math.max(0.8, Math.min(1.2, avgRt ? (avgRt / a.rt) : 1)); // 빠르면>1, 느리면<1 (±20% 한계)
      return a.v * bias;
    });

    const raw = w.reduce((a,b)=>a+b,0) / (4 * Q.length); // 0~1
    const pct = Math.round(raw * 100);

    // 라벨/설명
    let label, text, tips;
    if (pct >= 75){ label="높음(주의)"; text="대화의 방향이 ‘사실·논리’ 중심으로만 굳어지면, 상대의 주관적 경험은 소거되기 쉬워요."; tips=["상대 감정 먼저 요약","사실보다 영향 묻기","‘내가 틀릴 수도’ 여지 남기기"]; }
    else if (pct >= 50){ label="중간"; text="의도는 선하지만, 때때로 상대 감정·기억을 정정하려는 경향이 보일 수 있어요."; tips=["사실 확인 전 감정 공감","기억 차이는 병치","설명 전 질문 1개"]; }
    else { label="낮음"; text="상대의 해석을 존중하려는 태도가 기본값이에요. 단, 모호할 땐 기준 합의가 필요해요."; tips=["공감 후 기준합의","요약-확인-제안 순서","‘괜찮아?’ 반복 대신 구체 질문"]; }

    percentEl.textContent = pct;
    labelEl.textContent = label;
    fill.style.width = `${pct}%`;
    desc.textContent = text;

    pills.innerHTML = '';
    [...tips, "마음 리마인드: 선의도=만능 아님", "존중이 먼저 오면 관계는 부드럽다"].forEach(t=>{
      const p = document.createElement('span');
      p.className = 'result-pill'; p.textContent = t; pills.appendChild(p);
    });

    document.querySelector('.test-card').style.display = 'none';
    result.style.display = '';
  }

  renderQ();
});
