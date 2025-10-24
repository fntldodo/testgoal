// 감정 vs 논리 밸런스 (식물 결과 버전)
console.log('plant.js v1 loaded');

document.addEventListener('DOMContentLoaded', () => {
  // 15문항 (E:감정, L:논리, B:균형)
  const Q = [
    {k:'E', q:'상대의 말보다 표정을 먼저 읽는다.'},
    {k:'E', q:'감정에 따라 하루 에너지가 크게 달라진다.'},
    {k:'E', q:'결정 전에 “기분이 어떤가”를 먼저 본다.'},
    {k:'E', q:'위로의 말 한마디가 큰 힘이 된다.'},
    {k:'E', q:'누군가의 슬픔을 보면 쉽게 공감한다.'},

    {k:'L', q:'논리적으로 틀린 말을 들으면 바로잡고 싶다.'},
    {k:'L', q:'감정보다 사실 확인이 더 중요하다.'},
    {k:'L', q:'감정이 흔들릴 때, 분석하며 정리하려 한다.'},
    {k:'L', q:'문제는 감정보다 구조를 바꿔야 해결된다고 생각한다.'},
    {k:'L', q:'감정 표현보다 명확한 계획이 편하다.'},

    {k:'B', q:'감정과 생각이 싸울 때, 적당히 조율하려 한다.'},
    {k:'B', q:'이해되지 않아도 “그럴 수도 있지”라고 생각한다.'},
    {k:'B', q:'감정과 논리를 번갈아 써가며 설득한다.'},
    {k:'B', q:'상황에 맞춰 감정·논리 모드를 전환할 수 있다.'},
    {k:'B', q:'결국 중요한 건 마음의 평형이라 생각한다.'}
  ];

  let idx = 0;
  const score = {E:0, L:0, B:0};
  const ans = [];

  // DOM
  const stepLabel = document.getElementById('stepLabel');
  const barFill   = document.getElementById('barFill');
  const qText     = document.getElementById('qText');
  const wrap      = document.getElementById('choiceWrap');
  const card      = document.getElementById('card');
  const resultBox = document.getElementById('result');
  const prevBtn   = document.getElementById('prev');
  const skipBtn   = document.getElementById('skip');

  if (!stepLabel || !barFill || !qText || !wrap || !card || !resultBox) {
    console.error('[plant.js] 필수 엘리먼트가 없습니다.');
    return;
  }

  // ----- 렌더 -----
  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width   = `${(idx/Q.length)*100}%`;
    qText.textContent     = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="3" type="button">매우 그렇다</button>
      <button class="choice" data-s="2" type="button">그렇다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>`;

    const prevSel = ans[idx];
    if (prevSel !== undefined) {
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s) === prevSel) b.classList.add('selected');
      });
    }

    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)), 120);
      });
    });
  }

  function choose(s){
    ans[idx] = s;
    score[Q[idx].k] += s;
    next();
  }

  function next(){
    idx++;
    if (idx < Q.length) render();
    else finish();
  }

  prevBtn?.addEventListener('click', ()=>{
    if (idx === 0) return;
    idx--;
    // 점수 재계산
    score.E = score.L = score.B = 0;
    for (let i=0; i<idx; i++) {
      const v = ans[i] ?? 0;
      score[Q[i].k] += v;
    }
    render();
  });

  skipBtn?.addEventListener('click', ()=>{
    ans[idx] = 0;
    next();
  });

  // ----- 분류 (식물 4종) -----
  function classify(sc){
    const e=sc.E, l=sc.L, b=sc.B;
    const max = Math.max(e,l,b);
    const min = Math.min(e,l,b);
    const spread = max - min;

    if (spread <= 3) return 'BALANCE';
    if (max === e)   return 'EMOTION';
    if (max === l)   return 'LOGIC';
    return 'HARMONY'; // max === b 또는 나머지
  }

  // 이미지 & 카피
  const IMG = {
    EMOTION : '../assets/plants/dandelion.png', // 민들레
    LOGIC   : '../assets/plants/cactus.png',    // 선인장
    HARMONY : '../assets/plants/fern.png',      // 고사리
    BALANCE : '../assets/plants/balance.png'    // 균형 몽실
  };

  const PLANTS = {
    EMOTION: {
      title:'🌼 민들레형',
      quote:'“바람에 흔들려도 다시 피어나는 건, 마음의 힘.”',
      desc:'감정에 진심인 사람. 따뜻하고 공감이 풍부한 타입.',
      tips:['감정기록 하루 1줄','기분의 온도를 말로 표현']
    },
    LOGIC: {
      title:'🌵 선인장형',
      quote:'“물을 아낄 줄 아는 자가, 더 멀리 간다.”',
      desc:'논리적이고 자립적인 사고형. 파도 속 중심을 잡는 단단함.',
      tips:['감정도 데이터로 기록','판단 뒤 감정 체크']
    },
    HARMONY: {
      title:'🌿 고사리형',
      quote:'“빛과 그늘이 모두 있어야 초록이 진해진다.”',
      desc:'상황에 따라 감정과 논리를 조율하는 균형 감각!',
      tips:['빠른 감정 전환 인정','호흡과 쉼으로 리셋']
    },
    BALANCE: {
      title:'☁️ 균형몽실형',
      quote:'“균형은 마음의 기술.”',
      desc:'감정과 논리를 고르게 쓰는 부드러운 중재자.',
      tips:['생각↔느낌 5분 루틴','균형 시그널 체크']
    }
  };

  function meters(sc){
    // 각 축 5문항 × 3점 = 15 → 백분율
    const max = 15;
    return ['E','L','B'].map(k=>{
      const name = {E:'감정', L:'논리', B:'균형'}[k];
      const pct  = Math.round(sc[k] / max * 100);
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

  function finish(){
    card.style.display = 'none';
    barFill.style.width = '100%';

    const type = classify(score);
    const img  = IMG[type] || '../assets/plant.png';
    const c    = PLANTS[type];

    const html = `
      <div class="result-card">
        <div class="result-hero">
          <img src="${img}" alt="${c.title}"
               onerror="this.onerror=null; this.src='../assets/plant.png'">
          <div>
            <div class="result-title">${c.title}</div>
            <div class="result-desc">${c.quote}</div>
          </div>
        </div>
        <p style="margin:8px 0">${c.desc}</p>
        <div style="margin-top:8px">${meters(score)}</div>
        <div style="margin-top:8px">
          ${c.tips.map(t=>`<div class="pill">${t}</div>`).join('')}
        </div>
        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;
    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
  }

  // 시작
  render();
});
