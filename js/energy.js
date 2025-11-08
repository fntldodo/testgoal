/* ===================================================
 * 🔋 에너지 테스트 — 몽실몽실 v2025.2 (마음 리마인드)
 * ---------------------------------------------------
 * - 5지선다(0~4) + 응답시간 보조 ±20% (선택 우선, 뒤엎지 않음)
 * - 문항: 14 (P:신체/루틴, M:마음집중, R:회복/휴식)
 * - 산식: v = 0.5*P + 0.3*M + 0.2*R  (모두 0~1로 정규화)
 * - 상태 라벨 5단계: 방전 직전 / 저전력 / 보통 / 충전 중 / 풀충전
 * - 중립 편중 방지: 최근 3문항 + 시간가중 타이브레이커로 경계값 보정
 * - 결과: 제목/인용/설명/상태요약(문장형)/배터리4칸/미터/리마인드/버튼
 * - 숫자(%)는 보조표시만, 라벨이 주도
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // [수정-추가] 질문 레이아웃 V2 적용 + 카테고리(동물=fun) 지정
  document.body.classList.add('layout-v2');
  document.body.setAttribute('data-theme','fun');

  const Q = [

    // P — 신체/루틴 (6)
    {k:'P', q:'수면 시간이 규칙적이며 기상 후 개운함을 느끼는 편이다.'},
    {k:'P', q:'하루 20분 이상 가벼운 움직임(걷기/스트레칭)을 한다.'},
    {k:'P', q:'식사 시간을 대략 일정하게 유지한다.'},
    {k:'P', q:'카페인/야식 등 컨디션을 떨어뜨리는 습관을 조절한다.'},
    {k:'P', q:'집안/작업환경 정리가 에너지를 올리는 데 도움 된다.'},
    {k:'P', q:'해야 할 일을 작은 단위로 쪼개 꾸준히 진행한다.'},

    // M — 마음/집중 (4)
    {k:'M', q:'해야 할 일 앞에서 10분만 시작하면 집중이 붙는다.'},
    {k:'M', q:'산만함을 줄이기 위해 방해요소(알림 등)를 제어한다.'},
    {k:'M', q:'집중이 흐트러져도 과하게 자책하지 않고 다시 시작한다.'},
    {k:'M', q:'목표를 “오늘 한 줄”로 정의하고 우선순위를 정한다.'},

    // R — 회복/휴식 (4)
    {k:'R', q:'짧은 휴식(3~5분 호흡/물/스트레칭)을 의식적으로 넣는다.'},
    {k:'R', q:'감정이 요동칠 때 몸 신호(호흡/어깨 긴장)를 체크한다.'},
    {k:'R', q:'무리한 날 이후 “회복일”을 계획적으로 둔다.'},
    {k:'R', q:'피로 신호를 느끼면 일을 줄이거나 속도를 조절한다.'},
  ];

  /* ---------- 상태 ---------- */
  let idx = 0, t0 = Date.now();
  const score = {P:0, M:0, R:0};
  const count = {P:0, M:0, R:0};
  const ans   = [];      // 원점수 0~4
  const times = [];      // 응답시간(초)

  /* ---------- DOM ---------- */
  const step = document.getElementById('stepLabel');
  const bar  = document.getElementById('barFill');
  const qTxt = document.getElementById('qText');
  const wrap = document.getElementById('choiceWrap');
  const card = document.getElementById('card');
  const box  = document.getElementById('result');
  const prev = document.getElementById('prev');
  const skip = document.getElementById('skip');

  /* ---------- 시간 가중(±20% 캡, 선택 뒤엎지 않음) ---------- */
  function weight(sec){
    if(sec < 1)  return 0.9;   // 너무 빠른 반응은 -10%
    if(sec < 4)  return 1.0;   // 정상
    if(sec < 8)  return 1.15;  // 숙고 +
    return 1.10;               // 과도 숙고는 +10%
  }

  /* ---------- 화면 렌더 ---------- */
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

    // 이전 선택 유지 표기
    const prevSel = ans[idx];
    if(prevSel !== undefined){
      [...wrap.children].forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    // 클릭 핸들러
    [...wrap.children].forEach(btn=>{
      btn.addEventListener('click', ()=>{
        [...wrap.children].forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 150);
      }, {passive:true});
    });

    t0 = Date.now();
  }

  function choose(s){
    const sec = (Date.now()-t0)/1000;
    const w   = weight(sec);
    const adj = s + (s*(w-1)*0.2); // 보조 최대 ±20%

    ans[idx]   = s;
    times[idx] = sec;

    const k = Q[idx].k;
    score[k] += adj;
    count[k] += 1;

    next();
  }

  function next(){
    idx++;
    if(idx < Q.length) render();
    else finish();
  }

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
    score.P=score.M=score.R=0;
    count.P=count.M=count.R=0;
    for(let i=0;i<end;i++){
      const s = ans[i] ?? 0;
      const k = Q[i].k;
      const sec = times[i] ?? 3;
      const w   = weight(sec);
      const adj = s + (s*(w-1)*0.2);
      score[k]+= adj;
      count[k]+= 1;
    }
  }

  /* ---------- 정규화 & 스칼라 에너지 ---------- */
  function clamp01(v){ return Math.max(0, Math.min(1, v)); }

  // 축별 평균(0~4) → 0~1
  function normalizedAxes(){
    const nP = (score.P/Math.max(1,count.P))/4;
    const nM = (score.M/Math.max(1,count.M))/4;
    const nR = (score.R/Math.max(1,count.R))/4;
    return {P:clamp01(nP), M:clamp01(nM), R:clamp01(nR)};
  }

  // 전체 에너지 스칼라(0~1)
  function scalarEnergy(n){
    return clamp01(0.5*n.P + 0.3*n.M + 0.2*n.R);
  }

  /* ---------- 상태 라벨(5단계) ---------- */
  const COPY = {
    '방전 직전': {
      title:'🔻 방전 직전',
      quote:'“잠깐 멈추면, 다시 간다.”',
      desc:'지금은 에너지 보호가 최우선이에요. 무리한 목표보다 “지금 할 수 있는 1분”을 먼저 확보하면 반등의 발판이 됩니다.',
      remind:'밝은 조명 켜기 → 창문 열고 3회 호흡 → 물 한 컵.'
    },
    '저전력': {
      title:'⚠️ 저전력',
      quote:'“작게, 하지만 꾸준히.”',
      desc:'부하가 걸린 상태지만 작은 루틴을 붙이면 금방 회복돼요. “10분 스타트”로 가볍게 몸과 마음을 데워요.',
      remind:'10분 타이머로 가볍게 시작 + 휴식 알림 예약.'
    },
    '보통': {
      title:'🙂 보통',
      quote:'“균형은 작은 반복에서 온다.”',
      desc:'기본 체력이 유지되는 구간이에요. 과하게 올리기보다, 방해요소를 줄이고 리듬을 고정하면 안정적으로 올라갑니다.',
      remind:'알림 끄기 → 25-5 타이머 1세트만.'
    },
    '충전 중': {
      title:'🔌 충전 중',
      quote:'“속도를 내되, 회복을 예약하자.”',
      desc:'집중이 붙는 흐름입니다. 다만 회복 슬롯을 미리 넣지 않으면 금방 소모돼요. 리듬을 타고 한 단 더 올려봅시다.',
      remind:'집중 25분 후 3분 스트레칭/물/창문 열기.'
    },
    '풀충전': {
      title:'✅ 풀충전',
      quote:'“지금이 실행 타이밍!”',
      desc:'에너지와 집중이 잘 붙은 상태예요. 큰 결정/고집중 작업을 배치하고, 끝에 회복 시간을 꼭 넣어 과열을 방지하세요.',
      remind:'하이라이트 작업 30분 → 회복 5분 확정.'
    }
  };

  function stateLabel(v){ // v: 0~1
    if (v < 0.2)  return {label:'방전 직전', hint:'“멈춤→짧은 회복→다시 시작”이 최우선'};
    if (v < 0.4)  return {label:'저전력',   hint:'작은 루틴으로 불씨 살리기'};
    if (v < 0.6)  return {label:'보통',     hint:'방해요소 정리 + 일정한 리듬'};
    if (v < 0.8)  return {label:'충전 중',  hint:'집중 흐름 유지 + 회복 예약'};
    return               {label:'풀충전',   hint:'핵심 작업 배치 타이밍'};
  }

  /* ---------- 타이브레이커(경계값 스냅, 최근3 + 시간가중) ---------- */
  function tieBreak(v){
    // 경계 근처에서 최근 3문항 영향으로 살짝 상/하향
    const edges = [0.2, 0.4, 0.6, 0.8];
    const near  = edges.find(e => Math.abs(v - e) <= 0.03);
    if(!near) return v;

    let d = 0;
    for(let i=Math.max(0,Q.length-3); i<Q.length; i++){
      const s = ans[i] ?? 0;
      const sec = times[i] ?? 3;
      const w = weight(sec);
      // 강한 긍정일수록 +, 0/1은 영향 작음
      const mag = (s>=3? 1.0 : (s===2? 0.25 : 0.1));
      d += (s - 2) * 0.02 * w * mag; // 한 문항당 최대 ±0.02 근처
    }
    return clamp01(v + d);
  }

  /* ---------- 미터(축별 상태) ---------- */
  function label5(x){ // 0~1 → 5단계 라벨
    if (x>=0.80) return '매우 높음';
    if (x>=0.60) return '높음';
    if (x>=0.40) return '보통';
    if (x>=0.20) return '낮음';
    return '매우 낮음';
  }

  function meters(n, v){
    const rows = [
      ['P','신체/루틴', n.P],
      ['M','집중',      n.M],
      ['R','회복',      n.R],
    ];
    const pct = Math.round(v*100);
    return `
      <div class="state-meter" style="margin-top:8px">
        ${rows.map(([k,name,val])=>{
          const p = Math.round(val*100);
          return `
            <div class="row" style="display:grid;grid-template-columns:88px 1fr auto;align-items:center;gap:10px;margin:6px 0">
              <span><b>${name}</b></span>
              <div class="bar" style="height:8px;background:#eef3f2;border-radius:999px;overflow:hidden">
                <span class="fill" style="display:block;height:100%;width:${p}%;background:var(--mint-500)"></span>
              </div>
              <span class="meter-label">${label5(val)}${p?` (${p}%)`:''}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /* ---------- 배터리 4칸 시각화(깜빡임) ---------- */
  // ※ style.css에 배터리 CSS 블록이 추가되어 있어야 함
  function renderBattery(pct) {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    const perCell = 25;
    const fullCells = Math.floor(clamped / perCell); // 0~4
    const remainder = clamped % perCell;             // 0~24
    const cells = [];

    for (let i = 0; i < 4; i++) {
      const isFull = i < fullCells;
      const isCurrent = i === fullCells && remainder > 0 && fullCells < 4;
      const width = isFull ? 100 : (isCurrent ? (remainder / perCell) * 100 : 0);
      const blinkCls = isCurrent ? 'blink' : '';
      cells.push(`
        <div class="batt-cell ${blinkCls}">
          <span class="fill" style="width:${width}%;"></span>
        </div>
      `);
    }

    return `
      <div class="battery" role="img" aria-label="현재 에너지 ${clamped}% 상태의 배터리">
        <div class="battery-pack">
          ${cells.join('')}
        </div>
        <span class="percent-label">${clamped}%</span>
      </div>
    `;
  }

  /* ---------- 결과 ---------- */
  function finish(){
    card.style.display='none';
    bar.style.width='100%';

    const n0 = normalizedAxes();
    let v = scalarEnergy(n0);
    v = tieBreak(v);

    const {label, hint} = stateLabel(v);
    const info = COPY[label];
    const pct  = Math.round(v*100);

    box.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <!-- 배터리 시각화 (이미지 대신) -->
        ${renderBattery(pct)}

        <p style="margin:10px 0">${info.desc}</p>

        <!-- 감정상태 요약: 퍼센트는 보조 문구로만 -->
        <div class="pill" style="margin-bottom:8px">현재 상태 — <b>${hint}</b></div>

        ${meters(n0, v)}

        <div class="mind-remind" style="margin-top:10px;color:var(--text-soft)">
          <b>🌿 지금 1분 리마인드:</b> ${info.remind}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;
    box.style.display='block';
  }

  /* ---------- 시작 ---------- */
  render();
});
