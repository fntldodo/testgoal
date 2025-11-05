/* =========================================================
 * ☁️ 마음 일기예보 — v2025.2 안정판
 * - 5지선다(0~4) + 응답시간 ±20%(선택 우선, 뒤엎지 않음)
 * - 축: P(긍정정서) / N(부정정서) / E(에너지) / C(차분·명료)
 * - 역문항: rev: true → 점수는 (4 - s)로 반전
 * - 결과: sunny / cloudy / rainy / storm / rainbow / night
 *   (assets/weather/weather_{type}.png)
 * ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // ---------- 문항(14문항) ----------
  const Q = [
    // P(긍정) 4
    {k:'P', q:'오늘은 사소한 일에도 고마움이 느껴진다.'},
    {k:'P', q:'가벼운 기대감이 마음속에서 은근히 올라온다.'},
    {k:'P', q:'내가 하는 일에서 작은 즐거움이 보인다.'},
    {k:'P', q:'몸과 마음이 전반적으로 가벼운 편이다.'},

    // N(부정) 4  (역문항: 동의할수록 부정↑ → 반전 필요)
    {k:'N', q:'자꾸 걱정이 앞서서 아무 것도 손에 잡히지 않는다.', rev:true},
    {k:'N', q:'짜증/분노가 자주 올라오고 사소한 것에 걸린다.',       rev:true},
    {k:'N', q:'오늘은 우울/허무가 커서 의욕이 잘 안 난다.',          rev:true},
    {k:'N', q:'머릿속이 복잡해서 아무 결정을 못 내리겠다.',          rev:true},

    // E(에너지) 3
    {k:'E', q:'움직이면 금방 탄력이 붙는 느낌이다.'},
    {k:'E', q:'집중을 시작하면 꽤 오래 유지되는 편이다.'},
    {k:'E', q:'필요한 일을 처리할 힘이 충분하다고 느낀다.'},

    // C(차분·명료) 3
    {k:'C', q:'마음의 속도가 안정적이고 호흡이 고르게 느껴진다.'},
    {k:'C', q:'생각이 정리되어 우선순위가 비교적 분명하다.'},
    {k:'C', q:'감정의 파도가 지나가더라도 금방 균형을 회복한다.'}
  ]; // 총 14

  // ---------- 상태 ----------
  let idx = 0, start = Date.now();
  const score = {P:0,N:0,E:0,C:0}, count = {P:0,N:0,E:0,C:0};
  const ans = [], times = [];

  // ---------- DOM ----------
  const step   = document.getElementById('stepLabel');
  const bar    = document.getElementById('barFill');
  const qText  = document.getElementById('qText');
  const wrap   = document.getElementById('choiceWrap');
  const card   = document.getElementById('card');
  const result = document.getElementById('result');
  const prev   = document.getElementById('prev');
  const skip   = document.getElementById('skip');

  // ---------- 가중 ----------
  function weight(sec){
    if(sec < 1) return 0.9;   // 너무 빠르면 -10%
    if(sec < 4) return 1.0;   // 정상
    if(sec < 8) return 1.15;  // 숙고 +
    return 1.10;              // 과숙고 +10% 캡
  }

  // ---------- 렌더 ----------
  function render(){
    step.textContent = `${idx+1} / ${Q.length}`;
    bar.style.width  = `${(idx/Q.length)*100}%`;
    qText.textContent = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4" type="button">매우 그렇다</button>
      <button class="choice" data-s="3" type="button">그렇다</button>
      <button class="choice" data-s="2" type="button">보통이다</button>
      <button class="choice ghost" data-s="1" type="button">아니다</button>
      <button class="choice ghost" data-s="0" type="button">전혀 아니다</button>
    `;

    // 이전 선택 표시
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
        setTimeout(()=>choose(Number(btn.dataset.s)), 120);
      }, {passive:true});
    });

    start = Date.now();
  }

  // ---------- 응답 ----------
  function choose(s){
    const sec = (Date.now() - start)/1000;
    const w = weight(sec);

    const item = Q[idx];
    // 역문항은 반전: (4 - s)
    const base = item.rev ? (4 - s) : s;

    // 보조 가중(±20%) — 선택 우선, 뒤엎지 않음
    const adj  = base + (base * (w - 1) * 0.2);

    ans[idx]   = s;
    times[idx] = sec;
    score[item.k] += adj;
    count[item.k] += 1;

    next();
  }

  function next(){
    idx++;
    if(idx < Q.length) render();
    else finish();
  }

  prev?.addEventListener('click', ()=>{
    if(idx === 0) return;
    idx--;
    recalc(idx);
    render();
  });

  skip?.addEventListener('click', ()=>{
    ans[idx] = 0;
    times[idx] = (Date.now() - start)/1000;
    next();
  });

  function recalc(end){
    score.P=score.N=score.E=score.C=0;
    count.P=count.N=count.E=count.C=0;
    for(let i=0;i<end;i++){
      const sec = times[i]??3, w = weight(sec);
      const item = Q[i];
      const s = ans[i]??0;
      const base = item.rev ? (4 - s) : s;
      const adj  = base + (base * (w - 1) * 0.2);
      score[item.k] += adj;
      count[item.k] += 1;
    }
  }

  // ---------- 정규화 ----------
  function normalize(){
    const n = {};
    for(const k of ['P','N','E','C']){
      const avg = (score[k] / Math.max(1, count[k])) / 4; // 0~1
      n[k] = Math.max(0, Math.min(1, avg));
    }
    return n;
  }

  // ---------- 날씨 분류 ----------
  function pickWeather(n){
    const P=n.P, N=n.N, E=n.E, C=n.C;

    // 먼저 뚜렷한 상태들
    if (N >= 0.75 && C <= 0.40) return 'storm';     // 격한 부정 + 불안정
    if (P >= 0.60 && N >= 0.60) return 'rainbow';   // 긍/부정 공존(감정 스펙트럼)
    if (P >= 0.65 && N <= 0.35 && C >= 0.55) return 'sunny'; // 맑음
    if (N >= 0.60 && C <= 0.50 && E <= 0.50) return 'rainy'; // 우울/걱정↑, 기력↓
    if (E <= 0.35 && P <= 0.40 && N <= 0.55) return 'night'; // 저에너지·무기력

    // 그 외 중간 상태
    return 'cloudy';
  }

  // ---------- 뱃지/문구 ----------
  const COPY = {
    sunny:   {title:'🌤️ 맑음',     quote:'“마음이 가벼워지는 날”',
      desc:'긍정과 안정이 조화를 이루는 상태예요. 오늘의 속도를 살리되, 무리하지 않고 리듬을 이어가면 좋아요.',
      remind:'좋았던 순간 1가지를 저장해 내일의 시동으로 쓰세요.'},
    cloudy:  {title:'🌥️ 구름 많음', quote:'“조금은 둔탁하지만 괜찮아”',
      desc:'큰 문제는 없지만 선명도가 떨어지는 상태예요. 해야 할 것 한 가지를 작게 쪼개서 시작해 보세요.',
      remind:'타이머 10분만 켜고, 가장 쉬운 일 1개만.'},
    rainy:   {title:'🌧️ 비',       quote:'“마음이 눅눅해진 날”',
      desc:'우울·걱정이 늘어 기동성이 낮아진 상태예요. 젖은 생각을 말로 털어내고, 작은 몸 움직임으로 온도를 올려요.',
      remind:'창문 열고 깊은 호흡 5번 + 3분 정리.'},
    storm:   {title:'⛈️ 폭풍',     quote:'“감정의 파도가 큰 날”',
      desc:'분노/불안이 커서 흐름 제어가 어려울 수 있어요. 강한 에너지는 안전한 출구로 빼주면 금방 가라앉습니다.',
      remind:'걷기 7분 + 찬물 세수. 말은 잠시 보류.'},
    rainbow: {title:'🌈 무지개',    quote:'“섞였지만, 그래서 아름답다”',
      desc:'긍정과 부정이 함께 큰 상태예요. 감정의 스펙트럼을 인정하고, 의미 있는 한 조각을 실천으로 연결해요.',
      remind:'좋았던 1가지를 바로 실행, 힘들었던 1가지는 기록.'},
    night:   {title:'🌙 밤',        quote:'“불 끄고 쉬어가는 시간”',
      desc:'에너지가 낮고 감정도 잔잔/무기력한 상태예요. 오늘은 과감히 줄이고 회복을 최우선으로.',
      remind:'수면 알람 설정 + 화면 밝기 낮춤 + 따뜻한 음료.'}
  };

  function label(p){
    if(p>=0.80) return '매우 높음';
    if(p>=0.60) return '높음';
    if(p>=0.40) return '보통';
    if(p>=0.20) return '낮음';
    return '매우 낮음';
  }

  function meters(n){
    const rows = [
      ['P','긍정'],
      ['N','부정'],
      ['E','에너지'],
      ['C','차분·명료']
    ];
    return `
      <div class="state-meter">
        ${rows.map(([k,name])=>{
          const pct = Math.round((n[k]??0)*100);
          return `
            <div class="row">
              <span><b>${name}</b></span>
              <div class="bar"><span class="fill" style="width:${pct}%"></span></div>
              <span class="meter-label">${label(pct/100)}${pct?` (${pct}%)`:''}</span>
            </div>`;
        }).join('')}
      </div>`;
  }

  // ---------- 결과 ----------
  function finish(){
    card.style.display = 'none';
    bar.style.width = '100%';

    const n   = normalize();
    const wth = pickWeather(n);
    const info = COPY[wth];

    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero result-hero--big">
          <img class="animal-hero" src="../assets/weather/weather_${wth}.png"
               alt="${info.title}" onerror="this.src='../assets/mongsil.png'">
          <div>
            <div class="result-title">${info.title}</div>
            <div class="result-desc">${info.quote}</div>
          </div>
        </div>

        <p style="margin:8px 0">${info.desc}</p>

        ${meters(n)}

        <div class="mind-remind" style="margin-top:8px;color:var(--text-soft)">
          <b>🌿 마음 리마인드:</b> ${info.remind}
        </div>

        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" type="button" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>
    `;
    result.style.display = 'block';
  }

  // 시작
  render();
});