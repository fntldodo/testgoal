/* ===================================================
 * 자립 지수 체크 — 몽실몽실 v2025.3 (마음 리마인드 안정형)
 * ---------------------------------------------------
 * [코드 절대 규칙 적용]
 * 1) 기존 기능은 삭제/덮어쓰기/생략 금지.
 * 2) 변경은 추가 우선, 중복 제거는 사전 확인 후.
 * ---------------------------------------------------
 * - 5지선다(0~4) / 응답시간 보조 ±20%(선택 우선)
 * - BALANCE 남발 방지: spread<0.12 & 3축 0.35~0.65 한정
 * - 결과 안전화: classify·finish Fallback 보강
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

  // 상태값
  let idx = 0, startTime = Date.now();
  const score = {R:0, D:0, E:0};
  const count = {R:0, D:0, E:0};
  const ans   = Array(Q.length).fill(undefined);
  const times = Array(Q.length).fill(0);

  // DOM
  const stepLabel = document.getElementById('stepLabel');
  const barFill   = document.getElementById('barFill');
  const qText     = document.getElementById('qText');
  const wrap      = document.getElementById('choiceWrap');
  const card      = document.getElementById('card');
  const resultBox = document.getElementById('result');
  const prevBtn   = document.getElementById('prev');
  const skipBtn   = document.getElementById('skip');

  /* ---------- 질문 렌더 ---------- */
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
    if(prevSel!==undefined){
      [...wrap.children].forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click',()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),150);
      });
    });
    startTime = Date.now();
  }

  function getWeight(sec){
    if(sec < 1)  return 0.9;
    if(sec < 4)  return 1.0;
    if(sec < 8)  return 1.15;
    return 1.10;
  }

  function choose(s){
    const elapsed = (Date.now()-startTime)/1000;
    times[idx] = elapsed;
    const k = Q[idx].k, w = getWeight(elapsed);
    const adjusted = s + (s*(w-1)*0.2);
    ans[idx] = s;
    score[k]+= adjusted;
    count[k]+= 1;
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
    ans[idx]=0; times[idx]=(Date.now()-startTime)/1000;
    next();
  });

  function recalc(end){
    score.R=score.D=score.E=0; count.R=count.D=count.E=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0, k=Q[i].k, w=getWeight(times[i]??0);
      const adjusted=s + (s*(w-1)*0.2);
      score[k]+=adjusted; count[k]+=1;
    }
  }

  /* ---------- 분류 로직 (tie-break + balance 방지 + fallback) ---------- */
  function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
  function normalized(){
    const R=(score.R/Math.max(1,count.R))/4;
    const D=(score.D/Math.max(1,count.D))/4;
    const E=(score.E/Math.max(1,count.E))/4;
    return {R:clamp(R,0,1), D:clamp(D,0,1), E:clamp(E,0,1)};
  }

  function tieBreak(k1,k2){
    let bias=0;
    for(let i=Q.length-1; i>=0 && i>=Q.length-3; i--){
      const s=ans[i] ?? 0; const sec=times[i] ?? 3; const w=getWeight(sec);
      const axis=Q[i].k;
      if(axis===k1 && s>=3) bias += 1*w;
      if(axis===k2 && s>=3) bias -= 1*w;
      if(axis===k1 && s<=1) bias -= 0.5*w;
      if(axis===k2 && s<=1) bias += 0.5*w;
    }
    return bias>0 ? k1 : k2;
  }

  function classify(){
    const n=normalized();
    const arr=Object.entries(n).sort((a,b)=>b[1]-a[1]);
    let [k1,v1]=arr[0], [k2,v2]=arr[1], [k3,v3]=arr[2];
    const diff12=v1-v2, spread=v1-v3;
    const allMid=(x)=> x>=0.35 && x<=0.65;

    // (1) BALANCE 레어형
    if(spread<0.12 && allMid(n.R) && allMid(n.D) && allMid(n.E)){
      return {type:'BALANCE', top:[k1,k2], n};
    }

    // (2) 근소차 tie-break
    if(diff12<0.10){
      const winner = tieBreak(k1,k2);
      if(winner!==k1){ [k1,k2]=[k2,k1]; [v1,v2]=[v2,v1]; }
    }

    // (3) 하이브리드
    if(Math.abs(v1-v2)<0.10){
      const pair=[k1,k2].sort().join('');
      const map={ RD:'ROUTINE-DECIDER', RE:'ROUTINE-CALMER', DE:'DECIDER-CALMER' };
      return {type:map[pair] || 'BALANCE', top:[k1,k2], n};
    }

    // (4) 단일형
    const singleMap={R:'ROUTINE', D:'DECIDER', E:'CALMER'};
    return {type: singleMap[k1] || 'BALANCE', top:[k1,k2], n};
  }

  /* ---------- 결과 카피 ---------- */
  const COPY = {
    'ROUTINE': {
      title:'🗓️ 루틴몽실형',
      quote:'“작은 루틴이 큰 평온을 만든다.”',
      desc:'계획과 습관으로 하루를 단단히 쌓는 타입. 기본기로 컨디션을 복구합니다.',
      mood:['루틴 — 단단함','결정 — 안정적','평온 — 차분함'],
      remind:['오늘 “15분 루틴” 1개만 ✔︎','완벽보다 지속 — 80% 완료도 칭찬!']
    },
    'DECIDER': {
      title:'🧭 결정몽실형',
      quote:'“YES/NO 대신, 내 기준 한 줄.”',
      desc:'정보와 가치를 비교해 합리적으로 결정하고, 선택 이후 책임감 있게 밀고 갑니다.',
      mood:['루틴 — 유연함','결정 — 선명함','평온 — 적정'],
      remind:['선택 전 기준 1줄 적기','거절 템플릿 한 문장 준비']
    },
    'CALMER': {
      title:'🌿 평온몽실형',
      quote:'“감정은 없애는 게 아니라 다루는 것.”',
      desc:'호흡·걷기·수면 같은 기본 케어로 회복 탄력성을 유지합니다.',
      mood:['루틴 — 가볍게','결정 — 느긋하게','평온 — 높음'],
      remind:['호흡 4-6 → 물 한 잔 → 5분 걷기','스크린 타임 10분 줄이기']
    },
    'ROUTINE-DECIDER': {
      title:'🔧 루틴·결정 하이브리드',
      quote:'“정리하고, 정하고, 실행!”',
      desc:'루틴과 결정을 결합해 실행력이 좋은 조합입니다.',
      mood:['루틴 — 높음','결정 — 높음','평온 — 보통'],
      remind:['체크리스트 3개만(중요·짧음·지금)','마감 전 10분 리뷰']
    },
    'ROUTINE-CALMER': {
      title:'🌤️ 루틴·평온 하이브리드',
      quote:'“잔잔하지만 꾸준하게.”',
      desc:'가벼운 반복으로 평온을 키우는 조합입니다.',
      mood:['루틴 — 잔잔함','결정 — 담백함','평온 — 높음'],
      remind:['루틴 난이도 80%로','성공 경험 먼저 쌓기']
    },
    'DECIDER-CALMER': {
      title:'🫶 결정·평온 하이브리드',
      quote:'“내 속도, 내 선택.”',
      desc:'회복을 고려한 의사결정이 강점입니다.',
      mood:['루틴 — 가볍게','결정 — 선명함','평온 — 안정'],
      remind:['선택 전 30초 정지(몸 상태 체크)','핵심 3문장 프레이밍']
    },
    'BALANCE': {
      title:'☁️ 균형몽실형 (레어)',
      quote:'“균형은 작은 습관의 합.”',
      desc:'세 축이 고르게 발달한 유연형입니다.',
      mood:['루틴 — 균형','결정 — 균형','평온 — 균형'],
      remind:['분기 “업데이트 데이” — 세 축 1가지씩만 조정']
    }
  };

  /* ---------- 상태 미터 ---------- */
  function labelByPct(p){
    if(p>=76) return '높음';
    if(p>=56) return '적정';
    if(p>=36) return '보통';
    if(p>=21) return '낮음';
    return '아주 낮음';
  }

  function meters(n){
    const items = [
      {k:'R', name:'루틴', val:Math.round(n.R*100)},
      {k:'D', name:'결정', val:Math.round(n.D*100)},
      {k:'E', name:'평온', val:Math.round(n.E*100)},
    ];
    return `
      <div class="state-meter">
        ${items.map(it=>`
          <div class="row">
            <span><b>${it.name}</b></span>
            <div class="bar"><span class="fill" style="width:${it.val}%"></span></div>
            <span style="color:var(--text-soft)">${labelByPct(it.val)}${it.val?` (${it.val}%)`:''}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ---------- 결과 출력 (오류 방어 + 기본값 보정) ---------- */
  function finish(){
    card.style.display='none';
    barFill.style.width='100%';

    const res = classify();
    const info = COPY[res.type] || {
      title:'☁️ 분석 중',
      quote:'“데이터가 조금 부족해요.”',
      desc:'응답이 적거나 균형적으로 분포되어 결과 산출이 어렵습니다. 다음엔 문항을 조금 더 다양하게 선택해보세요 🌱',
      mood:['루틴 — 관찰중','결정 — 관찰중','평온 — 관찰중'],
      remind:['오늘은 휴식형 하루로','가벼운 루틴 1개만 시도해보기']
    };

    const moodSummary = info.mood ? `• ${info.mood.join('  • ')}` : '';

    resultBox.innerHTML = `
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
          <b>🌿 마음 리마인드:</b>
          ${info.remind?.map(t=>`<span class="pill" style="margin-right:6px">${t}</span>`).join('') || ''}
        </div>

        ${res.n ? meters(res.n) : ''}

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;
    resultBox.style.display='block';
  }

  render();
});