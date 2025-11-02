/* ===========================================
 * 마음 일기예보 ☁️ (Emotional Weather Forecast)
 * 몽실몽실 기본 프롬프트 기반
 * =========================================== */
document.addEventListener('DOMContentLoaded', () => {
  const Q = [
    {k:'SUN', q:'오늘의 나는 기분이 대체로 맑다고 느낀다.'},
    {k:'SUN', q:'사소한 일에도 감사함을 느끼는 편이다.'},
    {k:'CLOUD', q:'요즘 생각이 많고 머리가 자주 복잡하다.'},
    {k:'CLOUD', q:'내 마음을 스스로도 정리하기 어렵다고 느낀다.'},
    {k:'RAIN', q:'작은 일에도 눈물이 나거나 감정이 흔들린다.'},
    {k:'RAIN', q:'감정 기복이 크고 예민해진 느낌이 있다.'},
    {k:'STORM', q:'한 번 마음이 불타면 멈추기 어렵다.'},
    {k:'STORM', q:'요즘 감정의 폭이 커서 주변에 영향이 간다.'},
    {k:'RAINBOW', q:'힘든 일이 있었지만 다시 웃을 수 있을 것 같다.'},
    {k:'RAINBOW', q:'요즘 마음속에 희망이 조금씩 돌아온다.'},
    {k:'NIGHT', q:'혼자 있는 시간이 가장 편하게 느껴진다.'},
    {k:'NIGHT', q:'소음보다 조용한 공간이 더 안정감을 준다.'},
    {k:'SUN', q:'오늘의 나를 꽤 괜찮다고 느낀다.'},
    {k:'RAIN', q:'감정 표현이 많아지거나 불안정할 때가 있다.'},
    {k:'NIGHT', q:'차분히 내면을 들여다보는 시간이 좋다.'}
  ];

  const score = {SUN:0,CLOUD:0,RAIN:0,STORM:0,RAINBOW:0,NIGHT:0};
  const ans=[]; let idx=0; let start=Date.now();

  const qText=document.getElementById('qText');
  const wrap=document.getElementById('choiceWrap');
  const stepLabel=document.getElementById('stepLabel');
  const barFill=document.getElementById('barFill');
  const result=document.getElementById('result');
  const card=document.getElementById('card');
  const prevBtn=document.getElementById('prev');
  const skipBtn=document.getElementById('skip');

  function render(){
    stepLabel.textContent = `${idx+1} / ${Q.length}`;
    barFill.style.width = `${(idx/Q.length)*100}%`;
    qText.textContent = Q[idx].q;

    wrap.innerHTML = `
      <button class="choice" data-s="4">매우 그렇다</button>
      <button class="choice" data-s="3">그렇다</button>
      <button class="choice" data-s="2">보통이다</button>
      <button class="choice ghost" data-s="1">아니다</button>
      <button class="choice ghost" data-s="0">전혀 아니다</button>
    `;
    const prevSel=ans[idx];
    if(prevSel!==undefined){
      Array.from(wrap.children).forEach(b=>{
        if(Number(b.dataset.s)===prevSel) b.classList.add('selected');
      });
    }
    Array.from(wrap.children).forEach(btn=>{
      btn.addEventListener('click',()=>{
        Array.from(wrap.children).forEach(c=>c.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(()=>choose(Number(btn.dataset.s)),180);
      });
    });
    start=Date.now();
  }

  function choose(s){
    ans[idx]=s; score[Q[idx].k]+=s; next();
  }
  function next(){ idx++; if(idx<Q.length) render(); else finish(); }
  prevBtn.addEventListener('click',()=>{ if(idx===0)return; idx--; render(); });
  skipBtn.addEventListener('click',()=>{ ans[idx]=0; next(); });

  function classify(sc){
    const arr=Object.entries(sc).sort((a,b)=>b[1]-a[1]);
    const top=arr[0][0];
    return top;
  }

  const TYPES={
    SUN:{
      title:'☀️ 맑음 — 마음이 맑은 날',
      desc:`햇살처럼 부드럽고 투명한 기운이 감돌아요.  
오늘의 당신은 소소한 순간에도 기쁨을 발견하고,  
자신을 따뜻하게 바라보는 힘이 생겼어요.`,
      mood:`🌤 **마음 일기예보**  
정서가 안정되어 있으며, 내면의 햇살이 고요히 퍼지고 있습니다.  
이 평온함이 영원할 필요는 없어요. 구름이 와도 하늘은 변치 않듯,  
당신의 마음도 본래 밝음을 품고 있답니다.`,
      img:'../assets/weather/sunny.png'
    },
    CLOUD:{
      title:'☁️ 흐림 — 잠시 흐린 마음',
      desc:`생각이 잦고, 머릿속 구름이 천천히 지나가고 있어요.  
스스로를 정리하고 싶은 욕구가 강해지는 시기입니다.`,
      mood:`☁️ **마음 일기예보**  
조금 멈춰 서도 괜찮아요. 마음의 구름은 정리를 위한 준비예요.  
할 일을 3가지로 줄이고, 한숨 돌리며 하늘의 색이 바뀌길 기다려주세요.`,
      img:'../assets/weather/cloudy.png'
    },
    RAIN:{
      title:'🌧️ 비 — 눈물이 맺힌 날',
      desc:`감정이 예민하고 감수성이 깊어지는 날이에요.  
이 시기의 눈물은 마음이 정화되는 자연스러운 과정이에요.`,
      mood:`🌧 **마음 일기예보**  
감정이 커질수록 내면의 색이 진해집니다.  
오늘은 자신에게 ‘괜찮아’를 한 번만 더 건네주세요.  
눈물 뒤엔 언제나 공기처럼 맑은 감정이 남아요.`,
      img:'../assets/weather/rainy.png'
    },
    STORM:{
      title:'⛈️ 폭풍 — 마음의 소용돌이',
      desc:`집중과 열정이 폭발하는 시기예요.  
무언가에 강하게 몰입하지만, 동시에 쉽게 지칠 수 있어요.`,
      mood:`⛈ **마음 일기예보**  
당신의 에너지는 강력한 엔진이에요.  
하지만 엔진에도 냉각수가 필요하죠.  
조금만 속도를 늦추고, 짧은 숨 고르기를 허락해 주세요.`,
      img:'../assets/weather/storm.png'
    },
    RAINBOW:{
      title:'🌈 무지개 — 회복 중인 하늘',
      desc:`다 지나갔다고 느낄 때, 희망의 빛이 스며들고 있어요.  
당신은 이미 새로운 하늘 아래 서 있어요.`,
      mood:`🌈 **마음 일기예보**  
‘다 괜찮아지려는 중’이에요. 지금의 회복은 조용하지만 분명히 진행 중입니다.  
어제보다 조금 더 웃을 수 있다면, 그것만으로 충분해요.`,
      img:'../assets/weather/rainbow.png'
    },
    NIGHT:{
      title:'🌙 밤 — 조용한 마음',
      desc:`고요하고 차분한 에너지가 깃든 시기예요.  
내면의 소리가 또렷하게 들리고, 생각이 맑아지는 시간입니다.`,
      mood:`🌙 **마음 일기예보**  
지금의 고요함은 쉼과 회복의 전조예요.  
세상의 소리를 잠시 낮추고, 당신만의 속도로 숨 쉬어보세요.  
이 밤의 평온이 곧 새로운 시작이 됩니다.`,
      img:'../assets/weather/night.png'
    }
  };

  function finish(){
    card.style.display='none'; barFill.style.width='100%';
    const type=classify(score);
    const c=TYPES[type];
    result.innerHTML=`
      <div class="result-card">
        <div class="result-hero">
          <img src="${c.img}" alt="${c.title}">
          <div>
            <div class="result-title">${c.title}</div>
            <div class="result-desc" style="white-space:pre-line">${c.desc}</div>
          </div>
        </div>
        <div style="margin-top:12px;white-space:pre-line">${c.mood}</div>
        <div class="result-actions">
          <a class="start" href="../index.html">메인으로</a>
          <button class="start" onclick="location.reload()">다시 테스트</button>
        </div>
      </div>`;
    result.style.display='block';
  }

  render();
});
