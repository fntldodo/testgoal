// v2025.1 — 관계/콜드리딩 감지력 (관찰·언어·공감 균형)
document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    "상대의 말 속 ‘애매한 여지’를 빠르게 포착한다.",
    "겉표정보다 문맥/상황의 변화를 같이 본다.",
    "상대가 강조한 단어/어투의 방향을 기억한다.",
    "추측을 말하기 전 ‘제가 틀릴 수도 있어요’를 덧붙인다.",
    "무의미한 일반론 대신 구체 예시로 확인한다.",
    "상대의 가치·경계를 침범하지 않도록 질문을 고른다.",
    "상대의 목표/두려움을 가늠하고 표현을 조절한다.",
    "정보가 적을 때는 결론 대신 가설로 남겨둔다.",
    "한 번 들은 이야기라도 맥락이 바뀌면 업데이트한다.",
    "말하지 않은 것(침묵, 회피)의 신호를 기록한다.",
    "사실·감정·해석을 분리해서 듣고 다시 묻는다.",
    "상대의 장점 프레이밍으로 피드백을 시작한다.",
    "애매함을 견디며 추가 정보 수집을 제안한다.",
    "상대의 언어를 그대로 거울처럼 반사해 확인한다.",
    "예측이 빗나가면 즉시 수정·사과한다."
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
        const rt = Math.max(100, performance.now() - start);
        answers.push({v:c.v, rt});
        idx++;
        if (idx < Q.length) renderQ(); else finish();
      });
      choicesEl.appendChild(row);
    });
  }

  function finish(){
    pg.style.width = `100%`;
    const avgRt = answers.reduce((a,b)=>a+b.rt,0)/answers.length;
    const w = answers.map(a => {
      const bias = Math.max(0.8, Math.min(1.2, avgRt ? (avgRt / a.rt) : 1));
      return a.v * bias;
    });

    const raw = w.reduce((a,b)=>a+b,0) / (4 * Q.length);
    const pct = Math.round(raw * 100);

    let label, text, tips;
    if (pct >= 75){ label="높음"; text="문맥·언어·공감의 균형이 좋아요. 단, 과잉해석을 경계하면 더 단단해집니다."; tips=["확신 전 확인 질문","가설-검증 루프","경계 침범 주의"]; }
    else if (pct >= 50){ label="보통"; text="핵심은 잡지만 누락도 있어요. ‘거울 질문’과 요약 확인을 늘리면 정확도가 올라갑니다."; tips=["거울 질문 1회","요약 후 재확인","애매함 보류"]; }
    else { label="낮음"; text="정보가 모자란 상태에서 성급한 결론을 내지 않도록 ‘추가 정보→가설’ 순서를 훈련해요."; tips=["예시 요청 습관","가설과 결론 분리","침묵/회피 신호 기록"]; }

    percentEl.textContent = pct;
    labelEl.textContent = label;
    fill.style.width = `${pct}%`;
    desc.textContent = text;

    pills.innerHTML = '';
    [...tips, "마음 리마인드: 정확함보다 존중", "상대 언어를 먼저 비춘 뒤 해석"].forEach(t=>{
      const p = document.createElement('span');
      p.className = 'result-pill'; p.textContent = t; pills.appendChild(p);
    });

    document.querySelector('.test-card').style.display = 'none';
    result.style.display = '';
  }

  renderQ();
});
