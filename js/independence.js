/* ===================================================
 * 자립 지수 체크 — 몽실몽실 v2025.2 (마음 리마인드)
 * ---------------------------------------------------
 * - 5지선다(0~4) / 시간 가중치 ±20%(선택 우선)
 * - 균형(BALANCE) 과다 판정 방지:
 *   · BALANCE는 진짜로 세 축이 모두 비슷할 때만 (희귀)
 *   · 상위 2축 하이브리드 3종 도입: RD, RC, DC
 * - 결과 카드: 제목/인용문/설명/감정상태 요약/마음 리마인드/상태 미터/버튼
 * - 퍼센트 노출은 허용하되 상태 라벨이 주도(숫자=보조)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
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

  // 상태
  let idx = 0;
  const score = {R:0, D:0, E:0};     // 가중 누적
  const count = {R:0, D:0, E:0};
  const ans   = [];                   // 0~4
  const times = [];                   // 초
  let startTime = Date.now();

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

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if(prevSel !== undefined){
      [...wrap.children].forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click', ()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 150);
      });
    });

    startTime = Date.now();
  }

  function choose(s){
    const elapsed = (Date.now() - startTime)/1000;
    times[idx] = elapsed;

    const k = Q[idx].k;
    const w = getWeight(elapsed); // 0.8~1.2 (실제 반영은 20% 캡)
    ans[idx] = s;

    const adjusted = s + (s * (w - 1) * 0.2);
    score[k] += adjusted;
    count[k] += 1;

    next();
  }

  function next(){
    idx++;
    if(idx < Q.length) render();
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
    times[idx] = (Date.now()-startTime)/1000;
    next();
  });

  function recalc(end){
    score.R=score.D=score.E=0;
    count.R=count.D=count.E=0;
    for(let i=0;i<end;i++){
      const s = ans[i] ?? 0;
      const k = Q[i].k;
      const w = getWeight(times[i] ?? 0);
      const adjusted = s + (s * (w - 1) * 0.2);
      score[k]+= adjusted;
      count[k]+= 1;
    }
  }

  // 시간 보조 가중(선택 우선)
  function getWeight(sec){
    if(sec < 1)  return 0.9;   // 너무 빠른 반응은 -10%
    if(sec < 4)  return 1.0;   // 정상
    if(sec < 8)  return 1.15;  // 숙고 +
    return 1.10;               // 과도 숙고는 약 +10%
  }

  /* ------------ 분류 로직 (BALANCE 억제) --------------- */
  // 정규화: 축별 평균(0~4)을 0~1로
  function normalized(){
    const avgR = (score.R / Math.max(1, count.R)) / 4;
    const avgD = (score.D / Math.max(1, count.D)) / 4;
    const avgE = (score.E / Math.max(1, count.E)) / 4;
    return {R:clamp(avgR,0,1), D:clamp(avgD,0,1), E:clamp(avgE,0,1)};
  }
  function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

  function classify(){
    const n = normalized();
    const arr = Object.entries(n).sort((a,b)=>b[1]-a[1]); // desc
    const [k1,v1] = arr[0], [k2,v2] = arr[1], [k3,v3] = arr[2];
    const diff12 = v1 - v2;
    const spread = v1 - v3;

    // 1) 진짜 BALANCE: 모두 비슷 + 중간대역
    const allMid = (x)=> x>=0.35 && x<=0.65;
    if ((spread < 0.12) && allMid(n.R) && allMid(n.D) && allMid(n.E)) {
      return {type:'BALANCE', top:[k1,k2], n};
    }

    // 2) 상위 2축 하이브리드(접전)
    if (diff12 < 0.10) {
      const pair = [k1,k2].sort().join('');
      const map = { RD:'ROUTINE-DECIDER', RE:'ROUTINE-CALMER', DE:'DECIDER-CALMER' };
      return {type: map[pair] || 'ROUTINE-DECIDER', top:[k1,k2], n};
    }

    // 3) 단일형
    const singleMap = {R:'ROUTINE', D:'DECIDER', E:'CALMER'};
    return {type: singleMap[k1], top:[k1,k2], n};
  }

  /* ------------ 결과 카피 --------------- */
  const COPY = {
    'ROUTINE': {
      title:'🗓️ 루틴몽실형',
      quote:'“작은 루틴이 큰 평온을 만든다.”',
      desc:'계획과 습관으로 하루를 단단히 쌓는 타입. 일관성이 마음의 안전벨트가 되어, 컨디션이 흔들릴 때도 기본기로 복구합니다.',
      mood:['루틴 — 단단함','결정 — 안정적','평온 — 차분함'],
      remind:'오늘은 “15분 루틴” 하나만 지켜요. 완벽보다 지속! 체크 ✔︎'
    },
    'DECIDER': {
      title:'🧭 결정몽실형',
      quote:'“YES/NO 대신, 내 기준 한 줄.”',
      desc:'선호와 기준이 또렷한 주도형. 정보와 가치를 비교해 합리적으로 결정하고, 선택 이후 책임감 있게 밀고 갑니다.',
      mood:['루틴 — 유연함','결정 — 선명함','평온 — 적정'],
      remind:'선택 전, 기준 1줄을 적고 비교하세요. “나에게 맞는가?”'
    },
    'CALMER': {
      title:'🌿 평온몽실형',
      quote:'“감정은 없애는 게 아니라 다루는 것.”',
      desc:'감정의 물결 위에서도 중심을 잡는 타입. 호흡·걷기·수면 같은 기본 케어로 회복 탄력성을 유지합니다.',
      mood:['루틴 — 가볍게','결정 — 느긋하게','평온 — 높음'],
      remind:'오늘의 10분 리셋: 호흡 4-6 → 미지근한 물 한 잔 → 짧은 산책.'
    },
    'ROUTINE-DECIDER': {
      title:'🔧 루틴·결정 하이브리드',
      quote:'“정리하고, 정하고, 실행!”',
      desc:'루틴과 결정을 결합해 실행력이 좋은 조합. 계획→선택→완료의 흐름을 만들 때 가장 빛납니다.',
      mood:['루틴 — 높음','결정 — 높음','평온 — 보통'],
      remind:'오늘의 체크리스트 “3개만”: 중요·짧음·지금.'
    },
    'ROUTINE-CALMER': {
      title:'🌤️ 루틴·평온 하이브리드',
      quote:'“잔잔하지만 꾸준하게.”',
      desc:'부담을 낮춘 루틴으로 평온을 키우는 조합. 가벼운 반복이 마음 회복에 큰 힘이 됩니다.',
      mood:['루틴 — 잔잔함','결정 — 담백함','평온 — 높음'],
      remind:'루틴의 난이도를 80%로 낮추고, “성공 경험”을 쌓아보세요.'
    },
    'DECIDER-CALMER': {
      title:'🫶 결정·평온 하이브리드',
      quote:'“내 속도, 내 선택.”',
      desc:'감정에 휘둘리기보다 기준과 속도를 맞추는 조합. 회복을 고려한 의사결정이 장점입니다.',
      mood:['루틴 — 가볍게','결정 — 선명함','평온 — 안정'],
      remind:'선택 전 30초 정지: “지금 내 몸은 어떤가?”를 먼저 점검.'
    },
    'BALANCE': {
      title:'☁️ 균형몽실형 (레어)',
      quote:'“균형은 작은 습관의 합.”',
      desc:'세 축이 고르게 발달한 유연형. 상황에 맞게 토글 전환이 가능하나, 과부하 신호를 놓치지 않는 것이 포인트.',
      mood:['루틴 — 균형','결정 — 균형','평온 — 균형'],
      remind:'분기별 “업데이트 데이”: 루틴/결정/평온을 1가지씩만 조정.'
    }
  };

  function stateLabel(p){ // 0~100
    if(p>=76) return '높음';
    if(p>=56) return '적정';
    if(p>=36) return '보통';
    if(p>=21) return '낮음';
    return '아주 낮음';
  }

  function meters(n){ // n: 0~1
    const asPct = (v)=> Math.round(v*100);
    const items = [
      {k:'R', name:'루틴', val:asPct(n.R)},
      {k:'D', name:'결정', val:asPct(n.D)},
      {k:'E', name:'평온', val:asPct(n.E)},
    ];
    return items.map(it=>`
      <div style="text-align:left;margin:6px 0">
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${it.name} — ${stateLabel(it.val)}</span>
          <span>${it.val}%</span>
        </div>
        <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
          <span style="display:block;height:100%;width:${it.val}%;background:var(--mint-500)"></span>
        </div>
      </div>
    `).join('');
  }

  function finish(){
    card.style.display = 'none';
    barFill.style.width = '100%';

    const result = classify();
    const info   = COPY[result.type] || COPY['BALANCE'];

    // 감정 상태 요약(짧은 2줄 느낌)
    const moodSummary = `• ${info.mood[0]}  • ${info.mood[1]}  • ${info.mood[2]}`;

    const html = `
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/independence.png" alt="자립 캐릭터" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:8px 0">${info.desc}</p>

        <div class="pill" style="margin:8px 0 2px">${moodSummary}</div>
        <div class="mind-remind" style="margin:6px 0 10px;color:var(--text-soft)">
          <b>🌿 마음 리마인드:</b> ${info.remind}
        </div>

        <div style="margin-top:8px">
          ${meters(result.n)}
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