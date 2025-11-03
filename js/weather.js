document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'S', q:'아침에 일어났을 때 가벼운 기분으로 하루를 시작한다.'},
    {k:'S', q:'요즘 마음속에 햇살처럼 따뜻한 감정이 있다.'},
    {k:'C', q:'무기력하거나 이유 없이 다운되는 시간이 있다.'},
    {k:'C', q:'주변의 시선보다 내 내면의 상태가 더 중요하다.'},
    {k:'R', q:'감정이 자주 흔들리고 쉽게 눈물이 난다.'},
    {k:'R', q:'감정이 복잡할 때 기록하거나 표현하려 한다.'},
    {k:'T', q:'불안하거나 압박감을 느끼는 순간이 많다.'},
    {k:'T', q:'최근 감정의 폭이 크다고 느낀다.'},
    {k:'B', q:'힘든 시기에도 희망을 쉽게 잃지 않는다.'},
    {k:'B', q:'감정의 회복이 빠른 편이다.'},
    {k:'N', q:'고요함이나 혼자 있는 시간을 좋아한다.'},
    {k:'N', q:'밤이 되면 감정이 정리되는 느낌을 받는다.'},
    {k:'S', q:'하루 중 웃는 시간이 많다고 느낀다.'},
    {k:'B', q:'최근 스스로를 다독인 경험이 있다.'},
    {k:'C', q:'마음이 쉽게 지치거나 무기력해지는 편이다.'}
  ];

  let idx = 0;
  const score = {S:0, C:0, R:0, T:0, B:0, N:0};
  const ans = [];
  const qText = document.getElementById('qText');
  const wrap = document.getElementById('choiceWrap');
  const stepLabel = document.getElementById('stepLabel');
  const barFill = document.getElementById('barFill');
  const card = document.getElementById('card');
  const result = document.getElementById('result');

  function render() {
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width = `${(idx / Q.length) * 100}%`;
    qText.textContent = Q[idx].q;
    wrap.innerHTML = `
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice" data-s="1">아니다</button>
      <button class="choice" data-s="0">전혀 아니다</button>
    `;
    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click',()=>{
        Array.from(wrap.children).forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),180);
      });
    });
  }

  function choose(s){ ans[idx]=s; score[Q[idx].k]+=s; next(); }
  function next(){ idx++; if(idx<Q.length) render(); else finish(); }

  function classify(sc){
    const arr = [
      {k:'S',v:sc.S},{k:'C',v:sc.C},{k:'R',v:sc.R},
      {k:'T',v:sc.T},{k:'B',v:sc.B},{k:'N',v:sc.N}
    ];
    arr.sort((a,b)=>b.v-a.v);
    return arr[0].k;
  }

  const WEATHER = {
    S:{img:'../assets/weather/weather_sunny.png', title:'☀️ 맑음 — 활력형', quote:'“오늘의 마음은 투명한 햇살처럼 가볍습니다.”',
      desc:'당신은 긍정적 에너지가 가득한 상태예요. 자신을 믿고 하루를 시작할 수 있는 안정감이 느껴집니다. 주변 사람들에게도 좋은 파동을 주는 존재입니다.',
      feeling:'감정의 온도는 따뜻하고 맑습니다. 자신감과 활력이 고르게 퍼져 있어요.',
      remind:''},
    C:{img:'../assets/weather/weather_cloudy.png', title:'☁️ 흐림 — 사색형', quote:'“마음의 하늘엔 살짝 구름이 낀 듯, 조용한 사색의 시간이에요.”',
      desc:'지금의 당신은 조용하고 내면적인 흐름 속에 있습니다. 감정이 안정적이지만 에너지가 살짝 줄었어요. 생각이 많은 시기일 수 있습니다.',
      feeling:'기압은 안정적이나 햇살이 살짝 약한 상태예요. 이 시간은 스스로를 성찰하기에 좋습니다.',
      remind:'조용한 카페나 산책으로 머릿속 구름을 잠시 흘려보내세요.'},
    R:{img:'../assets/weather/weather_rainy.png', title:'🌧 비 — 감성 섬세형', quote:'“감정의 결이 비처럼 세밀하게 스며듭니다.”',
      desc:'감정의 진폭이 커지고, 작은 일에도 마음이 움직이는 시기예요. 당신은 깊은 감수성을 지닌 사람입니다.',
      feeling:'습도가 살짝 높아요. 마음의 감각이 예민해진 만큼, 충분한 휴식이 필요합니다.',
      remind:'감정일기나 따뜻한 차 한 잔으로 마음을 가볍게 해주세요.'},
    T:{img:'../assets/weather/weather_storm.png', title:'🌪 폭풍 — 불안형', quote:'“감정의 바람이 강하게 부는 날, 중심을 잃지 않도록.”',
      desc:'최근 감정의 파도가 거세게 일고 있을 수 있습니다. 피로감, 불안, 자기비판이 함께 찾아올 때예요.',
      feeling:'기압이 불안정하며, 마음의 바람이 강하게 불고 있습니다.',
      remind:'지금은 생각보다 휴식이 필요합니다. 잠깐의 멈춤이 내일의 안정이 됩니다.'},
    B:{img:'../assets/weather/weather_rainbow.png', title:'🌈 무지개 — 회복형', quote:'“비가 그친 뒤의 공기, 그 사이에서 다시 피어나는 당신.”',
      desc:'당신은 스스로의 회복력을 증명하고 있어요. 감정이 정리되고, 마음의 균형이 서서히 돌아오고 있습니다.',
      feeling:'하늘에 희미한 햇살이 비치듯, 감정의 조화가 회복되고 있습니다.',
      remind:''},
    N:{img:'../assets/weather/weather_night.png', title:'🌙 밤 — 사색·내면형', quote:'“고요함 속에서 마음의 별빛을 발견하는 시간.”',
      desc:'당신은 지금 사색의 시기에 있습니다. 혼자 있는 시간이 필요하거나, 마음의 정리가 진행 중이에요.',
      feeling:'감정은 잔잔하고, 내면의 목소리가 또렷이 들립니다.',
      remind:'조용한 음악과 함께 하루를 정리해보세요.'}
  };

  function finish(){
    card.style.display='none';
    barFill.style.width='100%';
    const type = classify(score);
    const c = WEATHER[type];
    const remindHTML = c.remind ? `<div class="remind"><b>🌿 마음 리마인드</b><p>${c.remind}</p></div>` : '';
    result.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <img src="${c.img}" alt="${c.title}">
          <div>
            <div class="result-title">${c.title}</div>
            <div class="result-desc">${c.quote}</div>
          </div>
        </div>
        <p>${c.desc}</p>
        <p style="margin:8px 0 6px;color:var(--text-soft)">${c.feeling}</p>
        ${remindHTML}
        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;
    result.style.display='block';
  }

  render();
});
