/* ===================================================
 * 자립 지수 체크 — 몽실몽실 v2025.2 (마음 리마인드)
 * - 5지선다(0~4) / 응답시간 보조 ±20%(선택 우선)
 * - 균형 희귀화, 상위2 하이브리드, 타이브레이커
 * - 결과: 2~3줄 설명, 자연스러운 리마인드, 미터 오른쪽 키워드
 *   (루틴→유연함 / 결정→선명함 / 평온→적정)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 문항(15) ---------- */
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

  /* ---------- 상태 ---------- */
  let idx = 0, t0 = Date.now();
  const score = {R:0, D:0, E:0};
  const count = {R:0, D:0, E:0};
  const ans   = Array(Q.length).fill(undefined);
  const times = Array(Q.length).fill(0);

  /* ---------- DOM ---------- */
  const step = document.getElementById('stepLabel');
  const bar  = document.getElementById('barFill');
  const qTxt = document.getElementById('qText');
  const wrap = document.getElementById('choiceWrap');
  const card = document.getElementById('card');
  const box  = document.getElementById('result');
  const prev = document.getElementById('prev');
  const skip = document.getElementById('skip');

  /* ---------- 가중 ---------- */
  function weight(sec){
    if(sec < 1)  return 0.9;
    if(sec < 4)  return 1.0;
    if(sec < 8)  return 1.15;
    return 1.10;
  }

  /* ---------- 렌더 ---------- */
  function render(){
    step.textContent = `${idx+1} / ${Q.length}`;
    bar.style.width  = `${(idx/Q.length)*100}%`;
    qTxt.textContent = Q[idx].q;

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
      }, {passive:true});
    });

    t0 = Date.now();
  }

  /* ---------- 응답 ---------- */
  function choose(s){
    const sec = (Date.now()-t0)/1000;
    const w   = weight(sec);
    const adj = s + (s*(w-1)*0.2); // ±20% 캡(선택 우선)

    ans[idx] = s;
    times[idx] = sec;

    const k = Q[idx].k;
    score[k] += adj;
    count[k] += 1;

    next();
  }

  function next(){ idx++; (idx<Q.length)? render() : finish(); }

  prev?.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });

  skip?.addEventListener('click', ()=>{
    ans[idx]=0;
    times[idx]=(Date.now()-t0)/1000;
    next();
  });

  function recalc(end){
    score.R=score.D=score.E=0; count.R=count.D=count.E=0;
    for(let i=0;i<end;i++){
      const s=ans[i]??0, k=Q[i].k, sec=times[i]??3, w=weight(sec);
      const adj=s + (s*(w-1)*0.2);
      score[k]+=adj; count[k]+=1;
    }
  }

  /* ---------- 정규화 & 분류 ---------- */
  const clamp01 = v => Math.max(0, Math.min(1, v));

  function normalized(){
    const R=(score.R/Math.max(1,count.R))/4;
    const D=(score.D/Math.max(1,count.D))/4;
    const E=(score.E/Math.max(1,count.E))/4;
    return {R:clamp01(R), D:clamp01(D), E:clamp01(E)};
  }

  function tieBreak(k1,k2){
    let bias=0;
    for(let i=Q.length-1; i>=0 && i>=Q.length-3; i--){
      const s=ans[i]??0, sec=times[i]??3, w=weight(sec), ax=Q[i].k;
      const mag=(s>=3?1:(s===2?0.25:0.1));
      if(ax===k1) bias += 1*w*mag;
      if(ax===k2) bias -= 1*w*mag;
    }
    return bias>=0 ? k1 : k2;
  }

  function classify(){
    const n=normalized();
    const arr=Object.entries(n).sort((a,b)=>b[1]-a[1]);
    let [k1,v1]=arr[0], [k2,v2]=arr[1], [,v3]=arr[2];
    const diff12=v1-v2, spread=v1-v3;

    const inMid = x => x>=0.35 && x<=0.65;
    if(spread<0.12 && inMid(n.R) && inMid(n.D) && inMid(n.E)){
      return {type:'BALANCE', n};
    }

    if(diff12<0.10){
      const w = tieBreak(k1,k2);
      if(w!==k1){ [k1,k2]=[k2,k1]; }
    }

    if(Math.abs(v1-v2)<0.10){
      const pair=[k1,k2].sort().join('');
      const map={ RD:'ROUTINE-DECIDER', RE:'ROUTINE-CALMER', DE:'DECIDER-CALMER' };
      return {type:map[pair], n};
    }

    return {type:{R:'ROUTINE',D:'DECIDER',E:'CALMER'}[k1], n};
  }

  /* ---------- 결과 카피 ---------- */
  const COPY = {
    'ROUTINE': {
      title:'🗓️ 루틴몽실형',
      quote:'“작은 루틴이 큰 평온을 만든다.”',
      desc:'규칙과 정리가 힘이 되는 타입이에요. 일정한 생활 리듬을 만들수록 컨디션이 안정되고, 일의 마감도 자연스럽게 붙습니다.',
      mood:['루틴 — 단단함','결정 — 안정적','평온 — 차분함'],
      remind:['오늘 루틴 1개만 완주','완벽은 금지, 80% 완료면 칭찬']
    },
    'DECIDER': {
      title:'🧭 결정몽실형',
      quote:'“YES/NO 대신, 내 기준 한 줄.”',
      desc:'정보와 가치를 차분히 비교해 선택하는 힘이 커요. 방향이 정리되면 실행이 빨라지고, 선택 이후에도 흔들림이 적습니다.',
      mood:['루틴 — 유연함','결정 — 선명함','평온 — 적정'],
      remind:['선택 전 기준 1줄 적기','거절 문장 1개를 미리 준비']
    },
    'CALMER': {
      title:'🌿 평온몽실형',
      quote:'“감정은 없애는 게 아니라 다루는 것.”',
      desc:'호흡·수면·걷기 같은 기본 케어로 회복 탄력이 좋아요. 속도를 낮추면 사고가 선명해지고, 대화의 톤도 부드러워집니다.',
      mood:['루틴 — 가볍게','결정 — 느긋하게','평온 — 높음'],
      remind:['4-6 호흡 3회 + 물 한 컵','화면 밝기·알림 10분 줄이기']
    },
    'ROUTINE-DECIDER': {
      title:'🔧 루틴·결정 하이브리드',
      quote:'“정리하고, 정하고, 실행!”',
      desc:'루틴의 안정감과 결단의 선명함을 함께 쓰는 조합이에요. 체크리스트를 짧게 가져가면 실행력이 크게 오릅니다.',
      mood:['루틴 — 높음','결정 — 높음','평온 — 보통'],
      remind:['중요·짧음·지금 3개만 체크','마감 전 10분 스냅 리뷰']
    },
    'ROUTINE-CALMER': {
      title:'🌤️ 루틴·평온 하이브리드',
      quote:'“잔잔하지만 꾸준하게.”',
      desc:'가벼운 반복으로 안정이 쌓이는 패턴입니다. 난도를 낮춰도 꾸준하면, 목표는 자연히 붙습니다.',
      mood:['루틴 — 잔잔함','결정 — 담백함','평온 — 높음'],
      remind:['루틴 난도 80%로 조정','성공 경험 먼저 쌓기']
    },
    'DECIDER-CALMER': {
      title:'🫶 결정·평온 하이브리드',
      quote:'“내 속도, 내 선택.”',
      desc:'상황을 가라앉혀 본 뒤 선택하는 스타일이에요. 회복을 고려한 결정을 하면 후회가 적고 지속력이 생깁니다.',
      mood:['루틴 — 가볍게','결정 — 선명함','평온 — 안정'],
      remind:['선택 전 30초 멈춤(몸 신호 확인)','핵심 3문장 프레이밍']
    },
    'BALANCE': {
      title:'☁️ 균형몽실형 (레어)',
      quote:'“균형은 작은 습관의 합.”',
      desc:'세 축이 고르게 발달해 상황에 맞게 톤 조절이 가능해요. 조급함만 줄이면, 장기 목표에 매우 유리합니다.',
      mood:['루틴 — 균형','결정 — 균형','평온 — 균형'],
      remind:['분기별 “업데이트 데이” — 세 축 1가지씩 조정']
    }
  };

  /* ---------- 미터 ---------- */
  const AXIS_TAG = { R:'유연함', D:'선명함', E:'적정' };
  function meters(n){
    const rows = [
      {k:'R', name:'루틴', val:Math.round((n.R??0)*100)},
      {k:'D', name:'결정', val:Math.round((n.D??0)*100)},
      {k:'E', name:'평온', val:Math.round((n.E??0)*100)},
    ];
    return `
      <div class="state-meter">
        ${rows.map(({k,name,val})=>`
          <div class="row">
            <span><b>${name}</b></span>
            <div class="bar"><span class="fill" style="width:${val}%;"></span></div>
            <span class="meter-label">${AXIS_TAG[k]} <span class="meter-dim">(${val}%)</span></span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ---------- 결과 ---------- */
  function finish(){
    card.style.display='none';
    bar.style.width='100%';

    const {type, n} = classify();
    const info = COPY[type];
    const moodSummary = `• ${info.mood.join('  • ')}`;

    box.innerHTML = `
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
          ${info.remind.map(t=>`<span class="pill" style="margin-right:6px">${t}</span>`).join('')}
        </div>

        ${meters(n)}

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;
    box.style.display='block';
  }

  render();
});