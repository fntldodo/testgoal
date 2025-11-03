/* ===================================================
 * 나는 어떤 동물? — v2025.2 (마음 리마인드)
 * ---------------------------------------------------
 * - 5지선다(0~4), 선택 우선 + 응답시간 보조(±20% 캡)
 * - 4축(A/N/C/S) → 6유형(AN, AC, AS, CN, CS, NS) 매핑
 * - UI: 점수 숫자 노출 없음(필요시 %), 상태 라벨 중심
 * - 결과 카드: 제목/인용문/설명/감정상태 요약/마음 리마인드/상태 미터/버튼
 * - 타이/접전시 안정 분류(상위2축 조합 고정, 완전동률은 규칙타이브레이커)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 16문항 (A:활동성, N:새로움, C:공감, S:신중)
  const Q = [
    {k:'A', q:'즉흥적인 외출/모임 제안이 설렌다.'},
    {k:'A', q:'몸을 움직이는 활동(산책/운동)을 즐긴다.'},
    {k:'A', q:'문제가 생기면 먼저 행동부터 해보는 편이다.'},
    {k:'A', q:'사람들과 함께 움직일 때 에너지가 오른다.'},

    {k:'N', q:'새로운 방법을 실험하는 게 즐겁다.'},
    {k:'N', q:'큰 그림/가능성을 떠올리는 일이 많다.'},
    {k:'N', q:'규칙보다 아이디어가 먼저 떠오른다.'},
    {k:'N', q:'낯선 장소/문화에 호기심이 강하다.'},

    {k:'C', q:'상대의 감정 변화를 금방 눈치챈다.'},
    {k:'C', q:'팀워크가 좋으면 능률이 더 오른다.'},
    {k:'C', q:'연락·소통이 끊기면 불편함을 느낀다.'},
    {k:'C', q:'상대 입장에서 생각해보는 편이다.'},

    {k:'S', q:'계획을 세우고 단계적으로 진행하는 게 편하다.'},
    {k:'S', q:'결정 전 정보를 비교·검토하는 편이다.'},
    {k:'S', q:'한 번에 많은 변화를 주는 건 부담스럽다.'},
    {k:'S', q:'루틴과 규칙이 있으면 마음이 편하다.'}
  ];

  // 상태
  let idx = 0;
  const score  = { A:0, N:0, C:0, S:0 };
  const count  = { A:0, N:0, C:0, S:0 };
  const ans    = [];
  const times  = [];
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
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    const prevSel = ans[idx];
    if (prevSel !== undefined){
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

  /* ---------- 응답 처리 ---------- */
  function choose(s){
    const elapsed = (Date.now() - startTime)/1000;
    times[idx] = elapsed;

    const k = Q[idx].k;
    const w = getWeight(elapsed); // 0.8~1.2 (20% 캡)
    ans[idx] = s;

    const adjusted = s + (s * (w - 1) * 0.2);
    score[k]  += adjusted;
    count[k]  += 1;

    next();
  }

  function next(){ idx++; (idx < Q.length) ? render() : finish(); }

  prevBtn?.addEventListener('click', ()=>{
    if(idx===0) return;
    idx--;
    recalc(idx);
    render();
  });
  skipBtn?.addEventListener('click', ()=>{
    ans[idx]=0; times[idx]=(Date.now()-startTime)/1000; next();
  });

  function recalc(end){
    score.A=score.N=score.C=score.S=0;
    count.A=count.N=count.C=count.S=0;
    for(let i=0;i<end;i++){
      const s = ans[i] ?? 0;
      const k = Q[i].k;
      const w = getWeight(times[i] ?? 0);
      const adjusted = s + (s*(w-1)*0.2);
      score[k]+=adjusted; count[k]+=1;
    }
  }

  function getWeight(sec){
    if(sec < 1)  return 0.9;   // 급반응 약감
    if(sec < 4)  return 1.0;   // 정상
    if(sec < 8)  return 1.15;  // 숙고 +
    return 1.10;               // 과숙고 상한
  }

  /* ---------- 분류 ---------- */
  const MAP = {
    'AN':'FOX',      // 활동+새로움
    'AC':'OTTER',    // 활동+공감
    'AS':'CAT',      // 활동+신중
    'CN':'DOLPHIN',  // 공감+새로움
    'CS':'PENGUIN',  // 공감+신중
    'NS':'OWL'       // 새로움+신중
  };
  const IMG = {
    FOX     : '../assets/animals/fox.png',
    OTTER   : '../assets/animals/otter.png',
    CAT     : '../assets/animals/cat.png',
    DOLPHIN : '../assets/animals/dolphin.png',
    PENGUIN : '../assets/animals/penguin.png',
    OWL     : '../assets/animals/owl.png'
  };
  const COPY = {
    FOX: {
      title:'🦊 여우형', quote:'“일단 해보고 배우자!”',
      desc:'기민하고 재치 있는 도전자. 새로운 판을 여는 데 주저 없고, 임기응변이 빠릅니다. 실패도 데이터로 수집!',
      mood:['활동성 — 높음','새로움 — 탐색 중','공감 — 가벼움','신중 — 유연'],
      remind:'오늘의 1실험: 10분짜리 새 시도. 끝나면 배운 점 1줄 기록.'
    },
    OTTER: {
      title:'🦦 수달형', quote:'“같이 하면 더 재밌지!”',
      desc:'분위기 메이커 팀플레이어. 연결될수록 에너지가 커지고 주변을 부드럽게 묶어줍니다.',
      mood:['활동성 — 쾌활','새로움 — 낙천','공감 — 높음','신중 — 보통'],
      remind:'연락 1건 먼저! “요즘 어때?” 한 문장으로 연결 재개.'
    },
    CAT: {
      title:'🐱 고양이형', quote:'“거리는 내가 정해. 정성은 진심으로.”',
      desc:'자율/집중이 강점. 필요할 때 번개처럼 움직이고, 에너지 관리에 능합니다.',
      mood:['활동성 — 선택적','새로움 — 호기심','공감 — 섬세','신중 — 높음'],
      remind:'혼자만의 골든타임 30분 확보. 방해 알림 OFF.'
    },
    DOLPHIN: {
      title:'🐬 돌고래형', quote:'“센스와 배려의 콜라보!”',
      desc:'영리하고 감각적인 조정자. 공감과 창의의 조합으로 흐름을 매끄럽게 바꿉니다.',
      mood:['활동성 — 적정','새로움 — 높음','공감 — 높음','신중 — 부드럼'],
      remind:'아이디어 1가지 즉시 미니 실행 → 피드백 1줄 받기.'
    },
    PENGUIN: {
      title:'🐧 펭귄형', quote:'“천천히, 하지만 함께.”',
      desc:'의리 있고 성실한 협력가. 함께 가는 길을 좋아하며 꾸준함이 무기입니다.',
      mood:['활동성 — 잔잔','새로움 — 차분','공감 — 따뜻','신중 — 높음'],
      remind:'루틴에 “작은 예외 규칙” 추가: 무리 없이 궤도 유지.'
    },
    OWL: {
      title:'🦉 부엉이형', quote:'“빨리보다 정확하게.”',
      desc:'차분한 통찰가. 새로움도 구조 안에서 섬세하게 다루고, 근거 기반 결정을 중시합니다.',
      mood:['활동성 — 절제','새로움 — 탐구','공감 — 담백','신중 — 높음'],
      remind:'탐색 시간 20분 → 결론 1줄 → 작은 실행.'
    }
  };

  function normalize(){
    const nA = (score.A/Math.max(1,count.A))/4;
    const nN = (score.N/Math.max(1,count.N))/4;
    const nC = (score.C/Math.max(1,count.C))/4;
    const nS = (score.S/Math.max(1,count.S))/4;
    const clamp = (v)=>Math.max(0,Math.min(1,v));
    return {A:clamp(nA), N:clamp(nN), C:clamp(nC), S:clamp(nS)};
  }

  function classify(){
    const n = normalize();
    const arr = Object.entries(n).sort((a,b)=>b[1]-a[1]); // desc
    // 상위 2축 선택, 완전동률일 때 A>N>C>S 우선순위로 타이브레이크
    const [k1,v1]=arr[0], [k2,v2]=arr[1], [k3,v3]=arr[2];
    const near  = (a,b)=> Math.abs(a-b) < 0.06; // 접전 허용폭 축소
    let top = [k1,k2];

    // 드물게 v2≈v3까지 완전 난전이면 A>N>C>S 우선순위로 두 축 결정
    if (near(v2,v3) && near(v1,v2)) {
      const order = ['A','N','C','S'];
      top = order.filter(k=>[k1,k2,k3].includes(k)).slice(0,2);
    }

    const key = top.sort().join(''); // 'AN' 등
    return { type: MAP[key] || 'FOX', n };
  }

  /* ---------- 상태 라벨 & 미터 ---------- */
  function label(p){ // 0~100
    if(p>=76) return '높음';
    if(p>=56) return '적정';
    if(p>=36) return '보통';
    if(p>=21) return '낮음';
    return '아주 낮음';
  }
  function meters(n){ // n: 0~1
    const pct = (v)=>Math.round(v*100);
    const items = [
      {k:'A', name:'활동성', v:pct(n.A)},
      {k:'N', name:'새로움', v:pct(n.N)},
      {k:'C', name:'공감', v:pct(n.C)},
      {k:'S', name:'신중', v:pct(n.S)}
    ];
    return items.map(it=>`
      <div style="text-align:left;margin:6px 0">
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${it.name} — ${label(it.v)}</span>
          <span>${it.v}%</span>
        </div>
        <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
          <span style="display:block;height:100%;width:${it.v}%;background:var(--mint-500)"></span>
        </div>
      </div>
    `).join('');
  }

  /* ---------- 결과 렌더 ---------- */
  function finish(){
    card.style.display = 'none';
    barFill.style.width = '100%';

    const res  = classify();
    const info = COPY[res.type];
    const img  = IMG[res.type];

    const moodSummary = `• ${info.mood[0]}  • ${info.mood[1]}  • ${info.mood[2]}  • ${info.mood[3]}`;

    const html = `
      <div class="result-card">
        <div class="result-hero">
          <img src="${img}" alt="${info.title}" onerror="this.style.display='none'">
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
          ${meters(res.n)}
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