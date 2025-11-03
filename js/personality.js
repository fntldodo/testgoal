/* =====================================================
 * 성격 성향 집중형(5유형) — 몽실몽실 v2025.3
 * -----------------------------------------------------
 * - 14문항 / 5지선다(0~4)
 * - 축: F(집중) R(사색) E(공감) A(실행) C(탐구)
 * - 응답시간 가중치: ±20% (선택 우선, 뒤엎지 않음)
 * - 분류:
 *   1) 각 축 퍼센트 계산
 *   2) top1-top2 격차 >= 10% → 단일형
 *      6~9% → 하이브리드형(top1+top2)
 *      <6% → 균형형(표준편차 0.02 이하에서만)
 * - UI: 점수 숫자 ❌, 퍼센트 + 상태라벨 ✅
 * - 결과: 제목/인용문/설명/감정상태요약/마음리마인드/시각요소/버튼
 * ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 14문항 분포(각 축 2~3 문항)
  const Q = [
    // F(집중) 3
    {k:'F', q:'해야 할 일에 몰입하면 주변이 잘 들리지 않는다.'},
    {k:'F', q:'방해 요소가 있어도 다시 집중을 회복하는 편이다.'},
    {k:'F', q:'한 번 시작한 일은 끝을 볼 때까지 파고든다.'},

    // R(사색) 3
    {k:'R', q:'결정을 내리기 전에 충분히 곱씹어 보는 편이다.'},
    {k:'R', q:'내 마음의 변화를 기록/정리하면 안정된다.'},
    {k:'R', q:'조용한 시간에서 아이디어가 잘 떠오른다.'},

    // E(공감) 3
    {k:'E', q:'타인의 감정 신호를 비교적 빨리 알아차린다.'},
    {k:'E', q:'말투/표정에 담긴 뉘앙스를 민감하게 읽는다.'},
    {k:'E', q:'갈등이 생기면 먼저 톤을 낮추고 대화를 시도한다.'},

    // A(실행) 3
    {k:'A', q:'생각이 길어지기 전에 작게라도 바로 실행한다.'},
    {k:'A', q:'일정/루틴을 만들어 꾸준히 움직인다.'},
    {k:'A', q:'문제를 보면 계획보다 손부터 움직일 때가 있다.'},

    // C(탐구) 2
    {k:'C', q:'새로운 방식/도구를 시험해보는 걸 즐긴다.'},
    {k:'C', q:'원인과 구조를 파악하는 데 흥미를 느낀다.'}
  ];

  // 상태
  let idx = 0;
  const raw = {F:0, R:0, E:0, A:0, C:0};  // 가중 반영 합산
  const cnt = {F:0, R:0, E:0, A:0, C:0};  // 문항수
  const ans = [];                          // 0~4 선택 기록
  const times = [];                        // 응답 시간(s)
  let t0 = Date.now();

  // DOM
  const stepLabel = document.getElementById('stepLabel');
  const barFill   = document.getElementById('barFill');
  const qText     = document.getElementById('qText');
  const wrap      = document.getElementById('choiceWrap');
  const card      = document.getElementById('card');
  const resultBox = document.getElementById('result');
  const prevBtn   = document.getElementById('prev');
  const skipBtn   = document.getElementById('skip');

  if(!stepLabel||!barFill||!qText||!wrap||!card||!resultBox){
    console.error('[personality] 필수 엘리먼트 누락');
    return;
  }

  /* ---------- 렌더 ---------- */
  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width   = `${(idx/Q.length)*100}%`;
    qText.textContent     = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;

    const prevSel = ans[idx];
    if(prevSel!==undefined){
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

    t0 = Date.now();
  }

  /* ---------- 시간 가중치 ---------- */
  // 선택을 뒤엎지 않는 보조(±20% 캡)
  function w(sec){
    // 집중도 설계(프롬프트 합의치)
    if(sec < 0.5) return 0.9;   // 너무 빠름 → -10%
    if(sec < 3.0) return 1.0;   // 정상
    if(sec < 7.0) return 1.1;   // 숙고
    return 1.05;                // 과숙고는 완만히
  }

  /* ---------- 응답 처리 ---------- */
  function choose(s){
    const elapsed = (Date.now() - t0)/1000;
    times[idx] = elapsed;

    const axis = Q[idx].k;
    ans[idx] = s;

    const adj = s + (s * (w(elapsed) - 1) * 0.2);
    raw[axis] += adj;
    cnt[axis] += 1;

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
    ans[idx]=0;
    times[idx]=(Date.now()-t0)/1000;
    next();
  });

  /* ---------- 되돌아감 재계산 ---------- */
  function recalc(end){
    raw.F=raw.R=raw.E=raw.A=raw.C=0;
    cnt.F=cnt.R=cnt.E=cnt.A=cnt.C=0;
    for(let i=0;i<end;i++){
      const s = ans[i] ?? 0;
      const axis = Q[i].k;
      const elapsed = times[i] ?? 3.0;
      const adj = s + (s * (w(elapsed) - 1) * 0.2);
      raw[axis] += adj;
      cnt[axis] += 1;
    }
  }

  /* ---------- 퍼센트 & 상태라벨 ---------- */
  const LABEL = {F:'집중성', R:'사색성', E:'감정공감', A:'실행력', C:'탐구성'};

  function pctOf(axis){
    const max = (cnt[axis]||0) * 4; // 5지선다 상한(4)
    if(!max) return 0;
    const p = Math.round((raw[axis]/max)*100);
    return Math.max(0, Math.min(100, p));
  }

  function stateWord(p){ // 퍼센트 → 상태 단어
    if(p>=80) return '만개';
    if(p>=60) return '잘 자람';
    if(p>=40) return '자라는 중';
    if(p>=20) return '움트는 중';
    return '씨앗';
  }

  /* ---------- 분류 로직 ---------- */
  function classify(){
    const dist = [
      ['F', pctOf('F')],
      ['R', pctOf('R')],
      ['E', pctOf('E')],
      ['A', pctOf('A')],
      ['C', pctOf('C')]
    ].sort((a,b)=>b[1]-a[1]);

    const [k1, v1] = dist[0];
    const [k2, v2] = dist[1];
    const gap = v1 - v2;

    // 표준편차(0~1 스케일로 환산)
    const arr01 = dist.map(([,p])=>p/100);
    const mean = arr01.reduce((a,b)=>a+b,0)/arr01.length;
    const variance = arr01.reduce((a,b)=>a+Math.pow(b-mean,2),0)/arr01.length;
    const stdev = Math.sqrt(variance);

    if(gap >= 10) return {kind:'single', a:k1, b:null, stdev};
    if(gap >= 6)  return {kind:'hybrid', a:k1, b:k2, stdev};
    // gap < 6 → 균형형은 너무 남발 금지: stdev 매우 낮을 때만
    if(stdev <= 0.02) return {kind:'balance', a:null, b:null, stdev};
    // 그 외엔 하이브리드로 흡수(애매 방지)
    return {kind:'hybrid', a:k1, b:k2, stdev};
  }

  /* ---------- 결과 카피 ---------- */
  const COPY = {
    F: {
      title:'🌞 집중형 — 한 점으로 모아 쏘는 힘',
      quote:'“흩어지지 않으면, 도착한다.”',
      desc:'방해 신호를 조용히 걷어내고 필요한 지점에 에너지를 모으는 타입입니다. 루틴 속에서 몰입이 깊어지고, 작은 진도를 꾸준히 쌓을수록 성과가 크게 드러납니다. 때때로 완벽주의가 속도를 늦출 수 있으니, 80% 완료에도 박수 치는 감각이 도움이 됩니다.',
      mind:'오늘의 마음 리마인드 — “깊게 파되, 가볍게 마무리.” 25분만 몰입하고 5분 호흡을 권해요.'
    },
    R: {
      title:'🌿 사색형 — 마음의 관찰자',
      quote:'“조용함 속에서 답이 피어난다.”',
      desc:'생각의 결을 섬세하게 읽고, 맥락을 정리하는 데 강점이 있습니다. 감정의 미세한 떨림을 놓치지 않고 기록에 담아 의미를 만들어 냅니다. 단, 지나친 분석은 실행을 지연시킬 수 있어요. 오늘은 “작은 실행 1”만 얹어보는 게 좋아요.',
      mind:'오늘의 마음 리마인드 — “생각의 끝에, 작은 발걸음 하나.” 3줄 메모 후 버튼 한 번 눌러보기.'
    },
    E: {
      title:'💧 공감형 — 온도의 조율자',
      quote:'“마음을 먼저 듣는다.”',
      desc:'상대의 감정 신호를 빨리 알아차리고, 말과 태도로 온도를 조절하는 능력이 돋보입니다. 관계의 미세한 균형을 지킴으로써 팀의 효율까지 높입니다. 다만 과도한 배려는 자기 소진으로 이어질 수 있어, 나의 에너지 게이지도 함께 살펴주세요.',
      mind:'오늘의 마음 리마인드 — “내 마음도 케어 대상.” 10분 충전 타임을 달력에 예약!'
    },
    A: {
      title:'🚀 실행형 — 움직임이 답',
      quote:'“생각은 짧게, 시도는 빠르게.”',
      desc:'아이디어를 손으로 증명하는 실천가입니다. 작은 시범과 빠른 피드백 루프를 통해 성공/실패를 학습으로 전환합니다. 가끔 성급함이 디테일을 놓치게 만들 수 있으니, 출발 전 체크리스트 한 줄만 추가해도 완성도가 확 올라갑니다.',
      mind:'오늘의 마음 리마인드 — “작게 시작, 빠르게 배우기.” TO-DO 1개만 지금 체크!'
    },
    C: {
      title:'🔎 탐구형 — 구조의 탐험가',
      quote:'“표면 아래, 원리를 본다.”',
      desc:'원인과 패턴을 발견하고, 도구를 시험하며 더 나은 구조를 만듭니다. 불확실한 문제일수록 흥미롭게 파고드는 타입입니다. 다만 실험이 길어지면 퍼블리시가 늦을 수 있어요. 오늘은 기준선 버전(v0)을 먼저 내고, 개선을 이어가 보세요.',
      mind:'오늘의 마음 리마인드 — “완벽보다 공개.” v0를 내고, v1은 내일의 나에게!'
    }
  };

  function hybridTitle(a,b){
    const name = {F:'집중',R:'사색',E:'공감',A:'실행',C:'탐구'};
    return `🌼 하이브리드 — ${name[a]}×${name[b]}`;
  }

  function balanceCopy(){
    return {
      title:'☁️ 균형형 — 바람 결 따라 색을 바꾸는 구름',
      quote:'“상황이 바뀌면, 강점도 바뀐다.”',
      desc:'다섯 축이 적절히 고르게 나타납니다. 팀과 과업의 성격에 맞춰 집중/사색/공감/실행/탐구를 유연하게 배치하는 타입입니다. 이 균형감은 변화에 강한 장점이지만, 목표가 모호할 땐 추진력이 약해질 수 있어요. 오늘은 “어느 축을 10%만 더 올릴지” 정해 보세요.',
      mind:'오늘의 마음 리마인드 — “유연함은 힘.” 오늘의 미션에 맞는 축 1개만 강조!'
    };
  }

  /* ---------- 결과 렌더 ---------- */
  function petalCanvasHTML(){
    return `
      <div class="petal-wrap">
        <canvas id="petal" width="340" height="340" aria-label="성격 꽃잎 차트"></canvas>
        <div class="legend">
          <span class="chip">집중성</span>
          <span class="chip">사색성</span>
          <span class="chip">감정공감</span>
          <span class="chip">실행력</span>
          <span class="chip">탐구성</span>
        </div>
      </div>`;
  }

  function drawPetal(){
    const c = document.getElementById('petal'); if(!c) return;
    const ctx = c.getContext('2d');
    const W=c.width, H=c.height, cx=W/2, cy=H/2;
    const radius = Math.min(W,H)*0.38;
    const keys = ['F','R','E','A','C'];
    const angleStep = (Math.PI*2)/keys.length;

    // 배경 가이드
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(146,217,206,0.9)';
    ctx.lineWidth=1;
    for(let ring=1; ring<=5; ring++){
      const r = radius*(ring/5);
      ctx.beginPath();
      for(let i=0;i<keys.length;i++){
        const a = -Math.PI/2 + angleStep*i;
        const x = cx + Math.cos(a)*r;
        const y = cy + Math.sin(a)*r;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 값 → 점
    const pts = keys.map((k,i)=>{
      const p = pctOf(k)/100;
      const a = -Math.PI/2 + angleStep*i;
      return {x: cx + Math.cos(a)*radius*p, y: cy + Math.sin(a)*radius*p};
    });

    // 채움
    ctx.beginPath();
    pts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.closePath();
    ctx.fillStyle='rgba(165,226,217,0.45)';
    ctx.fill();
    ctx.beginPath();
    pts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.closePath();
    ctx.strokeStyle='rgba(146,217,206,1)';
    ctx.lineWidth=2;
    ctx.stroke();

    // 점
    ctx.fillStyle='rgba(146,217,206,1)';
    pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill(); });

    // 라벨
    ctx.fillStyle='#2F2F2F'; ctx.font='12px Pretendard, system-ui';
    keys.forEach((k,i)=>{
      const a = -Math.PI/2 + angleStep*i;
      const x = cx + Math.cos(a)*(radius+16);
      const y = cy + Math.sin(a)*(radius+16);
      const label = LABEL[k];
      const tw = ctx.measureText(label).width;
      ctx.fillText(label, x - tw/2, y+4);
    });
  }

  function statesHTML(){
    const keys = ['F','R','E','A','C'];
    return `
      <div class="state-row">
        ${keys.map(k=>{
          const p = pctOf(k);
          const s = stateWord(p);
          return `<div class="state-item">
            <b>${LABEL[k]}</b> — ${s} (${p}%)
          </div>`;
        }).join('')}
      </div>
    `;
  }

  function finish(){
    // 진행 바 완료
    card.style.display='none';
    barFill.style.width='100%';

    // 분류
    const cls = classify();

    // 카피 선택
    let title='', quote='', desc='', mind='';
    if(cls.kind==='single'){
      const c = COPY[cls.a];
      title=c.title; quote=c.quote; desc=c.desc; mind=c.mind;
    } else if(cls.kind==='hybrid'){
      const a = COPY[cls.a], b = COPY[cls.b];
      title = hybridTitle(cls.a, cls.b);
      quote = (a?.quote && b?.quote) ? `${a.quote} / ${b.quote}` : '“두 강점이 만나는 지점.”';
      // 하이브리드 설명은 두 축 요지를 부드럽게 합성
      const blend = {
        FR:'깊이 몰입하면서도 의미를 정교하게 빚습니다. 생각의 층을 쌓아 실행 전 정확도를 높입니다.',
        FE:'집중과 공감의 균형으로, 관계의 온도를 지키며 성과를 만듭니다.',
        FA:'생각에 갇히지 않고 몰입을 행동으로 연결합니다. 완성도와 속도의 균형이 강점입니다.',
        FC:'몰입해 파고들며 구조를 세웁니다. 문제의 핵을 정확히 겨냥하는 타입입니다.',
        RE:'사색의 섬세함으로 마음의 신호를 읽고, 대화와 기록으로 질서를 세웁니다.',
        RA:'생각을 정리해 작은 실행으로 전환합니다. “3줄 정리 → 1클릭 실행”이 잘 맞습니다.',
        RC:'깊은 성찰을 구조화해 가설-검증 루프를 설계합니다.',
        EA:'사람을 살피며 빠르게 움직입니다. 팀을 안전하게 이끄는 추진력이 강점입니다.',
        EC:'관계의 균형을 지키면서도 근거를 세우는 타입입니다.',
        AC:'실험을 손으로 증명합니다. v0를 빨리 내고 개선을 반복하는 스타일입니다.'
      };
      const keySorted = [cls.a, cls.b].sort().join('');
      desc = blend[keySorted] || '두 강점이 서로의 빈틈을 메우며 안정적인 전진을 돕습니다.';
      mind = '오늘의 마음 리마인드 — “둘의 장점을 번갈아 쓰기.” 지금 필요한 축을 10%만 강조!';
    } else { // balance
      const c = balanceCopy();
      title=c.title; quote=c.quote; desc=c.desc; mind=c.mind;
    }

    // 평균 응답시간
    const avgT = times.length ? (times.reduce((a,b)=>a+b,0)/times.length).toFixed(1) : '0.0';

    // 결과 HTML
    resultBox.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img src="../assets/brain.png" alt="성격 성향" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${title}</div>
            <div class="result-desc">${quote}</div>
          </div>
        </div>

        <p style="margin:10px 0">${desc}</p>

        <div class="pill" style="margin:6px 0 10px">평균 응답 시간: <b>${avgT}s</b></div>

        ${petalCanvasHTML()}
        ${statesHTML()}

        <div style="margin-top:10px; background:#fff; border:1px solid var(--mint-200); border-radius:12px; padding:12px">
          <div style="font-weight:800; margin-bottom:6px">🌿 마음 리마인드</div>
          <div>${mind}</div>
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>

        <p class="result-note">* 퍼센트는 현재 경향의 강도를 나타내는 참고값입니다.</p>
      </div>
    `;

    resultBox.style.display='block';
    drawPetal();
  }

  // 시작
  render();
});