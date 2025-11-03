/* ===================================================
 * 자립 지수 체크 (5지선다 + 시간 가중치 ±20%)
 * 축: R(루틴) D(결정) E(감정)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 15문항 (각 축 5문항)
  const Q = [
    {k:'R', q:'기상·취침 시간이 비교적 일정하다.'},
    {k:'R', q:'할 일/일정을 스스로 계획해 실행한다.'},
    {k:'R', q:'예산·지출을 기록하거나 관리한다.'},
    {k:'R', q:'작은 일도 마감 기한을 정해두면 잘 끝낸다.'},
    {k:'R', q:'정리정돈과 환경 정비를 자주 한다.'},

    {k:'D', q:'중요한 일의 최종 결정은 스스로 내리는 편이다.'},
    {k:'D', q:'원치 않는 부탁은 정중히 거절할 수 있다.'},
    {k:'D', q:'선호/가치를 분명히 알고 선택에 반영한다.'},
    {k:'D', q:'타인의 비판에도 내 기준을 쉽게 놓지 않는다.'},
    {k:'D', q:'정보를 모으고 비교해 합리적 결정을 내린다.'},

    {k:'E', q:'스트레스를 느껴도 호흡/휴식으로 진정시킨다.'},
    {k:'E', q:'감정이 격해져도 말투·행동을 조절하려 노력한다.'},
    {k:'E', q:'실수/실패를 오래 끌지 않고 학습으로 전환한다.'},
    {k:'E', q:'불안할 때 도움 요청이나 상담을 시도할 수 있다.'},
    {k:'E', q:'몸 컨디션(수면/식사/운동)으로 마음을 관리한다.'},
  ];

  let idx = 0;
  const score  = {R:0, D:0, E:0};  // 가중 합산
  const ans    = [];               // 0~4
  const times  = [];               // 응답시간(초)
  let startedAt = Date.now();

  // DOM
  const stepLabel = document.getElementById('stepLabel');
  const barFill   = document.getElementById('barFill');
  const qText     = document.getElementById('qText');
  const wrap      = document.getElementById('choiceWrap');
  const card      = document.getElementById('card');
  const resultBox = document.getElementById('result');
  const prevBtn   = document.getElementById('prev');
  const skipBtn   = document.getElementById('skip');

  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width   = `${(idx/Q.length)*100}%`;
    qText.textContent     = Q[idx].q;

    // 5지선다
    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;

    // 복원
    const prevSel = ans[idx];
    if (prevSel !== undefined){
      [...wrap.children].forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    // 클릭
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click', ()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 150);
      });
    });

    startedAt = Date.now();
  }

  function choose(sel){
    const elapsed = (Date.now() - startedAt)/1000;
    times[idx] = elapsed;

    const axis = Q[idx].k;
    const w = timeWeight(elapsed);      // 0.9 ~ 1.15
    const adjusted = sel + (sel * (w - 1) * 0.2); // 선택이 핵심, 시간은 보조(±20%캡)

    ans[idx]   = sel;
    score[axis]+= adjusted;

    next();
  }

  function next(){
    idx++;
    if(idx < Q.length) render();
    else finish();
  }

  prevBtn.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recompute(idx);
    render();
  });

  skipBtn.addEventListener('click', ()=>{
    ans[idx]   = 0;
    times[idx] = (Date.now()-startedAt)/1000;
    next();
  });

  function recompute(end){
    score.R=score.D=score.E=0;
    for(let i=0;i<end;i++){
      const sel = ans[i] ?? 0;
      const w   = timeWeight(times[i] ?? 0);
      const adj = sel + (sel * (w - 1) * 0.2);
      score[Q[i].k] += adj;
    }
  }

  function timeWeight(sec){
    if(sec < 1)  return 0.9;   // 너무 빠른 반응 소폭 -
    if(sec < 4)  return 1.0;   // 정상
    if(sec < 8)  return 1.15;  // 충분히 숙고 +
    return 1.1;                // 과도한 지연은 완만 +
  }

  // 분류 로직
  const CARDS = {
    ROUTINE: { title:'🗓️ 루틴몽실형', text:'계획·습관으로 하루를 단단히 쌓는 타입. 일관성이 곧 마음의 안전벨트!', quote:'"작은 루틴이 큰 평온을 만든다 — 오늘도 체크 ✔️"', tips:['쉬는 날용 미니 루틴','완벽보다 지속 — 80% 완료도 박수👏'] },
    DECIDER: { title:'🧭 결정몽실형', text:'선호와 기준이 또렷한 주도형. 선택의 순간, 나침반이 정확해요.', quote:'"YES/NO 대신, 나의 기준을 한 줄로!"', tips:['옵션 3개 이하','거절 문장 템플릿 만들기'] },
    CALMER : { title:'🌿 평온몽실형', text:'감정의 물결 위에서도 중심을 잡는 타입. 회복탄력성이 탁월해요.', quote:'"감정은 없애는 게 아니라 다루는 것 — 숨 길게, 물 한 잔."', tips:['수면·식사·걷기 루틴','감정 기록 3줄 메모'] },
    BALANCE:{ title:'☁️ 균형몽실형', text:'루틴·결정·감정이 고르게 발달. 유연함이 강점!', quote:'"균형은 작은 습관의 합."', tips:['분기 업데이트 데이','과부하 신호 체크'] }
  };

  const STRICT_DIFF = 3.5; // 상위-차상위 격차가 크면 '단일 성향 강함' 배지

  function classify(sc){
    const arr = Object.entries(sc).sort((a,b)=>b[1]-a[1]); // [[axis,val]...]
    const [k1,v1] = arr[0];
    const [k2,v2] = arr[1];
    const spread  = v1 - v2;
    if (spread <= 2.0) return {key:'BALANCE', badge:false};
    if (k1==='R') return {key:'ROUTINE', badge:spread>=STRICT_DIFF};
    if (k1==='D') return {key:'DECIDER', badge:spread>=STRICT_DIFF};
    return {key:'CALMER', badge:spread>=STRICT_DIFF};
  }

  function meter(label, value){
    // 축 최대치: 5문항 × 4점 = 20
    const pct = Math.round((value/20)*100);
    return `<div style="text-align:left;margin:6px 0">
      <div style="display:flex;justify-content:space-between;font-weight:700">
        <span>${label}</span><span>${pct}%</span>
      </div>
      <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
        <span style="display:block;height:100%;width:${pct}%;background:var(--mint-500)"></span>
      </div>
    </div>`;
  }

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';

    const {key, badge} = classify(score);
    const c = CARDS[key];

    const badgeHtml = badge ? `<div class="pill" style="margin-left:8px">단일 성향 강함</div>` : '';

    const html = `
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/independence.png" alt="자립 아이콘" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${c.title}</div>
            <div class="result-desc">${c.quote}</div>
            <div style="display:flex;gap:6px;margin-top:6px">
              ${badgeHtml}
            </div>
          </div>
        </div>

        <p style="margin-bottom:8px">${c.text}</p>
        ${meter('루틴',  score.R)}
        ${meter('결정',  score.D)}
        ${meter('감정',  score.E)}

        <div style="margin-top:8px">
          ${c.tips.map(t=>`<div class="pill">${t}</div>`).join('')}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;
    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
  }

  // 시작
  render();
});
