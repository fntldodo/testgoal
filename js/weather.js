/* ===================================================
 * 마음 기상예보 (5지선다 + 시간 보조 가중치 ±20%)
 * ---------------------------------------------------
 * - 답변 점수가 최우선(0~4). 시간은 보조(선택 뒤엎지 않음)
 * - 유형: SUNNY / CLOUDY / RAINY / STORM / RAINBOW / NIGHT (6종)
 * - 질문: 12문항(유형당 2문항씩)
 * =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 12문항: 각 유형별 2문항
  const Q = [
    {k:'SUNNY',   q:'오늘 나는 새로운 일을 시작해도 잘 해낼 수 있을 것 같다.'},
    {k:'SUNNY',   q:'내가 웃으면 주변 공기도 가벼워지는 느낌이 든다.'},

    {k:'CLOUDY',  q:'머릿속에 생각이 많아 말보단 관찰이 먼저다.'},
    {k:'CLOUDY',  q:'나만의 속도로 천천히 상황을 파악하고 싶다.'},

    {k:'RAINY',   q:'감정 기복이 있어도 감정을 억누르기보다 느껴보려 한다.'},
    {k:'RAINY',   q:'혼자 음악을 들으며 감정을 정리하면 마음이 편해진다.'},

    {k:'STORM',   q:'답답함이 쌓이면 한번에 터뜨려 정리하는 편이다.'},
    {k:'STORM',   q:'중요한 순간엔 강하게 밀어붙이는 에너지가 생긴다.'},

    {k:'RAINBOW', q:'힘든 시기에도 작은 즐거움을 찾아 나를 일으킨다.'},
    {k:'RAINBOW', q:'문제가 해결되면 금방 웃음을 되찾는 편이다.'},

    {k:'NIGHT',   q:'혼자 있는 시간이 깊어질수록 나를 더 잘 알게 된다.'},
    {k:'NIGHT',   q:'조용한 집중의 시간에서 에너지가 충전된다.'},
  ];

  // 점수 & 상태
  let idx = 0;
  const score  = {SUNNY:0, CLOUDY:0, RAINY:0, STORM:0, RAINBOW:0, NIGHT:0};
  const counts = {SUNNY:0, CLOUDY:0, RAINY:0, STORM:0, RAINBOW:0, NIGHT:0};
  const ans    = [];   // 원점수(0~4)
  const times  = [];   // 응답시간(초)
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
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;

    const prevSel = ans[idx];
    if (prevSel !== undefined){
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }

    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 150);
      });
    });

    startTime = Date.now();
  }

  /* ---------- 시간 보조 가중치 ---------- */
  function getWeight(sec){
    // 0.8 ~ 1.2 범위 (선택 뒤엎지 않도록 20% 캡)
    if(sec < 1)  return 0.9;   // 너무 빠르면 -10%
    if(sec < 4)  return 1.0;   // 정상
    if(sec < 8)  return 1.15;  // 숙고 +15%
    return 1.1;                // 아주 오래: +10%
  }

  /* ---------- 응답 ---------- */
  function choose(s){
    const elapsed = (Date.now() - startTime)/1000;
    times[idx] = elapsed;

    const k = Q[idx].k;
    const w = getWeight(elapsed);
    ans[idx] = s;

    const adjusted = s + (s * (w - 1) * 0.2); // 보조(±20%)
    score[k]  += adjusted;
    counts[k] += 1;

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
    times[idx] = (Date.now() - startTime)/1000;
    next();
  });

  function recalc(end){
    // 되돌아가면 처음부터 end-1까지 재집계
    Object.keys(score).forEach(k=>score[k]=0);
    Object.keys(counts).forEach(k=>counts[k]=0);
    for(let i=0;i<end;i++){
      const s = ans[i] ?? 0;
      const k = Q[i].k;
      const w = getWeight(times[i] ?? 0);
      const adjusted = s + (s * (w - 1) * 0.2);
      score[k]  += adjusted;
      counts[k] += 1;
    }
  }

  /* ---------- 결과 사전 ---------- */
  const IMG = {
    SUNNY   : '../assets/weather/weather_sunny.png',
    CLOUDY  : '../assets/weather/weather_cloudy.png',
    RAINY   : '../assets/weather/weather_rainy.png',
    STORM   : '../assets/weather/weather_storm.png',
    RAINBOW : '../assets/weather/weather_rainbow.png',
    NIGHT   : '../assets/weather/weather_night.png',
  };

  const COPY = {
    SUNNY: {
      title:'☀️ 맑음 — 에너지 충만형',
      long: `당신의 존재는 주변에 햇살처럼 퍼집니다. 새로운 일을 시작할 때
      두려움보다 호기심과 기대가 앞서고, 시도를 통해 배우는 속도가 빠릅니다.
      가벼운 농담과 미소로 분위기를 부드럽게 만들고, 팀에서는 자연스럽게
      모두의 텐션을 올리는 역할을 맡곤 해요. 다만 스스로의 속도를 잊고
      과부하가 걸릴 때가 있으니, ‘짧은 햇빛 휴식(물 한 잔, 3분 스트레칭)’ 같은
      미니 충전 루틴을 챙겨보세요.`,
      tips:['아침 루틴 3분 햇빛 충전','1일 1가벼운 시도 기록','텐션 낮은 날엔 속도 80%로']
    },
    CLOUDY: {
      title:'☁️ 흐림 — 사색적 관찰형',
      long:`지금의 당신은 내면의 구름을 차분히 바라보는 중입니다. 말보다
      관찰과 해석이 먼저 나오고, 서두르기보다 정확히 이해하고 싶어 해요.
      이 시간은 생각의 결을 다듬고 진짜 필요를 구분해 줍니다. 다만
      ‘과도한 분석 → 행동 지연’ 루프에 빠지지 않도록, 작게라도 손을
      움직이는 기준(5분 규칙, 한 문장 노트)을 마련해 보세요.`,
      tips:['5분만 손대기 규칙','노트: 오늘 감정 한 줄','결정은 옵션 3개 이하']
    },
    RAINY: {
      title:'🌧 비 — 감성 섬세형',
      long:`감정의 결을 섬세하게 느끼는 사람입니다. 비처럼 조용히 흘러가는
      마음을 억누르지 않고 통과시키는 태도 덕분에, 당신 주변의 사람들은
      위로받습니다. 다만 감정의 파도에 오래 머물면 체력이 떨어질 수 있어요.
      ‘감정 표류 → 감정 기록 → 작은 케어’의 3단계로 마무리를 지어 보세요.`,
      tips:['감정 기록 3줄(사건/감정/바람)','10분 산책 + 음악','따뜻한 음료로 마무리']
    },
    STORM: {
      title:'🌩 폭풍 — 강렬한 표현형',
      long:`밀려온 파도를 정면으로 가르는 힘이 있습니다. 답답함이 쌓이면
      한 번에 강하게 추진해 판을 뒤집기도 하죠. 그 열정은 큰 변화를 만드는
      추진력입니다. 다만 순간의 강도 때문에 관계가 소모되지 않게,
      ‘세게 말하되 분량은 짧게(3문장 규칙)’를 추천합니다. 끝엔 꼭
      요약/다짐 한 줄로 에너지를 수습하세요.`,
      tips:['감정 발화 3문장 규칙','쟁점/요약/다짐 한 줄','강한 날엔 휴식도 강하게']
    },
    RAINBOW: {
      title:'🌈 무지개 — 회복형 낙천가',
      long:`어려움 속에서도 의미와 유머를 찾아 다시 떠오르는 회복력이
      탁월합니다. 당신의 웃음은 주변까지 비추는 조명이에요. 단,
      ‘괜찮은 척’이 습관이 되면 신호를 놓칠 수 있으니, 스스로에게도
      정직한 체크인을 해보세요. 회복의 기록을 남길수록 다음 무지개는
      더 빨리 피어납니다.`,
      tips:['하루 1회 “요즘 나 어때?” 체크','작은 기쁨 3개 기록','회복 루틴 플레이리스트']
    },
    NIGHT: {
      title:'🌙 밤 — 내면 탐색형',
      long:`고요 속에서 깊어지는 사람입니다. 혼자 있는 시간에 생각이
      명료해지고 창의적인 연결이 자주 떠오르죠. 이 내면의 심도는
      당신의 장기 프로젝트에 큰 힘이 됩니다. 다만 고립과 충전을 구분하기
      어려울 때가 있어요. ‘외부 접속 1, 내부 접속 2’의 비율로
      하루 균형을 잡아보세요(연락 1, 사색/집중 2).`,
      tips:['연락 1 : 사색/집중 2','딥워크 타이머(50-10)','야간 루틴: 조도 낮추기']
    }
  };

  /* ---------- 분류 ---------- */
  function classify(sc){
    // 최댓값 유형 선택(동점 시 우선순위)
    const order = ['SUNNY','RAINBOW','CLOUDY','RAINY','STORM','NIGHT'];
    const entries = Object.entries(sc).sort((a,b)=>b[1]-a[1]);
    const topVal = entries[0][1];
    const ties = entries.filter(([,v]) => Math.abs(v - topVal) < 0.0001).map(([k])=>k);
    if(ties.length===1) return ties[0];
    // 동점: 정해둔 우선순위로
    return order.find(k => ties.includes(k)) || entries[0][0];
  }

  /* ---------- 축별 미터 ---------- */
  function meters(sc){
    const maxPerType = 2 * 4; // 문항2 × 점수최대4
    return Object.keys(sc).map(k=>{
      const name = ({
        SUNNY:'맑음', CLOUDY:'흐림', RAINY:'비',
        STORM:'폭풍', RAINBOW:'무지개', NIGHT:'밤'
      })[k];
      const pct = Math.round((sc[k]/maxPerType)*100);
      return `<div style="text-align:left;margin:6px 0">
        <div style="display:flex;justify-content:space-between;font-weight:700">
          <span>${name}</span><span>${pct}%</span>
        </div>
        <div style="height:8px;background:var(--mint-200);border-radius:999px;overflow:hidden">
          <span style="display:block;height:100%;width:${pct}%;background:var(--mint-500)"></span>
        </div>
      </div>`;
    }).join('');
  }

  /* ---------- 종료 ---------- */
  function finish(){
    card.style.display = 'none';
    barFill.style.width = '100%';

    const type = classify(score);
    const info = COPY[type];
    const img  = IMG[type];

    const answered = ans.filter(v => v !== undefined).length || 1;
    const totalAdj = Object.values(score).reduce((a,b)=>a+b,0);
    const avgAll   = (totalAdj / answered).toFixed(1);
    const avgTime  = times.length? (times.reduce((a,b)=>a+b,0)/times.length).toFixed(1):'0.0';

    const html = `
      <div class="result-card">
        <div class="result-hero">
          <img src="${img}" alt="${info.title}" onerror="this.style.display='none'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc" style="margin-top:4px">평균 점수 <b>${avgAll}</b>/4.0 · 평균 응답 <b>${avgTime}s</b></div>
          </div>
        </div>

        <p style="margin:10px 0; line-height:1.65">${info.long}</p>

        <div style="margin:10px 0">${meters(score)}</div>

        <div style="margin:8px 0 2px">
          ${info.tips.map(t=>`<div class="pill">${t}</div>`).join('')}
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